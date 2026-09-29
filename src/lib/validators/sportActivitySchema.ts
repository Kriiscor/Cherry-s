import { z } from "zod";
import { sanitizeText } from "@/lib/sanitize";

/**
 * Client + server validation for logging a sport activity (TICK-018),
 * mirroring the `sports_activities` CHECK constraints (migration 003):
 *   - activity_name non-empty, trimmed, stripped of any HTML/script content
 *   - met_value > 0
 *   - duration_minutes 1..1440 (1 min .. 24 h)
 *   - calories_burned 1..10000
 */
export const sportActivitySchema = z.object({
  activity_name: z
    .string()
    .transform((value) => sanitizeText(value))
    .pipe(z.string().min(1, "Le nom de l'activité est requis")),
  met_value: z.coerce
    .number({ error: "MET invalide" })
    .gt(0, "Le MET doit être supérieur à 0"),
  duration_minutes: z.coerce
    .number({ error: "Durée invalide" })
    .int("La durée doit être un nombre entier de minutes")
    .min(1, "Durée minimale 1 minute")
    .max(1440, "Durée maximale 1440 minutes (24 h)"),
  calories_burned: z.coerce
    .number({ error: "Calories invalides" })
    .int("Les calories doivent être un nombre entier")
    .min(1, "Au moins 1 kcal brûlée")
    .max(10000, "Valeur de calories trop élevée (max 10000)"),
});

export type SportActivityValues = z.infer<typeof sportActivitySchema>;
