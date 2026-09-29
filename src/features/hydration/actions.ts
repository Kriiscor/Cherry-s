"use server";

import { createClient } from "@/lib/supabase/server";
import {
  hydrationSchema,
  type HydrationValues,
} from "@/lib/validators/hydrationSchema";

export type AddHydrationResult =
  | { success: true; logId: string }
  | { success: false; error: string };

/**
 * Adds a hydration log entry (TICK-021). Validates the payload with Zod then
 * inserts a `hydration_logs` row scoped to the authenticated user.
 */
export async function addHydration(
  input: HydrationValues
): Promise<AddHydrationResult> {
  const parsed = hydrationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Quantité d'eau invalide.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "Vous devez être connecté pour enregistrer votre hydratation.",
    };
  }

  const { data, error } = await supabase
    .from("hydration_logs")
    .insert({
      user_id: user.id,
      amount_ml: parsed.data.amount_ml,
      logged_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      success: false,
      error: "Impossible d'enregistrer l'hydratation. Réessaie plus tard.",
    };
  }

  return { success: true, logId: data.id };
}
