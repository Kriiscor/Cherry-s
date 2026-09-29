"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  sportActivitySchema,
  type SportActivityValues,
} from "@/lib/validators/sportActivitySchema";

export type LogSportResult =
  | { success: true; activityId: string }
  | { success: false; error: string };

/**
 * Persists a sport activity (TICK-018). Validates the payload with Zod, then
 * inserts a `sports_activities` row scoped to the authenticated user.
 */
export async function logSportActivity(
  input: unknown
): Promise<LogSportResult> {
  try {
    const parsed = sportActivitySchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Données d'activité invalides.",
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
        error: "Vous devez être connecté pour enregistrer une activité.",
      };
    }

    const { activity_name, met_value, duration_minutes, calories_burned } =
      parsed.data;

    const { data, error } = await supabase
      .from("sports_activities")
      .insert({
        user_id: user.id,
        activity_name,
        met_value,
        duration_minutes: Math.round(duration_minutes),
        calories_burned: Math.round(calories_burned),
        logged_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error || !data) {
      return {
        success: false,
        error: "Impossible d'enregistrer l'activité. Réessaie plus tard.",
      };
    }

    revalidatePath("/dashboard");
    return { success: true, activityId: data.id };
  } catch (error) {
    console.error("[logSportActivity] Erreur inattendue:", error);
    return {
      success: false,
      error: "Une erreur inattendue est survenue lors de l'enregistrement de l'activité.",
    };
  }
}

export type DeleteSportResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Deletes a sport activity (TICK-018). Filters by `user_id` in addition to
 * `id` as defense-in-depth on top of RLS.
 */
export async function deleteSportActivity(
  activityId: string
): Promise<DeleteSportResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Vous devez être connecté pour supprimer une activité.",
      };
    }

    const { error } = await supabase
      .from("sports_activities")
      .delete()
      .eq("id", activityId)
      .eq("user_id", user.id);

    if (error) {
      return {
        success: false,
        error: "Impossible de supprimer l'activité. Réessaie plus tard.",
      };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[deleteSportActivity] Erreur inattendue:", error);
    return {
      success: false,
      error: "Une erreur inattendue est survenue lors de la suppression de l'activité.",
    };
  }
}
