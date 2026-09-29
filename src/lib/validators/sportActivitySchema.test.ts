import { describe, expect, it } from "vitest";
import { sportActivitySchema } from "./sportActivitySchema";

describe("sportActivitySchema (TICK-023)", () => {
  const valid = {
    activity_name: "Course à pied",
    met_value: 9.8,
    duration_minutes: 30,
    calories_burned: 392,
  };

  it("accepts a valid activity", () => {
    expect(sportActivitySchema.safeParse(valid).success).toBe(true);
  });

  it("sanitizes an injected <script> tag from activity_name (XSS guard)", () => {
    const result = sportActivitySchema.safeParse({
      ...valid,
      activity_name: "<script>alert('xss')</script>Course",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.activity_name).not.toContain("<script>");
    }
  });

  it("rejects an empty activity_name after sanitization", () => {
    const result = sportActivitySchema.safeParse({
      ...valid,
      activity_name: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("rejects duration_minutes = 0 (min 1)", () => {
    const result = sportActivitySchema.safeParse({ ...valid, duration_minutes: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/1 minute/i);
    }
  });

  it("rejects duration_minutes > 1440 (24 h max)", () => {
    const result = sportActivitySchema.safeParse({ ...valid, duration_minutes: 1441 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/1440/);
    }
  });

  it("rejects a negative duration", () => {
    expect(sportActivitySchema.safeParse({ ...valid, duration_minutes: -1 }).success).toBe(false);
  });

  it("rejects calories_burned = 0 (min 1)", () => {
    expect(sportActivitySchema.safeParse({ ...valid, calories_burned: 0 }).success).toBe(false);
  });

  it("rejects calories_burned > 10000", () => {
    const result = sportActivitySchema.safeParse({ ...valid, calories_burned: 10001 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/10000/);
    }
  });

  it("rejects a non-positive MET value", () => {
    expect(sportActivitySchema.safeParse({ ...valid, met_value: 0 }).success).toBe(false);
    expect(sportActivitySchema.safeParse({ ...valid, met_value: -1 }).success).toBe(false);
  });

  it("coerces string inputs for numeric fields", () => {
    const result = sportActivitySchema.safeParse({
      ...valid,
      duration_minutes: "30",
      calories_burned: "392",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-numeric input", () => {
    expect(
      sportActivitySchema.safeParse({ ...valid, duration_minutes: "abc" }).success
    ).toBe(false);
  });
});
