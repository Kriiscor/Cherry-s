"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { userGoalsSchema } from "@/lib/validators/userGoalsSchema";
import type { Database } from "@/lib/supabase/database.types";

type UserGoalsInsert = Database["public"]["Tables"]["user_goals"]["Insert"];

export interface SaveGoalsResult {
  error?: string;
}

/**
 * Persists the onboarding wizard's final (possibly user-adjusted) goals into
 * `user_goals`, upserting on the table's `UNIQUE(user_id)` constraint.
 * Requires an authenticated user — silently rejects otherwise.
 */
export async function saveUserGoals(
  input: unknown
): Promise<SaveGoalsResult> {
  const parsed = userGoalsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Données invalides. Merci de vérifier le formulaire." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Vous devez être connecté pour continuer." };
  }

  const {
    weightKg,
    heightCm,
    age,
    sex,
    activityLevel,
    goalType,
    dailyCalories,
    proteinGrams,
    carbsGrams,
    fatGrams,
  } = parsed.data;

  const payload: UserGoalsInsert = {
    user_id: user.id,
    weight_kg: weightKg,
    height_cm: heightCm,
    age,
    sex,
    activity_level: activityLevel,
    goal_type: goalType,
    daily_calories: dailyCalories,
    protein_grams: proteinGrams,
    carbs_grams: carbsGrams,
    fat_grams: fatGrams,
    updated_at: new Date().toISOString(),
  };

  const { error: upsertError } = await supabase
    .from("user_goals")
    .upsert(payload, { onConflict: "user_id" });

  if (upsertError) {
    return { error: "Impossible d'enregistrer vos objectifs. Réessayez." };
  }

  redirect("/dashboard");
}
