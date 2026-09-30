"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { settingsSchema } from "@/lib/validators/settingsSchema";

export type UpdateSettingsResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Persists the settings form (TICK-015): updates `profiles.full_name` and
 * the authenticated user's `user_goals` row (upserting if not yet present).
 * Requires an authenticated session — the user id always comes from
 * `supabase.auth.getUser()`, never from client input, so this can't be used
 * to modify another user's data even if RLS were misconfigured.
 */
export async function updateSettingsAction(
  input: unknown
): Promise<UpdateSettingsResult> {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ??
        "Données invalides. Merci de vérifier le formulaire.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "Vous devez être connecté pour modifier vos paramètres.",
    };
  }

  const {
    fullName,
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
    dailyStepsGoal,
    dailyWaterMl,
  } = parsed.data;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);

  if (profileError) {
    return {
      success: false,
      error: "Impossible de mettre à jour votre profil. Réessayez.",
    };
  }

  const { error: goalsError } = await supabase
    .from("user_goals")
    .upsert(
      {
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
        daily_steps_goal: dailyStepsGoal,
        daily_water_ml: dailyWaterMl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (goalsError) {
    return {
      success: false,
      error: "Impossible de mettre à jour vos objectifs. Réessayez.",
    };
  }

  // Ensures the dashboard (kcal/macros display) and this page reflect the
  // new values on next navigation, without requiring logout/re-login.
  revalidatePath("/dashboard");
  revalidatePath("/settings");

  return { success: true };
}
