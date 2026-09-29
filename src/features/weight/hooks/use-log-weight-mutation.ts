"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { logWeight } from "@/features/weight/actions";
import { weightLogsQueryKey } from "@/features/dashboard/lib/query-keys";
import { useUser } from "@/providers/supabase-provider";
import type { WeightLogValues } from "@/lib/validators/weightLogSchema";

/**
 * Logs a body weight entry via the `logWeight` server action (TICK-020).
 * On success invalidates the weight-logs query so the analytics curve
 * refreshes.
 */
export function useLogWeightMutation() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: WeightLogValues) => {
      const result = await logWeight(values);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: weightLogsQueryKey(user?.id),
      });
      toast.success("Pesée enregistrée !");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer la pesée. Réessaie plus tard."
      );
    },
  });
}
