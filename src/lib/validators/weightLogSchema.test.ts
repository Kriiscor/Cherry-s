import { describe, expect, it } from "vitest";
import { weightLogSchema } from "./weightLogSchema";

describe("weightLogSchema (TICK-023)", () => {
  const valid = { weight_kg: 75.5 };

  it("accepts a valid weight", () => {
    expect(weightLogSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a weight with an optional note", () => {
    const result = weightLogSchema.safeParse({ ...valid, note: "À jeun" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toBe("À jeun");
    }
  });

  it("sanitizes HTML from the note field", () => {
    const result = weightLogSchema.safeParse({
      ...valid,
      note: "<b>test</b>",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).not.toContain("<b>");
    }
  });

  it("rejects weight below 20 kg", () => {
    const result = weightLogSchema.safeParse({ weight_kg: 19.9 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/20/);
    }
  });

  it("rejects weight above 300 kg (aberrant value)", () => {
    const result = weightLogSchema.safeParse({ weight_kg: 1000 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/300/);
    }
  });

  it("rejects weight_kg = 0", () => {
    expect(weightLogSchema.safeParse({ weight_kg: 0 }).success).toBe(false);
  });

  it("rejects a negative weight", () => {
    expect(weightLogSchema.safeParse({ weight_kg: -5 }).success).toBe(false);
  });

  it("coerces a string weight to a number", () => {
    const result = weightLogSchema.safeParse({ weight_kg: "75.5" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.weight_kg).toBe(75.5);
    }
  });

  it("rejects a non-numeric weight string", () => {
    expect(weightLogSchema.safeParse({ weight_kg: "heavy" }).success).toBe(false);
  });
});
