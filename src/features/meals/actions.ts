"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  mealSaveSchema,
  type MealSaveValues,
} from "@/lib/validators/mealItemSchema";

export type SaveMealResult =
  | { success: true; mealId: string }
  | { success: false; error: string };

/**
 * Persists a new meal (TICK-010): inserts the `meals` row, then its
 * `meal_items` rows. All numerical totals and grams are rounded to integer
 * to strictly adhere to the DB schema constraints (`INT`).
 */
export async function saveMealAction(
  input: MealSaveValues
): Promise<SaveMealResult> {
  try {
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
      return {
        success: false,
        error: "Vous devez être connecté pour enregistrer un repas.",
      };
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
        total_calories: Math.round(totals.calories),
        total_protein: Math.round(totals.protein),
        total_carbs: Math.round(totals.carbs),
        total_fat: Math.round(totals.fat),
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
        weight_grams: Math.round(item.weight_grams),
        calories: Math.round(item.calories),
        protein: Math.round(item.protein),
        carbs: Math.round(item.carbs),
        fat: Math.round(item.fat),
      }))
    );

    if (itemsError) {
      // Compensating action — rollback the meal row.
      await supabase.from("meals").delete().eq("id", meal.id);
      return {
        success: false,
        error: "Impossible d'enregistrer les aliments du repas. Réessaie plus tard.",
      };
    }

    revalidatePath("/dashboard");
    return { success: true, mealId: meal.id };
  } catch (error) {
    console.error("[saveMealAction] Erreur inattendue:", error);
    return {
      success: false,
      error: "Une erreur inattendue est survenue lors de l'enregistrement.",
    };
  }
}

export interface UpdateMealInput extends MealSaveValues {
  mealId: string;
}

export type UpdateMealResult =
  | { success: true; mealId: string }
  | { success: false; error: string };

/**
 * Updates an existing meal: updates the parent `meals` row totals and meal_type,
 * and replaces its `meal_items` rows. All numerical values are rounded to integer.
 */
export async function updateMealAction(
  input: UpdateMealInput
): Promise<UpdateMealResult> {
  try {
    const { mealId, meal_type, photo_url, items } = input;
    if (!mealId || typeof mealId !== "string") {
      return { success: false, error: "Identifiant de repas manquant." };
    }

    const parsed = mealSaveSchema.safeParse({ meal_type, photo_url, items });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Données de repas invalides.",
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
        error: "Vous devez être connecté pour modifier un repas.",
      };
    }

    const totals = parsed.data.items.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // 1. Update the parent meal
    const { error: mealError } = await supabase
      .from("meals")
      .update({
        meal_type: parsed.data.meal_type,
        photo_url: parsed.data.photo_url ?? null,
        total_calories: Math.round(totals.calories),
        total_protein: Math.round(totals.protein),
        total_carbs: Math.round(totals.carbs),
        total_fat: Math.round(totals.fat),
      })
      .eq("id", mealId)
      .eq("user_id", user.id);

    if (mealError) {
      return {
        success: false,
        error: "Impossible de modifier le repas. Réessaie plus tard.",
      };
    }

    // 2. Replace meal items: delete old items and insert updated ones
    const { error: deleteError } = await supabase
      .from("meal_items")
      .delete()
      .eq("meal_id", mealId);

    if (deleteError) {
      return {
        success: false,
        error: "Erreur lors de la mise à jour des aliments du repas.",
      };
    }

    const { error: itemsError } = await supabase.from("meal_items").insert(
      parsed.data.items.map((item) => ({
        meal_id: mealId,
        item_name: item.item_name,
        weight_grams: Math.round(item.weight_grams),
        calories: Math.round(item.calories),
        protein: Math.round(item.protein),
        carbs: Math.round(item.carbs),
        fat: Math.round(item.fat),
      }))
    );

    if (itemsError) {
      return {
        success: false,
        error: "Impossible d'enregistrer les nouveaux aliments du repas.",
      };
    }

    revalidatePath("/dashboard");
    return { success: true, mealId };
  } catch (error) {
    console.error("[updateMealAction] Erreur inattendue:", error);
    return {
      success: false,
      error: "Une erreur inattendue est survenue lors de la modification du repas.",
    };
  }
}
