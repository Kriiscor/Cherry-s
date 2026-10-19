import { z } from "zod";

export const mealItemAnalysisSchema = z.object({
  name: z.string().min(1).describe("Nom clair de l'ingrédient ou de l'aliment"),
  weight_g: z.number().nonnegative().describe("Poids estimé en grammes"),
  calories: z.number().nonnegative().describe("Calories calculées"),
  protein_g: z.number().nonnegative().describe("Protéines en grammes"),
  carbs_g: z.number().nonnegative().describe("Glucides en grammes"),
  fat_g: z.number().nonnegative().describe("Lipides en grammes"),
  source: z
    .enum(["visual", "user_note"])
    .describe("Origine : détecté sur photo ou spécifié en note"),
});

export type MealItemAnalysis = z.infer<typeof mealItemAnalysisSchema>;

export const mealAnalysisResponseSchema = z.object({
  meal_summary: z.string().describe("Courte description du plat"),
  items: z.array(mealItemAnalysisSchema).min(1),
  total_calories: z.number().nonnegative(),
  total_protein: z.number().nonnegative(),
  total_carbs: z.number().nonnegative(),
  total_fat: z.number().nonnegative(),
});

export type MealAnalysisResponse = z.infer<typeof mealAnalysisResponseSchema>;
