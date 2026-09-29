"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteSportActivity } from "@/features/sport/actions";

/**
 * Deletes a sport activity via the `deleteSportActivity` server action
 * (TICK-018). Invalidates the `["sports", "daily"]` prefix so the day's list
 * and the net-calorie balance card (TICK-019) refresh together.
 */
export function useDeleteSportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityId: string) => {
      const result = await deleteSportActivity(activityId);
      if (!result.success) throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sports", "daily"] });
      toast.success("Activité supprimée.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer l'activité. Réessaie plus tard."
      );
    },
  });
}
