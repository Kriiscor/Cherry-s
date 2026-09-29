import { describe, expect, it } from "vitest";
import {
  computeBMR,
  computeNutritionGoals,
  computeTDEE,
} from "./nutrition-goals";

describe("computeBMR", () => {
  it("adds +5 for male per Mifflin-St Jeor", () => {
    expect(computeBMR(80, 180, 30, "male")).toBeCloseTo(
      10 * 80 + 6.25 * 180 - 5 * 30 + 5
    );
  });

  it("subtracts 161 for female per Mifflin-St Jeor", () => {
    expect(computeBMR(60, 165, 28, "female")).toBeCloseTo(
      10 * 60 + 6.25 * 165 - 5 * 28 - 161
    );
  });
});

describe("computeTDEE", () => {
  it("applies the activity multiplier to BMR", () => {
    expect(computeTDEE(1700, "sedentary")).toBeCloseTo(1700 * 1.2);
    expect(computeTDEE(1700, "light")).toBeCloseTo(1700 * 1.375);
    expect(computeTDEE(1700, "moderate")).toBeCloseTo(1700 * 1.55);
    expect(computeTDEE(1700, "active")).toBeCloseTo(1700 * 1.725);
    expect(computeTDEE(1700, "very_active")).toBeCloseTo(1700 * 1.9);
  });
});

describe("computeNutritionGoals", () => {
  it("matches the ticket's nominal scenario: 80kg male, moderate activity, weight loss", () => {
    const result = computeNutritionGoals({
      weightKg: 80,
      heightCm: 180,
      age: 30,
      sex: "male",
      activityLevel: "moderate",
      goalType: "lose",
    });

    // BMR = 10*80 + 6.25*180 - 5*30 + 5 = 1780
    // TDEE = 1780 * 1.55 = 2759
    // dailyCalories = 2759 - 500 = 2259
    expect(result.dailyCalories).toBeGreaterThanOrEqual(2200);
    expect(result.dailyCalories).toBeLessThanOrEqual(2400);

    // protein = 35% of calories at 4 kcal/g
    expect(result.proteinGrams).toBeGreaterThanOrEqual(190);
    expect(result.proteinGrams).toBeLessThanOrEqual(210);
  });

  it("splits macros 30/40/30 for maintain and derives grams from calories", () => {
    const result = computeNutritionGoals({
      weightKg: 70,
      heightCm: 170,
      age: 25,
      sex: "female",
      activityLevel: "sedentary",
      goalType: "maintain",
    });

    const expectedProtein = Math.round((result.dailyCalories * 0.3) / 4);
    const expectedCarbs = Math.round((result.dailyCalories * 0.4) / 4);
    const expectedFat = Math.round((result.dailyCalories * 0.3) / 9);

    expect(result.proteinGrams).toBe(expectedProtein);
    expect(result.carbsGrams).toBe(expectedCarbs);
    expect(result.fatGrams).toBe(expectedFat);
  });

  it("adds a 300 kcal surplus over TDEE for gain", () => {
    const bmr = computeBMR(75, 178, 24, "male");
    const tdee = computeTDEE(bmr, "active");
    const result = computeNutritionGoals({
      weightKg: 75,
      heightCm: 178,
      age: 24,
      sex: "male",
      activityLevel: "active",
      goalType: "gain",
    });

    expect(result.dailyCalories).toBe(Math.round(tdee + 300));
  });
});
