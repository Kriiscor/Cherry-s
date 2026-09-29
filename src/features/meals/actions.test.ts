import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { saveMealAction, updateMealAction } from "./actions";

const mockedCreateClient = vi.mocked(createClient);
const mockedRevalidatePath = vi.mocked(revalidatePath);

type MockUser = { id: string } | null;

interface MockSupabaseOptions {
  user: MockUser;
  mealInsertError?: { message: string } | null;
  itemsInsertError?: { message: string } | null;
  mealUpdateError?: { message: string } | null;
  itemsDeleteError?: { message: string } | null;
}

function createSupabaseMock({
  user,
  mealInsertError = null,
  itemsInsertError = null,
  mealUpdateError = null,
  itemsDeleteError = null,
}: MockSupabaseOptions) {
  const deleteEq = vi.fn().mockResolvedValue({ data: null, error: null });
  const mealsDelete = vi.fn(() => ({ eq: deleteEq }));

  const mealsInsertSingle = vi.fn().mockResolvedValue(
    mealInsertError
      ? { data: null, error: mealInsertError }
      : { data: { id: "meal-123" }, error: null }
  );
  const mealsInsertSelect = vi.fn(() => ({ single: mealsInsertSingle }));
  const mealsInsert = vi.fn(() => ({ select: mealsInsertSelect }));

  const mealUpdateUserEq = vi.fn().mockResolvedValue({
    data: null,
    error: mealUpdateError,
  });
  const mealUpdateIdEq = vi.fn(() => ({ eq: mealUpdateUserEq }));
  const mealsUpdate = vi.fn(() => ({ eq: mealUpdateIdEq }));

  const itemsDeleteMealEq = vi.fn().mockResolvedValue({
    data: null,
    error: itemsDeleteError,
  });
  const itemsDelete = vi.fn(() => ({ eq: itemsDeleteMealEq }));

  const itemsInsert = vi.fn().mockResolvedValue({
    data: null,
    error: itemsInsertError,
  });

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: vi.fn((table: string) => {
      if (table === "meals") {
        return { insert: mealsInsert, delete: mealsDelete, update: mealsUpdate };
      }
      if (table === "meal_items") {
        return { insert: itemsInsert, delete: itemsDelete };
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
    __mocks: {
      deleteEq,
      mealsDelete,
      mealsInsert,
      mealsUpdate,
      itemsDelete,
      itemsInsert,
    },
  };
}

const validInput = {
  meal_type: "lunch" as const,
  photo_url: "https://cdn.example.com/photo.jpg",
  items: [
    {
      item_name: "Poulet grillé",
      weight_grams: 150,
      calories: 250,
      protein: 40,
      carbs: 0,
      fat: 8,
    },
  ],
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("saveMealAction", () => {
  it("returns a validation error for an invalid payload without hitting Supabase", async () => {
    const supabaseMock = createSupabaseMock({ user: { id: "user-1" } });
    mockedCreateClient.mockResolvedValue(
      supabaseMock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await saveMealAction({
      ...validInput,
      items: [],
    } as unknown as typeof validInput);

    expect(result.success).toBe(false);
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it("returns an error and does not write when the user is unauthenticated", async () => {
    const supabaseMock = createSupabaseMock({ user: null });
    mockedCreateClient.mockResolvedValue(
      supabaseMock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await saveMealAction(validInput);

    expect(result).toEqual({
      success: false,
      error: "Vous devez être connecté pour enregistrer un repas.",
    });
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it("inserts the meal and its items with the right shape on success", async () => {
    const supabaseMock = createSupabaseMock({ user: { id: "user-1" } });
    mockedCreateClient.mockResolvedValue(
      supabaseMock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await saveMealAction(validInput);

    expect(result).toEqual({ success: true, mealId: "meal-123" });
    expect(supabaseMock.__mocks.mealsInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        meal_type: "lunch",
        photo_url: "https://cdn.example.com/photo.jpg",
        total_calories: 250,
        total_protein: 40,
        total_carbs: 0,
        total_fat: 8,
      })
    );
    expect(supabaseMock.__mocks.itemsInsert).toHaveBeenCalledWith([
      expect.objectContaining({
        meal_id: "meal-123",
        item_name: "Poulet grillé",
        weight_grams: 150,
        calories: 250,
        protein: 40,
        carbs: 0,
        fat: 8,
      }),
    ]);
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("defaults photo_url to null when omitted", async () => {
    const supabaseMock = createSupabaseMock({ user: { id: "user-1" } });
    mockedCreateClient.mockResolvedValue(
      supabaseMock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const { photo_url: _photo_url, ...withoutPhoto } = validInput;
    await saveMealAction(withoutPhoto);

    expect(supabaseMock.__mocks.mealsInsert).toHaveBeenCalledWith(
      expect.objectContaining({ photo_url: null })
    );
  });

  it("surfaces a user-facing error (not a throw) when the meal insert fails", async () => {
    const supabaseMock = createSupabaseMock({
      user: { id: "user-1" },
      mealInsertError: { message: "db down" },
    });
    mockedCreateClient.mockResolvedValue(
      supabaseMock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await saveMealAction(validInput);

    expect(result).toEqual({
      success: false,
      error: "Impossible d'enregistrer le repas. Réessaie plus tard.",
    });
  });

  it("rolls back the meal row and surfaces an error when the items insert fails", async () => {
    const supabaseMock = createSupabaseMock({
      user: { id: "user-1" },
      itemsInsertError: { message: "constraint violation" },
    });
    mockedCreateClient.mockResolvedValue(
      supabaseMock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await saveMealAction(validInput);

    expect(result).toEqual({
      success: false,
      error: "Impossible d'enregistrer les aliments du repas. Réessaie plus tard.",
    });
    expect(supabaseMock.__mocks.mealsDelete).toHaveBeenCalled();
    expect(supabaseMock.__mocks.deleteEq).toHaveBeenCalledWith("id", "meal-123");
  });
});

describe("updateMealAction", () => {
  it("rejects when mealId is missing", async () => {
    const result = await updateMealAction({
      mealId: "",
      ...validInput,
    });
    expect(result.success).toBe(false);
  });

  it("updates meal and replaces items on success", async () => {
    const supabaseMock = createSupabaseMock({ user: { id: "user-1" } });
    mockedCreateClient.mockResolvedValue(
      supabaseMock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await updateMealAction({
      mealId: "meal-999",
      ...validInput,
    });

    expect(result).toEqual({ success: true, mealId: "meal-999" });
    expect(supabaseMock.__mocks.mealsUpdate).toHaveBeenCalled();
    expect(supabaseMock.__mocks.itemsDelete).toHaveBeenCalled();
    expect(supabaseMock.__mocks.itemsInsert).toHaveBeenCalled();
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});
