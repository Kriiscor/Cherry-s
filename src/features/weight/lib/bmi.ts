/**
 * Body Mass Index (IMC) calculation and WHO classification (TICK-020).
 * IMC = weight(kg) / height(m)²
 */

export type BmiCategory = "underweight" | "normal" | "overweight" | "obese";

export type BmiResult = {
  value: number;
  category: BmiCategory;
  label: string;
  /** Tailwind badge colour intent: "secondary" = neutral, "default" = green/primary, "destructive" = red. */
  variant: "secondary" | "default" | "destructive";
};

/**
 * Calculates the BMI and returns a localised result object.
 * Returns `null` for invalid inputs (weight ≤ 0, height ≤ 0).
 */
export function calculateBmi(
  weightKg: number,
  heightCm: number
): BmiResult | null {
  if (weightKg <= 0 || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  const raw = weightKg / (heightM * heightM);
  const value = Math.round(raw * 10) / 10;

  if (value < 18.5) {
    return {
      value,
      category: "underweight",
      label: "Insuffisance pondérale",
      variant: "secondary",
    };
  }
  if (value < 25) {
    return {
      value,
      category: "normal",
      label: "Corpulence normale",
      variant: "default",
    };
  }
  if (value < 30) {
    return {
      value,
      category: "overweight",
      label: "Surpoids",
      variant: "secondary",
    };
  }
  return {
    value,
    category: "obese",
    label: "Obésité",
    variant: "destructive",
  };
}
