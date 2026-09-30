/**
 * Calories burned during an activity (TICK-018):
 *   calories = MET × weight(kg) × (duration_minutes / 60)
 * Rounded to the nearest integer to match `sports_activities.calories_burned`
 * (an INT column). Returns 0 for non-positive inputs so the live preview in
 * <SportActivityModal /> never shows NaN.
 */
export function estimateCaloriesBurned(
  met: number,
  weightKg: number,
  durationMinutes: number
): number {
  if (met <= 0 || weightKg <= 0 || durationMinutes <= 0) return 0;
  return Math.round(met * weightKg * (durationMinutes / 60));
}

/**
 * Estimated calories burned from daily steps.
 * Formula: steps × weight(kg) × 0.00045
 * Gives ~315 kcal for 10 000 steps at 70 kg — consistent with published
 * pedometry energy-expenditure tables.
 */
export function estimateCaloriesFromSteps(
  steps: number,
  weightKg: number
): number {
  if (steps <= 0 || weightKg <= 0) return 0;
  return Math.round(steps * weightKg * 0.00045);
}
