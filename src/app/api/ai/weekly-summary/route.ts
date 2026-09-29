import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeMarkdown } from "@/lib/sanitize";
import { createClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/rate-limit";
import {
  computeWeeklyQualityScore,
  type DailyLog,
  type NutritionMetrics,
} from "@/lib/scoring/weekly-quality-score";
import { generateWeeklyAdvice } from "@/lib/replicate/weekly-advice";

/**
 * The request body never needs to carry a target user id — the route always
 * operates on the authenticated user's own id. `user_id` is only accepted so
 * it can be explicitly rejected (403) when it doesn't match the caller,
 * per the ticket's isolation test ("user A tries to generate a report for
 * user B").
 */
const bodySchema = z
  .object({
    user_id: z.string().uuid().optional(),
  })
  .partial();

const rateLimiter = createRateLimiter(3, "1 h");

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Returns the 7 UTC day keys (YYYY-MM-DD) for J-7 .. J-1, oldest first. */
function getWeekDayKeys(reference: Date): string[] {
  const startOfToday = Date.UTC(
    reference.getUTCFullYear(),
    reference.getUTCMonth(),
    reference.getUTCDate()
  );

  const keys: string[] = [];
  for (let i = 7; i >= 1; i--) {
    const dayMs = startOfToday - i * MS_PER_DAY;
    keys.push(new Date(dayMs).toISOString().slice(0, 10));
  }
  return keys;
}

async function readJsonBody(request: NextRequest): Promise<unknown> {
  try {
    const text = await request.text();
    if (!text) return {};
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await readJsonBody(request);
  const parsedBody = bodySchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Never trust a client-supplied user_id: only ever operate on the
  // authenticated user's own id. If the body claims a *different* user,
  // reject outright rather than silently ignoring it.
  if (parsedBody.data.user_id && parsedBody.data.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { success: withinRateLimit } = await rateLimiter.limit(user.id);
  if (!withinRateLimit) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Maximum 3 generations per hour." },
      { status: 429 }
    );
  }

  const { data: goals, error: goalsError } = await supabase
    .from("user_goals")
    .select("daily_calories, protein_grams, carbs_grams, fat_grams")
    .eq("user_id", user.id)
    .maybeSingle();

  if (goalsError) {
    return NextResponse.json({ error: "Failed to load user goals" }, { status: 500 });
  }
  if (!goals) {
    return NextResponse.json(
      { error: "User goals are not configured yet" },
      { status: 400 }
    );
  }

  const target: NutritionMetrics = {
    calories: goals.daily_calories,
    protein: goals.protein_grams,
    carbs: goals.carbs_grams,
    fat: goals.fat_grams,
  };

  const now = new Date();
  const dayKeys = getWeekDayKeys(now);
  const rangeStartIso = `${dayKeys[0]}T00:00:00.000Z`;
  const rangeEndIso = new Date(
    new Date(`${dayKeys[dayKeys.length - 1]}T00:00:00.000Z`).getTime() + MS_PER_DAY
  ).toISOString();

  const { data: meals, error: mealsError } = await supabase
    .from("meals")
    .select("meal_type, total_calories, total_protein, total_carbs, total_fat, logged_at")
    .eq("user_id", user.id)
    .gte("logged_at", rangeStartIso)
    .lt("logged_at", rangeEndIso);

  if (mealsError) {
    return NextResponse.json({ error: "Failed to load meals" }, { status: 500 });
  }

  const totalsByDay = new Map<string, NutritionMetrics>();
  for (const meal of meals ?? []) {
    const dayKey = meal.logged_at.slice(0, 10);
    if (!dayKeys.includes(dayKey)) continue;
    const existing = totalsByDay.get(dayKey) ?? {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
    existing.calories += meal.total_calories;
    existing.protein += meal.total_protein;
    existing.carbs += meal.total_carbs;
    existing.fat += meal.total_fat;
    totalsByDay.set(dayKey, existing);
  }

  const days: DailyLog[] = dayKeys.map((key) => {
    const actual = totalsByDay.get(key);
    return actual ? { logged: true, actual } : { logged: false };
  });

  const { qualityScore, daysLogged, dayScores } = computeWeeklyQualityScore(days, target);
  const weekStartDate = dayKeys[0];

  let aiMarkdown: string;
  try {
    aiMarkdown = await generateWeeklyAdvice({
      weekStartDate,
      qualityScore,
      daysLogged,
      target,
      dayScores,
    });
  } catch (error) {
    console.error("[weekly-summary] Replicate generation failed", error);
    aiMarkdown =
      "## Bilan indisponible\n\nLe coaching IA n'a pas pu être généré pour le moment. Réessayez plus tard.";
  }

  const sanitizedMarkdown = sanitizeMarkdown(aiMarkdown);

  const { data: report, error: upsertError } = await supabase
    .from("weekly_reports")
    .upsert(
      {
        user_id: user.id,
        week_start_date: weekStartDate,
        quality_score: qualityScore,
        ai_advice_markdown: sanitizedMarkdown,
      },
      { onConflict: "user_id,week_start_date" }
    )
    .select()
    .single();

  if (upsertError) {
    return NextResponse.json({ error: "Failed to save weekly report" }, { status: 500 });
  }

  return NextResponse.json({ report }, { status: 200 });
}
