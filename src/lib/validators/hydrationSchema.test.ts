import { describe, expect, it } from "vitest";
import { hydrationSchema } from "./hydrationSchema";

describe("hydrationSchema (TICK-023)", () => {
  it("accepts 250 ml (standard glass)", () => {
    expect(hydrationSchema.safeParse({ amount_ml: 250 }).success).toBe(true);
  });

  it("accepts 500 ml (standard bottle)", () => {
    expect(hydrationSchema.safeParse({ amount_ml: 500 }).success).toBe(true);
  });

  it("accepts boundary value 1 ml", () => {
    expect(hydrationSchema.safeParse({ amount_ml: 1 }).success).toBe(true);
  });

  it("accepts boundary value 5000 ml", () => {
    expect(hydrationSchema.safeParse({ amount_ml: 5000 }).success).toBe(true);
  });

  it("rejects amount_ml = 0 (min 1)", () => {
    const result = hydrationSchema.safeParse({ amount_ml: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/1/);
    }
  });

  it("rejects amount_ml > 5000", () => {
    const result = hydrationSchema.safeParse({ amount_ml: 5001 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/5000/);
    }
  });

  it("rejects a negative amount", () => {
    expect(hydrationSchema.safeParse({ amount_ml: -100 }).success).toBe(false);
  });

  it("rejects a non-integer amount", () => {
    // The schema requires an integer; 250.5 should be rejected
    expect(hydrationSchema.safeParse({ amount_ml: 250.5 }).success).toBe(false);
  });

  it("coerces a string to a number", () => {
    const result = hydrationSchema.safeParse({ amount_ml: "250" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount_ml).toBe(250);
    }
  });

  it("rejects a non-numeric string", () => {
    expect(hydrationSchema.safeParse({ amount_ml: "water" }).success).toBe(false);
  });
});
