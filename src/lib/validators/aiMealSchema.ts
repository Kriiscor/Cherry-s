import { z } from "zod";

/**
 * Incoming request payload for POST /api/ai/analyze-meal.
 * The caller must supply at least a photo URL or a text description.
 */
export const aiMealRequestSchema = z
  .object({
    imageUrl: z.string().url().optional(),
    textDescription: z.string().max(500, "Description trop longue").optional(),
  })
  .refine((data) => data.imageUrl || data.textDescription, {
    message: "Fournir au moins une photo ou une description texte",
  });

export type AiMealRequest = z.infer<typeof aiMealRequestSchema>;

/**
 * A single food item as estimated by the vision model. Field names match
 * the `meal_items` table columns (src/lib/supabase/database.types.ts) so
 * the response can be persisted directly once the user validates it
 * (handled later in TICK-010).
 */
export const mealItemSchema = z.object({
  item_name: z.string().min(1),
  weight_grams: z.number().nonnegative(),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
});

export type MealItem = z.infer<typeof mealItemSchema>;

/**
 * Expected shape of the AI's raw structured output: a JSON array of meal
 * items. Used to validate the model's output before it ever reaches the
 * client, so malformed AI output surfaces as a clean 500 instead of a
 * runtime crash or unvalidated data being returned.
 */
export const aiMealAnalysisSchema = z.array(mealItemSchema).min(1);

export type AiMealAnalysis = z.infer<typeof aiMealAnalysisSchema>;

/**
 * Shape of a successful POST /api/ai/analyze-meal response body.
 */
export const aiMealResponseSchema = z.object({
  items: z.array(mealItemSchema).min(1),
});

export type AiMealResponse = z.infer<typeof aiMealResponseSchema>;
