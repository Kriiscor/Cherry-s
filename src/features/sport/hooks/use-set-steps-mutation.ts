"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

import { setDailySteps } from "@/features/sport/steps-actions";
import { dailyStepsQueryKey } from "@/features/dashboard/lib/query-keys";

/**
 * Upserts the daily step count. On success, invalidates the steps query for
 * the target date so `useDailySteps` reflects the new value immediately.
 */
export function useSetStepsMutation(date: Date) {
  const queryClient = useQueryClient();
  const dateISO = format(date, "yyyy-MM-dd");

  return useMutation({
    mutationFn: async (stepCount: number) => {
      const result = await setDailySteps({
        step_count: stepCount,
        logged_date: dateISO,
      });
      if (!result.success) throw new Error(result.error);
      return result.stepCount;
    },
    onSuccess: (stepCount) => {
      queryClient.setQueryData(dailyStepsQueryKey(dateISO), stepCount);
      toast.success("Pas enregistrés !");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Impossible d'enregistrer les pas.");
    },
  });
}
