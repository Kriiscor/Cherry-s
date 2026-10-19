"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlannedRecipesAction, cookPlannedRecipeAction } from "../actions";
import { toast } from "sonner";

export function usePlannedRecipes() {
  return useQuery({
    queryKey: ["planned-recipes"],
    queryFn: async () => {
      const result = await getPlannedRecipesAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}

export function useCookPlannedRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipeId: string) => cookPlannedRecipeAction(recipeId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Repas ajouté à votre journal !");
        queryClient.invalidateQueries({ queryKey: ["planned-recipes"] });
        queryClient.invalidateQueries({ queryKey: ["meals"] });
        queryClient.invalidateQueries({ queryKey: ["daily-totals"] });
      } else {
        toast.error(result.error);
      }
    },
    onError: () => {
      toast.error("Impossible d'enregistrer le repas");
    },
  });
}
