import { z } from "zod";

/**
 * Client + server validation for adding a hydration entry (TICK-021),
 * mirroring the `hydration_logs` CHECK constraints (migration 003):
 *   - amount_ml 1..5000 ml per log entry
 */
export const hydrationSchema = z.object({
  amount_ml: z.coerce
    .number({ error: "Quantité d'eau invalide" })
    .int("La quantité doit être un nombre entier de millilitres")
    .min(1, "La quantité minimale est 1 ml")
    .max(5000, "La quantité maximale est 5000 ml par ajout"),
});

export type HydrationValues = z.infer<typeof hydrationSchema>;
