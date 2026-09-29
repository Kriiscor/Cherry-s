"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { logSportActivity } from "@/features/sport/actions";
import type { SportActivityValues } from "@/lib/validators/sportActivitySchema";

/**
 * Logs a sport activity via the `logSportActivity` server action (TICK-018).
 * On success invalidates the `["sports", "daily"]` prefix so both the day's
 * activity list and the net-calorie balance card (TICK-019) refresh.
 */
export function useLogSportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: SportActivityValues) => {
      const result = await logSportActivity(values);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sports", "daily"] });
      toast.success("Activité enregistrée !");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer l'activité. Réessaie plus tard."
      );
    },
  });
}
