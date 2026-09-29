import { describe, expect, it } from "vitest";
import {
  computeDayScore,
  computeWeeklyQualityScore,
  type DailyLog,
  type NutritionMetrics,
} from "./weekly-quality-score";

const TARGET: NutritionMetrics = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 70,
};

function perfectDay(): DailyLog {
  return { logged: true, actual: { ...TARGET } };
}

describe("computeDayScore", () => {
  it("returns 100 when actuals exactly match targets", () => {
    expect(computeDayScore(TARGET, TARGET)).toBe(100);
  });

  it("does not penalize deviations within the 10% tolerance", () => {
    const actual: NutritionMetrics = {
      calories: 2100, // +5%
      protein: 145, // ~-3.3%
      carbs: 240, // -4%
      fat: 72, // ~+2.9%
    };
    expect(computeDayScore(actual, TARGET)).toBe(100);
  });

  it("penalizes deviations beyond the 10% tolerance proportionally", () => {
    // calories +30% -> dev 0.30, dev_adj 0.20, weighted 0.4*0.20 = 0.08
    const actual: NutritionMetrics = {
      calories: 2600,
      protein: 150,
      carbs: 250,
      fat: 70,
    };
    expect(computeDayScore(actual, TARGET)).toBeCloseTo(92, 5);
  });
});

describe("computeWeeklyQualityScore", () => {
  it("returns exactly 100 for a perfect week (7/7 days logged, 0 deviation)", () => {
    const days: DailyLog[] = Array.from({ length: 7 }, () => perfectDay());
    const result = computeWeeklyQualityScore(days, TARGET);

    expect(result.qualityScore).toBe(100);
    expect(result.consistencyRatio).toBe(1);
    expect(result.daysLogged).toBe(7);
    expect(result.dayScores).toEqual([100, 100, 100, 100, 100, 100, 100]);
  });

  it("scores a partial, imperfect week lower than a perfect week", () => {
    const days: DailyLog[] = [
      perfectDay(),
      perfectDay(),
      perfectDay(),
      { logged: false },
      { logged: false },
      {
        logged: true,
        actual: { calories: 3000, protein: 60, carbs: 400, fat: 120 },
      },
      { logged: false },
    ];

    const result = computeWeeklyQualityScore(days, TARGET);

    expect(result.daysLogged).toBe(4);
    expect(result.consistencyRatio).toBeCloseTo(4 / 7, 10);
    expect(result.qualityScore).toBeGreaterThan(0);
    expect(result.qualityScore).toBeLessThan(100);
  });

  it("returns 0 for a week with no logged days", () => {
    const days: DailyLog[] = Array.from({ length: 7 }, () => ({ logged: false }));
    const result = computeWeeklyQualityScore(days, TARGET);

    expect(result.qualityScore).toBe(0);
    expect(result.consistencyRatio).toBe(0);
    expect(result.daysLogged).toBe(0);
  });

  it("throws if given something other than exactly 7 days", () => {
    expect(() => computeWeeklyQualityScore([perfectDay()], TARGET)).toThrow();
  });
});
