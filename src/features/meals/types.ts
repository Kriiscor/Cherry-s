import type { Database } from "@/lib/supabase/database.types";

/** Matches the `meal_type` enum on the `meals` table. */
export type MealType = Database["public"]["Tables"]["meals"]["Row"]["meal_type"];

export const MEAL_TYPE_OPTIONS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Petit-déjeuner" },
  { value: "lunch", label: "Déjeuner" },
  { value: "dinner", label: "Dîner" },
  { value: "snack", label: "Collation" },
];
