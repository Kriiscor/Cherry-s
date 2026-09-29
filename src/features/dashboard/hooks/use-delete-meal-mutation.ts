"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";

/**
 * Deletes a `meals` row (TICK-012's "Supprimer" flow, confirmed via
 * `AlertDialog` in `<MealTimeline />`). Filters explicitly by `user_id` in
 * addition to `id` as defense-in-depth, per the ticket spec — not relying on
 * RLS alone. On success, invalidates the `["meals", "daily"]` prefix so both
 * the timeline's list and the gauges' totals refresh together.
 */
export function useDeleteMealMutation() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mealId: string) => {
      if (!user) throw new Error("Vous devez être connecté.");

      const supabase = createClient();
      const { error } = await supabase
        .from("meals")
        .delete()
        .eq("id", mealId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals", "daily"] });
      toast.success("Repas supprimé.");
    },
    onError: () => {
      toast.error("Impossible de supprimer ce repas. Réessaie plus tard.");
    },
  });
}
