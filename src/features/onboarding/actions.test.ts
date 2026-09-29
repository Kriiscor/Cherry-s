import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { saveUserGoals } from "./actions";

const mockedCreateClient = vi.mocked(createClient);
const mockedRedirect = vi.mocked(redirect);

type MockUser = { id: string } | null;

function createSupabaseMock(user: MockUser, upsertError: { message: string } | null = null) {
  const upsert = vi.fn().mockResolvedValue({ data: null, error: upsertError });
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: vi.fn((table: string) => {
      if (table === "user_goals") {
        return { upsert };
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
    __mocks: { upsert },
  };
}

const validInput = {
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

afterEach(() => {
  vi.clearAllMocks();
});

describe("saveUserGoals", () => {
  it("returns a validation error for an invalid payload without hitting Supabase", async () => {
    const supabaseMock = createSupabaseMock({ id: "user-1" });
    mockedCreateClient.mockResolvedValue(
      supabaseMock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await saveUserGoals({ ...validInput, weightKg: -5 });

    expect(result.error).toBeDefined();
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it("returns an error and does not write when the user is unauthenticated", async () => {
    const supabaseMock = createSupabaseMock(null);
    mockedCreateClient.mockResolvedValue(
      supabaseMock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await saveUserGoals(validInput);

    expect(result).toEqual({ error: "Vous devez être connecté pour continuer." });
    expect(supabaseMock.from).not.toHaveBeenCalled();
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it("upserts the goals with the right shape and redirects on success", async () => {
    const supabaseMock = createSupabaseMock({ id: "user-1" });
    mockedCreateClient.mockResolvedValue(
      supabaseMock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    await expect(saveUserGoals(validInput)).rejects.toThrow("NEXT_REDIRECT");

    expect(supabaseMock.__mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        weight_kg: 75,
        height_cm: 180,
        age: 30,
        sex: "male",
        activity_level: "moderate",
        goal_type: "maintain",
        daily_calories: 2400,
        protein_grams: 150,
        carbs_grams: 250,
        fat_grams: 70,
      }),
      { onConflict: "user_id" }
    );
    expect(mockedRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("surfaces a user-facing error (not a throw) when the upsert fails", async () => {
    const supabaseMock = createSupabaseMock({ id: "user-1" }, { message: "db down" });
    mockedCreateClient.mockResolvedValue(
      supabaseMock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await saveUserGoals(validInput);

    expect(result).toEqual({ error: "Impossible d'enregistrer vos objectifs. Réessayez." });
    expect(mockedRedirect).not.toHaveBeenCalled();
  });
});
