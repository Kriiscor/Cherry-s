import { replicate } from "./client";
import { runWithReplicateRetry } from "./retry";
import type { NutritionMetrics } from "@/lib/scoring/weekly-quality-score";

/**
 * Text model used to generate the French coaching markdown. Overridable via
 * env var for easy swaps without a code change.
 */
const MODEL = (process.env.REPLICATE_WEEKLY_SUMMARY_MODEL ??
  "meta/meta-llama-3-8b-instruct") as `${string}/${string}`;

export interface WeeklyAdviceInput {
  weekStartDate: string;
  qualityScore: number;
  daysLogged: number;
  target: NutritionMetrics;
  dayScores: number[];
}

function buildPrompt(input: WeeklyAdviceInput): string {
  const { weekStartDate, qualityScore, daysLogged, target, dayScores } = input;

  return [
    "Tu es un coach en nutrition bienveillant et concis, qui s'exprime en français.",
    "Rédige un court bilan hebdomadaire en Markdown (titres, listes) pour un utilisateur d'une app de suivi nutritionnel.",
    "",
    `Semaine débutant le ${weekStartDate}.`,
    `Score de régularité et de qualité nutritionnelle : ${qualityScore}/100.`,
    `Jours avec au moins un repas logué : ${daysLogged}/7.`,
    `Scores journaliers (J-7 à J-1) : ${dayScores.map((s) => Math.round(s)).join(", ")}.`,
    `Objectifs quotidiens : ${target.calories} kcal, ${target.protein} g de protéines, ${target.carbs} g de glucides, ${target.fat} g de lipides.`,
    "",
    "Donne 2 ou 3 conseils concrets et personnalisés pour la semaine prochaine.",
    "Reste encourageant, évite le jargon médical, et ne dépasse pas 200 mots.",
  ].join("\n");
}

/**
 * Calls Replicate to generate the weekly coaching markdown. Throws on
 * failure — callers are responsible for falling back gracefully.
 */
export async function generateWeeklyAdvice(input: WeeklyAdviceInput): Promise<string> {
  const output = await runWithReplicateRetry(() =>
    replicate.run(MODEL, {
      input: {
        prompt: buildPrompt(input),
        max_tokens: 600,
        temperature: 0.6,
      },
    })
  );

  if (Array.isArray(output)) {
    return output.join("");
  }
  if (typeof output === "string") {
    return output;
  }
  return String(output ?? "");
}
