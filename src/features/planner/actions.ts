"use server";

import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type PlannedRecipe = {
  id: string;
  title: string;
  servings: number;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  is_cooked: boolean;
  planned_date: string | null;
  created_at: string;
};

export async function getPlannedRecipesAction(): Promise<
  ActionResult<
    Array<{
      id: string;
      title: string;
      servings: number;
      calories: number | null;
      protein: number | null;
      carbs: number | null;
      fat: number | null;
      is_cooked: boolean;
      planned_date: string | null;
      created_at: string;
    }>
  >
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("planned_recipes")
    .select("id, title, servings, calories, protein, carbs, fat, is_cooked, planned_date, created_at")
    .eq("user_id", user.id)
    .order("planned_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function cookPlannedRecipeAction(
  recipeId: string
): Promise<ActionResult<{ mealId: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  // Fetch the planned recipe
  const { data: recipe, error: fetchError } = await supabase
    .from("planned_recipes")
    .select("*")
    .eq("id", recipeId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !recipe) {
    return { success: false, error: "Recette introuvable" };
  }

  // Create a meal entry
  const { data: meal, error: mealError } = await supabase
    .from("meals")
    .insert({
      user_id: user.id,
      meal_type: "dinner",
      total_calories: recipe.calories ?? 0,
      total_protein: recipe.protein ?? 0,
      total_carbs: recipe.carbs ?? 0,
      total_fat: recipe.fat ?? 0,
      logged_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (mealError || !meal) {
    return { success: false, error: mealError?.message ?? "Erreur création repas" };
  }

  // Create a single meal_item summarizing the recipe
  if (recipe.calories) {
    await supabase.from("meal_items").insert({
      meal_id: meal.id,
      item_name: recipe.title,
      weight_grams: recipe.servings * 200,
      calories: recipe.calories,
      protein: recipe.protein ?? 0,
      carbs: recipe.carbs ?? 0,
      fat: recipe.fat ?? 0,
    });
  }

  // Mark recipe as cooked
  await supabase
    .from("planned_recipes")
    .update({ is_cooked: true })
    .eq("id", recipeId)
    .eq("user_id", user.id);

  return { success: true, data: { mealId: meal.id } };
}

export async function savePlannedRecipeAction(recipe: {
  title: string;
  servings?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  planned_date?: string;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("planned_recipes")
    .insert({
      user_id: user.id,
      title: recipe.title,
      servings: recipe.servings ?? 2,
      calories: recipe.calories ?? null,
      protein: recipe.protein ?? null,
      carbs: recipe.carbs ?? null,
      fat: recipe.fat ?? null,
      planned_date:
        recipe.planned_date ?? format(new Date(), "yyyy-MM-dd"),
    })
    .select("id")
    .single();

  if (error || !data) return { success: false, error: error?.message ?? "Erreur" };
  return { success: true, data };
}
