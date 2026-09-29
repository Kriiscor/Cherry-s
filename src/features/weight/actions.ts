"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { weightLogSchema } from "@/lib/validators/weightLogSchema";

export type LogWeightResult =
  | { success: true; logId: string }
  | { success: false; error: string };

/**
 * Persists a body weight entry (TICK-020). Validates the payload with Zod,
 * then inserts a `weight_logs` row scoped to the authenticated user.
 */
export async function logWeight(
  input: unknown
): Promise<LogWeightResult> {
  try {
    const parsed = weightLogSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Données de pesée invalides.",
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
        error: "Vous devez être connecté pour enregistrer une pesée.",
      };
    }

    const { data, error } = await supabase
      .from("weight_logs")
      .insert({
        user_id: user.id,
        weight_kg: parsed.data.weight_kg,
        note: parsed.data.note ?? null,
        logged_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error || !data) {
      return {
        success: false,
        error: "Impossible d'enregistrer la pesée. Réessaie plus tard.",
      };
    }

    revalidatePath("/analytics");
    return { success: true, logId: data.id };
  } catch (error) {
    console.error("[logWeight] Erreur inattendue:", error);
    return {
      success: false,
      error: "Une erreur inattendue est survenue lors de l'enregistrement.",
    };
  }
}

export type DeleteWeightResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Deletes a weight log entry (TICK-020). Filters by `user_id` as
 * defense-in-depth on top of RLS.
 */
export async function deleteWeight(
  logId: string
): Promise<DeleteWeightResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Vous devez être connecté pour supprimer une pesée.",
      };
    }

    const { error } = await supabase
      .from("weight_logs")
      .delete()
      .eq("id", logId)
      .eq("user_id", user.id);

    if (error) {
      return {
        success: false,
        error: "Impossible de supprimer la pesée. Réessaie plus tard.",
      };
    }

    revalidatePath("/analytics");
    return { success: true };
  } catch (error) {
    console.error("[deleteWeight] Erreur inattendue:", error);
    return {
      success: false,
      error: "Une erreur inattendue est survenue lors de la suppression.",
    };
  }
}
