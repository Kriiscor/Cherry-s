"use client";

import { useMutation } from "@tanstack/react-query";
import type { RecipeGroceriesResponse } from "@/lib/validators/recipeGroceriesSchema";

export function useExtractGroceriesMutation() {
  return useMutation({
    mutationFn: async (payload: {
      images?: string[];
      textRecipes?: string;
    }): Promise<RecipeGroceriesResponse> => {
      const response = await fetch("/api/ai/extract-recipe-groceries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Erreur IA");
      }
      return response.json();
    },
  });
}
