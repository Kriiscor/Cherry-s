import { z } from "zod";
import { sanitizeText } from "@/lib/sanitize";

/**
 * Client + server validation for logging a body weight entry (TICK-020),
 * mirroring the `weight_logs` CHECK constraints (migration 003):
 *   - weight_kg 20..300 kg
 *   - note optional, trimmed, stripped of HTML
 */
export const weightLogSchema = z.object({
  weight_kg: z.coerce
    .number({ error: "Poids invalide" })
    .min(20, "Le poids minimum est 20 kg")
    .max(300, "Le poids maximum est 300 kg"),
  note: z
    .string()
    .transform((value) => sanitizeText(value) || undefined)
    .optional(),
});

export type WeightLogValues = z.infer<typeof weightLogSchema>;
