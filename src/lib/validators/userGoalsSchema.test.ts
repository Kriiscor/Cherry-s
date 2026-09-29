import { describe, expect, it } from "vitest";
import {
  activityStepSchema,
  profileStepSchema,
  reviewStepSchema,
  userGoalsSchema,
} from "./userGoalsSchema";

describe("profileStepSchema", () => {
  const validProfile = {
    weightKg: 75,
    heightCm: 180,
    age: 30,
    sex: "male" as const,
  };

  it("accepts a valid profile", () => {
    expect(profileStepSchema.safeParse(validProfile).success).toBe(true);
  });

  it("rejects a non-positive weightKg", () => {
    expect(profileStepSchema.safeParse({ ...validProfile, weightKg: 0 }).success).toBe(false);
  });

  it("rejects a non-positive heightCm", () => {
    expect(profileStepSchema.safeParse({ ...validProfile, heightCm: -1 }).success).toBe(false);
  });

  it("rejects a non-integer age", () => {
    expect(profileStepSchema.safeParse({ ...validProfile, age: 30.5 }).success).toBe(false);
  });

  it("rejects a non-positive age", () => {
    expect(profileStepSchema.safeParse({ ...validProfile, age: 0 }).success).toBe(false);
  });

  it("rejects an invalid sex value", () => {
    expect(
      profileStepSchema.safeParse({ ...validProfile, sex: "other" }).success
    ).toBe(false);
  });
});

describe("activityStepSchema", () => {
  it("accepts every documented activityLevel/goalType combination", () => {
    const levels = ["sedentary", "light", "moderate", "active", "very_active"] as const;
    const goals = ["lose", "maintain", "gain"] as const;
    for (const activityLevel of levels) {
      for (const goalType of goals) {
        const result = activityStepSchema.safeParse({ activityLevel, goalType });
        expect(result.success, `${activityLevel}/${goalType}`).toBe(true);
      }
    }
  });

  it("rejects an invalid activityLevel", () => {
    const result = activityStepSchema.safeParse({
      activityLevel: "extreme",
      goalType: "maintain",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid goalType", () => {
    const result = activityStepSchema.safeParse({
      activityLevel: "moderate",
      goalType: "bulk",
    });
    expect(result.success).toBe(false);
  });
});

describe("reviewStepSchema", () => {
  it("accepts valid computed targets", () => {
    const result = reviewStepSchema.safeParse({
      dailyCalories: 2000,
      proteinGrams: 150,
      carbsGrams: 200,
      fatGrams: 60,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-positive dailyCalories", () => {
    const result = reviewStepSchema.safeParse({
      dailyCalories: 0,
      proteinGrams: 150,
      carbsGrams: 200,
      fatGrams: 60,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative macro grams", () => {
    const result = reviewStepSchema.safeParse({
      dailyCalories: 2000,
      proteinGrams: -1,
      carbsGrams: 200,
      fatGrams: 60,
    });
    expect(result.success).toBe(false);
  });
});

describe("userGoalsSchema (full onboarding payload)", () => {
  const validPayload = {
    weightKg: 75,
    heightCm: 180,
    age: 30,
    sex: "male" as const,
    activityLevel: "moderate" as const,
    goalType: "maintain" as const,
    dailyCalories: 2400,
    proteinGrams: 150,
    carbsGrams: 250,
    fatGrams: 70,
  };

  it("accepts a fully valid onboarding payload", () => {
    expect(userGoalsSchema.safeParse(validPayload).success).toBe(true);
  });

  it("rejects when a required field from any step is missing", () => {
    const { sex: _sex, ...rest } = validPayload;
    expect(userGoalsSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects when a field is the wrong type", () => {
    const result = userGoalsSchema.safeParse({ ...validPayload, weightKg: "75" });
    expect(result.success).toBe(false);
  });
});
