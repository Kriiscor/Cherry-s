"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { stepsSchema } from "@/lib/validators/stepsSchema";

export type SetStepsResult =
  | { success: true; stepCount: number }
  | { success: false; error: string };

/**
 * Upserts the daily step count for the authenticated user on a given date.
 * Uses Supabase upsert on the unique (user_id, logged_date) constraint so
 * the user can update their total during the day without duplicate rows.
 */
export async function setDailySteps(input: unknown): Promise<SetStepsResult> {
  try {
    const parsed = stepsSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Données invalides.",
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
        error: "Vous devez être connecté pour enregistrer vos pas.",
      };
    }

    const { step_count, logged_date } = parsed.data;

    const { error } = await supabase.from("daily_steps").upsert(
      {
        user_id: user.id,
        step_count,
        logged_date,
      },
      { onConflict: "user_id,logged_date" }
    );

    if (error) {
      return {
        success: false,
        error: "Impossible d'enregistrer vos pas. Réessaie plus tard.",
      };
    }

    revalidatePath("/dashboard");
    return { success: true, stepCount: step_count };
  } catch (error) {
    console.error("[setDailySteps] Erreur inattendue:", error);
    return {
      success: false,
      error: "Une erreur inattendue est survenue.",
    };
  }
}

export type GetStepsResult =
  | { success: true; stepCount: number }
  | { success: false; error: string };

/** Reads the step count for the authenticated user on a given date. */
export async function getDailySteps(date: string): Promise<GetStepsResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Non authentifié." };
    }

    const { data, error } = await supabase
      .from("daily_steps")
      .select("step_count")
      .eq("user_id", user.id)
      .eq("logged_date", date)
      .maybeSingle();

    if (error) {
      return { success: false, error: "Impossible de récupérer vos pas." };
    }

    return { success: true, stepCount: data?.step_count ?? 0 };
  } catch (error) {
    console.error("[getDailySteps] Erreur inattendue:", error);
    return { success: false, error: "Une erreur inattendue est survenue." };
  }
}
