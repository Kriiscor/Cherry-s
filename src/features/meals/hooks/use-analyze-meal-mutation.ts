"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  AiMealRequest,
  AiMealResponse,
} from "@/lib/validators/aiMealSchema";

class AnalyzeMealError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "AnalyzeMealError";
  }
}

async function analyzeMeal(payload: AiMealRequest): Promise<AiMealResponse> {
  const response = await fetch("/api/ai/analyze-meal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message: string =
      body?.error ?? "Une erreur est survenue lors de l'analyse du repas.";
    throw new AnalyzeMealError(response.status, message);
  }

  return response.json() as Promise<AiMealResponse>;
}

/**
 * Calls POST /api/ai/analyze-meal (TICK-005) and surfaces rate-limit (429)
 * and payload-too-large (413) failures as Sonner toasts. The capture UI
 * that consumes this hook is built in TICK-009.
 */
export function useAnalyzeMealMutation() {
  return useMutation({
    mutationFn: analyzeMeal,
    onError: (error: Error) => {
      if (error instanceof AnalyzeMealError) {
        if (error.status === 429) {
          toast.error("Trop de requêtes. Réessaie dans une minute.");
          return;
        }
        if (error.status === 413) {
          toast.error("Image trop volumineuse (5 Mo maximum).");
          return;
        }
        toast.error(error.message);
        return;
      }
      toast.error("Une erreur inattendue est survenue.");
    },
  });
}
