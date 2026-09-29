import { describe, expect, it } from "vitest";
import { settingsSchema } from "./settingsSchema";

describe("settingsSchema", () => {
  const validPayload = {
    fullName: "Corentin Dubail",
    weightKg: 75,
    heightCm: 175,
    age: 26,
    sex: "male" as const,
    activityLevel: "moderate" as const,
    goalType: "maintain" as const,
    dailyCalories: 2200,
    proteinGrams: 150,
    carbsGrams: 250,
    fatGrams: 70,
  };

  it("accepts a valid payload", () => {
    const result = settingsSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("trims fullName", () => {
    const result = settingsSchema.safeParse({ ...validPayload, fullName: "  Corentin  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fullName).toBe("Corentin");
    }
  });

  it("rejects an empty fullName", () => {
    const result = settingsSchema.safeParse({ ...validPayload, fullName: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Le nom est requis");
    }
  });

  it("rejects a whitespace-only fullName", () => {
    const result = settingsSchema.safeParse({ ...validPayload, fullName: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects invalid weight, height, or age", () => {
    expect(settingsSchema.safeParse({ ...validPayload, weightKg: 0 }).success).toBe(false);
    expect(settingsSchema.safeParse({ ...validPayload, heightCm: -10 }).success).toBe(false);
    expect(settingsSchema.safeParse({ ...validPayload, age: 25.5 }).success).toBe(false);
  });

  it("rejects invalid sex, activityLevel, or goalType", () => {
    expect(settingsSchema.safeParse({ ...validPayload, sex: "other" }).success).toBe(false);
    expect(settingsSchema.safeParse({ ...validPayload, activityLevel: "unknown" }).success).toBe(false);
    expect(settingsSchema.safeParse({ ...validPayload, goalType: "extreme" }).success).toBe(false);
  });

  it("rejects a zero or negative dailyCalories", () => {
    expect(settingsSchema.safeParse({ ...validPayload, dailyCalories: 0 }).success).toBe(false);
    expect(settingsSchema.safeParse({ ...validPayload, dailyCalories: -100 }).success).toBe(false);
  });

  it("rejects negative macro grams", () => {
    for (const field of ["proteinGrams", "carbsGrams", "fatGrams"] as const) {
      const result = settingsSchema.safeParse({ ...validPayload, [field]: -1 });
      expect(result.success, `${field} should reject negative values`).toBe(false);
    }
  });

  it("accepts zero macro grams (nonnegative, not strictly positive)", () => {
    const result = settingsSchema.safeParse({
      ...validPayload,
      proteinGrams: 0,
      carbsGrams: 0,
      fatGrams: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing dailyCalories field", () => {
    const { dailyCalories: _dailyCalories, ...rest } = validPayload;
    const result = settingsSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});
