import { z } from "zod";

export const stepsSchema = z.object({
  step_count: z.coerce
    .number({ error: "Nombre de pas invalide" })
    .int("Le nombre de pas doit être un entier")
    .min(0, "Le nombre de pas ne peut pas être négatif")
    .max(200000, "Maximum 200 000 pas par jour"),
  logged_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
});

export type StepsValues = z.infer<typeof stepsSchema>;
