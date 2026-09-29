/**
 * Pure nutrition goal calculations for the onboarding wizard (TICK-008).
 *
 * Formula: Mifflin-St Jeor (BMR) -> TDEE via activity multiplier -> goal
 * adjustment -> macro split. No I/O, no side effects — safe to unit test
 * directly and to reuse from both the server action and the review step's
 * live preview.
 */

export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type GoalType = "lose" | "maintain" | "gain";

export interface NutritionGoalsInput {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  goalType: GoalType;
}

export interface NutritionGoalsResult {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

/** TDEE = BMR × multiplier. Values match the DB's `activity_level` CHECK constraint. */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/** Calorie delta applied to TDEE per goal type. */
const GOAL_CALORIE_ADJUSTMENT: Record<GoalType, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

/** % of daily_calories allocated to each macro, keyed by goal type. */
const MACRO_SPLIT: Record<
  GoalType,
  { protein: number; carbs: number; fat: number }
> = {
  lose: { protein: 0.35, carbs: 0.35, fat: 0.3 },
  maintain: { protein: 0.3, carbs: 0.4, fat: 0.3 },
  gain: { protein: 0.25, carbs: 0.45, fat: 0.3 },
};

/** Basal Metabolic Rate via the Mifflin-St Jeor equation. */
export function computeBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

/** Total Daily Energy Expenditure = BMR × activity multiplier. */
export function computeTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

/**
 * Computes daily calorie and macro targets from a physical profile, activity
 * level and goal. Grams are derived from percentages of `daily_calories`
 * (protein/carbs = 4 kcal/g, fat = 9 kcal/g) and rounded to the nearest gram.
 */
export function computeNutritionGoals(
  input: NutritionGoalsInput
): NutritionGoalsResult {
  const { weightKg, heightCm, age, sex, activityLevel, goalType } = input;

  const bmr = computeBMR(weightKg, heightCm, age, sex);
  const tdee = computeTDEE(bmr, activityLevel);
  const dailyCalories = Math.round(tdee + GOAL_CALORIE_ADJUSTMENT[goalType]);

  const split = MACRO_SPLIT[goalType];
  const proteinGrams = Math.round((dailyCalories * split.protein) / 4);
  const carbsGrams = Math.round((dailyCalories * split.carbs) / 4);
  const fatGrams = Math.round((dailyCalories * split.fat) / 9);

  return { dailyCalories, proteinGrams, carbsGrams, fatGrams };
}
