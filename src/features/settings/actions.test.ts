import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { updateSettingsAction } from "./actions";

const mockedCreateClient = vi.mocked(createClient);
const mockedRevalidatePath = vi.mocked(revalidatePath);

type MockUser = { id: string } | null;

interface MockSupabaseOptions {
  user: MockUser;
  profileError?: { message: string } | null;
  goalsError?: { message: string } | null;
}

function createSupabaseMock({
  user,
  profileError = null,
  goalsError = null,
}: MockSupabaseOptions) {
  const profileEq = vi.fn().mockResolvedValue({ data: null, error: profileError });
  const profileUpdate = vi.fn(() => ({ eq: profileEq }));

  const goalsUpsert = vi.fn().mockResolvedValue({ data: null, error: goalsError });

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: vi.fn((table: string) => {
      if (table === "profiles") {
        return { update: profileUpdate };
      }
      if (table === "user_goals") {
        return { upsert: goalsUpsert };
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
    __mocks: { profileUpdate, profileEq, goalsUpsert },
  };
}

const validInput = {
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

afterEach(() => {
  vi.clearAllMocks();
});

describe("updateSettingsAction", () => {
  it("returns a validation error for an invalid payload without hitting Supabase", async () => {
    const supabaseMock = createSupabaseMock({ user: { id: "user-1" } });
    mockedCreateClient.mockResolvedValue(
      supabaseMock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await updateSettingsAction({ ...validInput, fullName: "" });

    expect(result.success).toBe(false);
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it("returns an error and does not write when the user is unauthenticated", async () => {
    const supabaseMock = createSupabaseMock({ user: null });
    mockedCreateClient.mockResolvedValue(
      supabaseMock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await updateSettingsAction(validInput);

    expect(result).toEqual({
      success: false,
      error: "Vous devez être connecté pour modifier vos paramètres.",
    });
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it("updates the profile and goals with the right shape on success", async () => {
    const supabaseMock = createSupabaseMock({ user: { id: "user-1" } });
    mockedCreateClient.mockResolvedValue(
      supabaseMock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await updateSettingsAction(validInput);

    expect(result).toEqual({ success: true });
    expect(supabaseMock.__mocks.profileUpdate).toHaveBeenCalledWith({
      full_name: "Corentin Dubail",
    });
    expect(supabaseMock.__mocks.profileEq).toHaveBeenCalledWith("id", "user-1");
    expect(supabaseMock.__mocks.goalsUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        weight_kg: 75,
        height_cm: 175,
        age: 26,
        sex: "male",
        activity_level: "moderate",
        goal_type: "maintain",
        daily_calories: 2200,
        protein_grams: 150,
        carbs_grams: 250,
        fat_grams: 70,
      }),
      { onConflict: "user_id" }
    );
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/settings");
  });

  it("surfaces a user-facing error (not a throw) when the profile update fails", async () => {
    const supabaseMock = createSupabaseMock({
      user: { id: "user-1" },
      profileError: { message: "db down" },
    });
    mockedCreateClient.mockResolvedValue(
      supabaseMock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await updateSettingsAction(validInput);

    expect(result).toEqual({
      success: false,
      error: "Impossible de mettre à jour votre profil. Réessayez.",
    });
    expect(supabaseMock.__mocks.goalsUpsert).not.toHaveBeenCalled();
    expect(mockedRevalidatePath).not.toHaveBeenCalled();
  });

  it("surfaces a user-facing error (not a throw) when the goals update fails", async () => {
    const supabaseMock = createSupabaseMock({
      user: { id: "user-1" },
      goalsError: { message: "constraint violation" },
    });
    mockedCreateClient.mockResolvedValue(
      supabaseMock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await updateSettingsAction(validInput);

    expect(result).toEqual({
      success: false,
      error: "Impossible de mettre à jour vos objectifs. Réessayez.",
    });
    expect(mockedRevalidatePath).not.toHaveBeenCalled();
  });
});
