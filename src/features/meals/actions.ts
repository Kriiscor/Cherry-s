"use server";

import { createClient } from "@/lib/supabase/server";
import { mealSaveSchema, type MealSaveValues } from "@/lib/validators/mealItemSchema";

export type SaveMealResult =
  | { success: true; mealId: string }
  | { success: false; error: string };

/**
 * Persists a reviewed meal (TICK-010): inserts the `meals` row, then its
 * `meal_items` rows. Supabase JS has no easy multi-table client transaction,
 * so this uses a compensating action — if the `meal_items` insert fails, the
 * just-created `meals` row is deleted before returning the error.
 */
export async function saveMealAction(
  input: MealSaveValues
): Promise<SaveMealResult> {
  const parsed = mealSaveSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données de repas invalides.",
    };
  }
  const { meal_type, photo_url, items } = parsed.data;

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Vous devez être connecté pour enregistrer un repas." };
  }

  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const { data: meal, error: mealError } = await supabase
    .from("meals")
    .insert({
      user_id: user.id,
      meal_type,
      photo_url: photo_url ?? null,
      total_calories: totals.calories,
      total_protein: totals.protein,
      total_carbs: totals.carbs,
      total_fat: totals.fat,
      logged_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (mealError || !meal) {
    return {
      success: false,
      error: "Impossible d'enregistrer le repas. Réessaie plus tard.",
    };
  }

  const { error: itemsError } = await supabase.from("meal_items").insert(
    items.map((item) => ({
      meal_id: meal.id,
      item_name: item.item_name,
      weight_grams: item.weight_grams,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
    }))
  );

  if (itemsError) {
    // Compensating action — poor-man's transaction: roll back the meal row.
    await supabase.from("meals").delete().eq("id", meal.id);
    return {
      success: false,
      error: "Impossible d'enregistrer les aliments du repas. Réessaie plus tard.",
    };
  }

  return { success: true, mealId: meal.id };
}
