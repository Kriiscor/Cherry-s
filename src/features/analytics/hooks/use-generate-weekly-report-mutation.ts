"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUser } from "@/providers/supabase-provider";
import { weeklyReportQueryKey, type WeeklyReport } from "./use-weekly-report";

class GenerateWeeklyReportError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "GenerateWeeklyReportError";
  }
}

async function generateWeeklyReport(): Promise<WeeklyReport> {
  const response = await fetch("/api/ai/weekly-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message: string =
      body?.error ?? "Une erreur est survenue lors de la génération du bilan.";
    throw new GenerateWeeklyReportError(response.status, message);
  }

  const body = (await response.json()) as { report: WeeklyReport };
  return body.report;
}

/**
 * Calls `POST /api/ai/weekly-summary` (TICK-006) to (re)generate the current
 * week's health score + AI coaching advice. Used by the "Générer mon
 * bilan" / "Régénérer le bilan" button in `WeeklyReportCard` (TICK-014) for
 * both the first generation and subsequent regenerations. Surfaces the
 * 429 rate-limit (max 3/hour) as a friendly French toast.
 */
export function useGenerateWeeklyReportMutation() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateWeeklyReport,
    onSuccess: (report) => {
      queryClient.setQueryData(weeklyReportQueryKey(user?.id), report);
      toast.success("Bilan hebdomadaire généré !");
    },
    onError: (error: Error) => {
      if (error instanceof GenerateWeeklyReportError) {
        if (error.status === 429) {
          toast.error(
            "Trop de générations. Réessaie dans une heure (max 3 par heure)."
          );
          return;
        }
        if (error.status === 401) {
          toast.error("Ta session a expiré. Reconnecte-toi puis réessaie.");
          return;
        }
        toast.error(error.message);
        return;
      }
      toast.error("Une erreur inattendue est survenue. Réessaie plus tard.");
    },
  });
}
