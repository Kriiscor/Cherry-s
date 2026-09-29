import { z } from "zod";

/**
 * Mirrors the `user_goals` table's CHECK constraints exactly — the literal
 * string values here must stay in sync with the DB schema.
 */
export const sexEnum = z.enum(["male", "female"]);

export const activityLevelEnum = z.enum([
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
]);

export const goalTypeEnum = z.enum(["lose", "maintain", "gain"]);

/**
 * Number fields use plain `z.number()` rather than `z.coerce.number()`: the
 * wizard always hands these fields real numbers (react-hook-form's
 * `valueAsNumber` for text inputs, the `Slider` components for step 3), so
 * coercion isn't needed — and keeping input/output types identical avoids a
 * generic mismatch between `zodResolver` and `useForm<WizardFormValues>`.
 */

/** Step 1 — physical profile. */
export const profileStepSchema = z.object({
  weightKg: z
    .number({ error: "Le poids est requis" })
    .positive("Le poids doit être supérieur à 0"),
  heightCm: z
    .number({ error: "La taille est requise" })
    .positive("La taille doit être supérieure à 0"),
  age: z
    .number({ error: "L'âge est requis" })
    .positive("L'âge doit être supérieur à 0")
    .int("L'âge doit être un nombre entier"),
  sex: sexEnum,
});

/** Step 2 — activity level & goal type. */
export const activityStepSchema = z.object({
  activityLevel: activityLevelEnum,
  goalType: goalTypeEnum,
});

/** Step 3 — user-adjustable computed targets. */
export const reviewStepSchema = z.object({
  dailyCalories: z.number().positive(),
  proteinGrams: z.number().nonnegative(),
  carbsGrams: z.number().nonnegative(),
  fatGrams: z.number().nonnegative(),
});

/** Full payload persisted by the onboarding wizard's server action. */
export const userGoalsSchema = profileStepSchema
  .extend(activityStepSchema.shape)
  .extend(reviewStepSchema.shape);

export type ProfileStepInput = z.infer<typeof profileStepSchema>;
export type ActivityStepInput = z.infer<typeof activityStepSchema>;
export type ReviewStepInput = z.infer<typeof reviewStepSchema>;
export type UserGoalsInput = z.infer<typeof userGoalsSchema>;
