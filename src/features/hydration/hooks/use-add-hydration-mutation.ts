"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

import { addHydration } from "@/features/hydration/actions";
import { dailyHydrationQueryKey } from "@/features/dashboard/lib/query-keys";
import type { HydrationValues } from "@/lib/validators/hydrationSchema";

/**
 * Adds a hydration entry with an **optimistic update** (TICK-021):
 *   - On mutate: immediately increments the cached daily total so the gauge
 *     updates without waiting for the round-trip.
 *   - On error: rolls back to the previous cached value.
 *   - On success/settle: invalidates the query so the server total is fetched
 *     once for consistency.
 */
export function useAddHydrationMutation(date: Date) {
  const queryClient = useQueryClient();
  const dateISO = format(date, "yyyy-MM-dd");
  const queryKey = dailyHydrationQueryKey(dateISO);

  return useMutation({
    mutationFn: async (values: HydrationValues) => {
      const result = await addHydration(values);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onMutate: async (values) => {
      // Cancel any in-flight refetches so they don't overwrite the optimistic value
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value for rollback
      const previousTotal = queryClient.getQueryData<number>(queryKey) ?? 0;

      // Optimistically update the total
      queryClient.setQueryData<number>(
        queryKey,
        (old) => (old ?? 0) + values.amount_ml
      );

      return { previousTotal };
    },
    onError: (_error, _values, context) => {
      // Rollback on error
      if (context?.previousTotal !== undefined) {
        queryClient.setQueryData<number>(queryKey, context.previousTotal);
      }
      toast.error("Impossible d'enregistrer l'hydratation. Réessaie plus tard.");
    },
    onSettled: () => {
      // Always resync with server after mutation
      queryClient.invalidateQueries({
        queryKey: ["hydration", "daily"],
      });
    },
  });
}
