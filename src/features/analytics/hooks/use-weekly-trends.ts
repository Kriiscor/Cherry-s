"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/supabase-provider";

export type WeeklyTrendDay = {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  target_calories: number;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * The 7 UTC day keys (YYYY-MM-DD) for the rolling 7-day window ending today
 * (J-6 .. J-0, oldest first) so that the chart includes today's logged meals.
 */
function getWeekDayKeys(reference: Date): string[] {
  const startOfToday = Date.UTC(
    reference.getUTCFullYear(),
    reference.getUTCMonth(),
    reference.getUTCDate()
  );

  const keys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    keys.push(new Date(startOfToday - i * MS_PER_DAY).toISOString().slice(0, 10));
  }
  return keys;
}

async function fetchWeeklyTrends(userId: string): Promise<WeeklyTrendDay[]> {
  const supabase = createClient();
  const dayKeys = getWeekDayKeys(new Date());
  const rangeStartIso = `${dayKeys[0]}T00:00:00.000Z`;
  const rangeEndIso = new Date(
    new Date(`${dayKeys[dayKeys.length - 1]}T00:00:00.000Z`).getTime() + MS_PER_DAY
  ).toISOString();

  const [mealsResult, goalsResult] = await Promise.all([
    supabase
      .from("meals")
      .select("total_calories, total_protein, total_carbs, total_fat, logged_at")
      .eq("user_id", userId)
      .gte("logged_at", rangeStartIso)
      .lt("logged_at", rangeEndIso),
    supabase
      .from("user_goals")
      .select("daily_calories")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (mealsResult.error) {
    throw mealsResult.error;
  }
  if (goalsResult.error) {
    throw goalsResult.error;
  }

  const targetCalories = goalsResult.data?.daily_calories ?? 0;

  type DayTotals = {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };

  const totalsByDay = new Map<string, DayTotals>();
  for (const meal of mealsResult.data ?? []) {
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

  return dayKeys.map((date) => {
    const totals = totalsByDay.get(date) ?? {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
    return {
      date,
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
      target_calories: targetCalories,
    };
  });
}

/**
 * Returns the 7-day rolling nutrition trend (J-7 .. J-1, oldest first) for
 * the current user, sourced from `meals` (filtered to `auth.uid() = user_id`
 * via RLS + an explicit `.eq`) plus the daily calorie target from
 * `user_goals`. Powers `WeeklyTrendsChart` (TICK-013).
 */
export function useWeeklyTrends() {
  const { user } = useUser();

  return useQuery({
    queryKey: ["weekly-trends", user?.id],
    queryFn: () => fetchWeeklyTrends(user!.id),
    enabled: !!user,
  });
}
