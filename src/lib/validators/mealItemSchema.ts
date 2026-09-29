import { z } from "zod";
import { sanitizeText } from "@/lib/sanitize";

/**
 * Client + server validation for a single editable ingredient row in the
 * TICK-010 preview/edit modal, mirroring the `meal_items` table's CHECK
 * constraints (src/lib/supabase/database.types.ts, TICK-004):
 *   - weight_grams > 0
 *   - calories/protein/carbs/fat >= 0
 *   - item_name non-empty, trimmed, and stripped of any HTML/script content.
 */
export const mealItemFormSchema = z.object({
  item_name: z
    .string()
    .transform((value) => sanitizeText(value))
    .pipe(z.string().min(1, "Le nom de l'aliment est requis")),
  weight_grams: z.coerce
    .number({ error: "Poids invalide" })
    .gt(0, "Le poids doit être supérieur à 0"),
  calories: z.coerce.number({ error: "Valeur invalide" }).nonnegative("Doit être positif ou nul"),
  protein: z.coerce.number({ error: "Valeur invalide" }).nonnegative("Doit être positif ou nul"),
  carbs: z.coerce.number({ error: "Valeur invalide" }).nonnegative("Doit être positif ou nul"),
  fat: z.coerce.number({ error: "Valeur invalide" }).nonnegative("Doit être positif ou nul"),
});

export type MealItemFormValues = z.infer<typeof mealItemFormSchema>;

/** Full payload validated before the "Valider et enregistrer" save action. */
export const mealSaveSchema = z.object({
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  photo_url: z.string().nullable().optional(),
  items: z.array(mealItemFormSchema).min(1, "Ajoute au moins un aliment"),
});

export type MealSaveValues = z.infer<typeof mealSaveSchema>;
