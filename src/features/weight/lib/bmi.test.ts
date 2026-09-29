import { describe, expect, it } from "vitest";
import { calculateBmi } from "./bmi";

describe("calculateBmi (TICK-020/023)", () => {
  it("calculates IMC 23.3 for 75.5 kg / 1.80 m → 'Corpulence normale' (TICK-020 acceptance test)", () => {
    const result = calculateBmi(75.5, 180);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.value).toBe(23.3);
      expect(result.category).toBe("normal");
      expect(result.label).toBe("Corpulence normale");
    }
  });

  it("classifies BMI < 18.5 as underweight", () => {
    const result = calculateBmi(50, 175);
    expect(result?.category).toBe("underweight");
    expect(result?.label).toBe("Insuffisance pondérale");
  });

  it("classifies BMI 25–29.9 as overweight", () => {
    const result = calculateBmi(88, 175);
    expect(result?.category).toBe("overweight");
    expect(result?.label).toBe("Surpoids");
  });

  it("classifies BMI ≥ 30 as obese", () => {
    const result = calculateBmi(110, 175);
    expect(result?.category).toBe("obese");
    expect(result?.label).toBe("Obésité");
  });

  it("returns null for invalid inputs (weight=0, height=0)", () => {
    expect(calculateBmi(0, 180)).toBeNull();
    expect(calculateBmi(75, 0)).toBeNull();
    expect(calculateBmi(-1, 180)).toBeNull();
  });

  it("rounds BMI to 1 decimal place", () => {
    const result = calculateBmi(70, 175);
    // 70 / 1.75² = 70 / 3.0625 ≈ 22.857 → rounds to 22.9
    expect(result?.value).toBe(22.9);
  });
});
