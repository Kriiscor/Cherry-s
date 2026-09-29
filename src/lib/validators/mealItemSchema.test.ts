import { describe, expect, it } from "vitest";
import { mealItemFormSchema, mealSaveSchema } from "./mealItemSchema";

describe("mealItemFormSchema", () => {
  const validItem = {
    item_name: "Poulet grillé",
    weight_grams: 150,
    calories: 250,
    protein: 40,
    carbs: 0,
    fat: 8,
  };

  it("accepts a valid item", () => {
    const result = mealItemFormSchema.safeParse(validItem);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.item_name).toBe("Poulet grillé");
    }
  });

  it("sanitizes an injected <script> tag from item_name (XSS guard, TICK-016 scenario)", () => {
    const result = mealItemFormSchema.safeParse({
      ...validItem,
      item_name: "<script>alert('xss')</script>Pomme",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.item_name).not.toContain("<script>");
      expect(result.data.item_name).not.toContain("</script>");
    }
  });

  it("trims whitespace from item_name", () => {
    const result = mealItemFormSchema.safeParse({ ...validItem, item_name: "  Riz  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.item_name).toBe("Riz");
    }
  });

  it("rejects an empty item_name after sanitization", () => {
    const result = mealItemFormSchema.safeParse({ ...validItem, item_name: "<script></script>" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Le nom de l'aliment est requis");
    }
  });

  it("rejects a zero weight_grams", () => {
    const result = mealItemFormSchema.safeParse({ ...validItem, weight_grams: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Le poids doit être supérieur à 0");
    }
  });

  it("rejects a negative weight_grams", () => {
    const result = mealItemFormSchema.safeParse({ ...validItem, weight_grams: -10 });
    expect(result.success).toBe(false);
  });

  it("rejects negative calories/protein/carbs/fat", () => {
    for (const field of ["calories", "protein", "carbs", "fat"] as const) {
      const result = mealItemFormSchema.safeParse({ ...validItem, [field]: -1 });
      expect(result.success, `${field} should reject negative values`).toBe(false);
    }
  });

  it("coerces numeric strings for weight/macros", () => {
    const result = mealItemFormSchema.safeParse({
      ...validItem,
      weight_grams: "150",
      calories: "250",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-numeric macro values", () => {
    const result = mealItemFormSchema.safeParse({ ...validItem, calories: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("mealSaveSchema", () => {
  const validItem = {
    item_name: "Poulet grillé",
    weight_grams: 150,
    calories: 250,
    protein: 40,
    carbs: 0,
    fat: 8,
  };

  it("accepts a valid full payload", () => {
    const result = mealSaveSchema.safeParse({
      meal_type: "lunch",
      photo_url: "https://cdn.example.com/photo.jpg",
      items: [validItem],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a payload without a photo_url", () => {
    const result = mealSaveSchema.safeParse({
      meal_type: "snack",
      items: [validItem],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid meal_type", () => {
    const result = mealSaveSchema.safeParse({
      meal_type: "brunch",
      items: [validItem],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty items array", () => {
    const result = mealSaveSchema.safeParse({
      meal_type: "lunch",
      items: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Ajoute au moins un aliment");
    }
  });

  it("propagates a nested item validation error", () => {
    const result = mealSaveSchema.safeParse({
      meal_type: "lunch",
      items: [{ ...validItem, weight_grams: -5 }],
    });
    expect(result.success).toBe(false);
  });
});
