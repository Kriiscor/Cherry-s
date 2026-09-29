import { describe, expect, it } from "vitest";
import { estimateCaloriesBurned } from "./calories";

describe("estimateCaloriesBurned (TICK-018/023)", () => {
  it("calculates correctly for 80 kg, MET 9.8, 30 min → ≈392 kcal", () => {
    // TICK-018 acceptance test: 80 kg × MET 9.8 × (30/60) = 392 kcal
    expect(estimateCaloriesBurned(9.8, 80, 30)).toBe(392);
  });

  it("returns 0 for zero MET", () => {
    expect(estimateCaloriesBurned(0, 80, 30)).toBe(0);
  });

  it("returns 0 for zero weight", () => {
    expect(estimateCaloriesBurned(9.8, 0, 30)).toBe(0);
  });

  it("returns 0 for zero duration", () => {
    expect(estimateCaloriesBurned(9.8, 80, 0)).toBe(0);
  });

  it("returns 0 for negative inputs", () => {
    expect(estimateCaloriesBurned(-1, 80, 30)).toBe(0);
    expect(estimateCaloriesBurned(9.8, -5, 30)).toBe(0);
    expect(estimateCaloriesBurned(9.8, 80, -10)).toBe(0);
  });

  it("rounds to the nearest integer", () => {
    // MET 3.5, 70 kg, 45 min → 3.5 × 70 × 0.75 = 183.75 → 184
    expect(estimateCaloriesBurned(3.5, 70, 45)).toBe(184);
  });
});
