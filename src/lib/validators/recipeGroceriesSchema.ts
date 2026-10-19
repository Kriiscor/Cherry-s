import { z } from "zod";

export const AISLES = [
  "Fruits & Légumes",
  "Boucherie & Poissonnerie",
  "Frais & Crèmerie",
  "Épicerie Salée",
  "Épicerie Sucrée",
  "Surgelés",
  "Boissons",
  "Entretien & Maison",
] as const;

export type Aisle = (typeof AISLES)[number];

export const recipeGroceriesRequestSchema = z
  .object({
    images: z.array(z.string().url()).min(1).max(10).optional(),
    textRecipes: z.string().max(5000).optional(),
  })
  .refine((d) => d.images || d.textRecipes, {
    message: "Fournir au moins une image ou du texte de recette",
  });

export type RecipeGroceriesRequest = z.infer<typeof recipeGroceriesRequestSchema>;

export const groceryItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().nonnegative(),
  unit: z.string(),
  aisle: z.enum(AISLES),
  is_pantry_staple: z.boolean(),
});

export type GroceryItem = z.infer<typeof groceryItemSchema>;

export const recipeMetaSchema = z.object({
  title: z.string(),
  servings: z.number().int().positive(),
  calories: z.number().nonnegative().optional(),
  protein: z.number().nonnegative().optional(),
  carbs: z.number().nonnegative().optional(),
  fat: z.number().nonnegative().optional(),
});

export type RecipeMeta = z.infer<typeof recipeMetaSchema>;

export const recipeGroceriesResponseSchema = z.object({
  recipes: z.array(recipeMetaSchema),
  items: z.array(groceryItemSchema).min(1),
});

export type RecipeGroceriesResponse = z.infer<typeof recipeGroceriesResponseSchema>;
