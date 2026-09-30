import { z } from "zod";
import {
  sexEnum,
  activityLevelEnum,
  goalTypeEnum,
} from "./userGoalsSchema";

/**
 * Settings page form (TICK-015): display name + physical profile +
 * activity / goal + `user_goals` macro/calorie targets.
 * Mirrors the DB constraints on `profiles.full_name` (non-empty)
 * and `user_goals` (weight, height, age, sex, activity, goal, calories, macros).
 */
export const settingsSchema = z.object({
  fullName: z
    .string({ error: "Le nom est requis" })
    .trim()
    .min(1, "Le nom est requis"),
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
  activityLevel: activityLevelEnum,
  goalType: goalTypeEnum,
  dailyCalories: z
    .number({ error: "La cible calorique est requise" })
    .positive("La cible calorique doit être supérieure à 0"),
  proteinGrams: z
    .number({ error: "Les protéines sont requises" })
    .nonnegative("Les protéines doivent être positives ou nulles"),
  carbsGrams: z
    .number({ error: "Les glucides sont requis" })
    .nonnegative("Les glucides doivent être positifs ou nuls"),
  fatGrams: z
    .number({ error: "Les lipides sont requis" })
    .nonnegative("Les lipides doivent être positifs ou nuls"),
  dailyStepsGoal: z
    .number({ error: "L'objectif de pas est requis" })
    .int()
    .min(1000, "Minimum 1 000 pas")
    .max(100000, "Maximum 100 000 pas"),
  dailyWaterMl: z
    .number({ error: "L'objectif d'hydratation est requis" })
    .int()
    .min(500, "Minimum 500 ml")
    .max(10000, "Maximum 10 000 ml"),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
