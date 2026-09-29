/**
 * Weekly nutrition "quality score" algorithm (TICK-006).
 *
 * Pure, framework-free functions so the scoring rules can be unit-tested in
 * isolation from Supabase/Replicate/Next.js route wiring.
 *
 * Rules (see TICK-006-replicate-ai-weekly-summary-api.md):
 * - Tolerance: a deviation <= 10% from that day's target is not penalized.
 * - For each of the 7 days (J-7 .. J-1):
 *   - No meal logged that day -> day_score = 0.
 *   - Else, for each metric m in {calories, protein, carbs, fat}:
 *       dev(m) = |actual(m) - target(m)| / target(m)
 *       dev_adj(m) = max(0, dev(m) - 0.10)
 *     weighted_dev = 0.4*dev_adj(calories) + 0.2*dev_adj(protein)
 *                  + 0.2*dev_adj(carbs) + 0.2*dev_adj(fat)
 *     day_score = max(0, 100 - weighted_dev * 100)
 * - consistency_ratio = days_logged / 7
 * - quality_score = round( (sum of day_score over 7 days) / 7 * consistency_ratio )
 */

export interface NutritionMetrics {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** A single day (J-7..J-1) in the weekly window. */
export interface DailyLog {
  /** Whether at least one meal was logged that day. */
  logged: boolean;
  /** Sum of that day's logged meals. Required when `logged` is true. */
  actual?: NutritionMetrics;
}

export interface WeeklyQualityScoreResult {
  qualityScore: number;
  consistencyRatio: number;
  daysLogged: number;
  dayScores: number[];
}

const TOLERANCE = 0.1;

const METRIC_WEIGHTS: Record<keyof NutritionMetrics, number> = {
  calories: 0.4,
  protein: 0.2,
  carbs: 0.2,
  fat: 0.2,
};

function deviation(actual: number, target: number): number {
  if (target <= 0) return 0;
  return Math.abs(actual - target) / target;
}

function adjustedDeviation(actual: number, target: number): number {
  return Math.max(0, deviation(actual, target) - TOLERANCE);
}

/**
 * Computes a single day's score (0-100) given that day's totals and the
 * user's daily targets. Assumes the day was logged (callers should treat
 * unlogged days as day_score = 0 without calling this function).
 */
export function computeDayScore(
  actual: NutritionMetrics,
  target: NutritionMetrics
): number {
  const weightedDeviation =
    METRIC_WEIGHTS.calories * adjustedDeviation(actual.calories, target.calories) +
    METRIC_WEIGHTS.protein * adjustedDeviation(actual.protein, target.protein) +
    METRIC_WEIGHTS.carbs * adjustedDeviation(actual.carbs, target.carbs) +
    METRIC_WEIGHTS.fat * adjustedDeviation(actual.fat, target.fat);

  return Math.max(0, 100 - weightedDeviation * 100);
}

/**
 * Computes the full weekly quality score from exactly 7 daily logs
 * (ordered J-7 -> J-1) and the user's daily targets.
 */
export function computeWeeklyQualityScore(
  days: DailyLog[],
  target: NutritionMetrics
): WeeklyQualityScoreResult {
  if (days.length !== 7) {
    throw new Error(`computeWeeklyQualityScore expects exactly 7 days, got ${days.length}`);
  }

  const dayScores = days.map((day) => {
    if (!day.logged || !day.actual) return 0;
    return computeDayScore(day.actual, target);
  });

  const daysLogged = days.filter((day) => day.logged).length;
  const consistencyRatio = daysLogged / 7;
  const sumDayScores = dayScores.reduce((sum, score) => sum + score, 0);
  const qualityScore = Math.round((sumDayScores / 7) * consistencyRatio);

  return { qualityScore, consistencyRatio, daysLogged, dayScores };
}
