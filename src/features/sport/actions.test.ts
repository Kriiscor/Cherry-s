import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { logSportActivity, deleteSportActivity } from "./actions";

const mockedCreateClient = vi.mocked(createClient);

type MockUser = { id: string } | null;

function createSupabaseMock(
  user: MockUser,
  insertError: { message: string } | null = null,
  deleteError: { message: string } | null = null
) {
  const singleMock = vi.fn().mockResolvedValue({
    data: insertError ? null : { id: "activity-uuid-1" },
    error: insertError,
  });
  const selectMock = vi.fn().mockReturnValue({ single: singleMock });
  const insertMock = vi.fn().mockReturnValue({ select: selectMock });
  const deleteFn = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: deleteError }),
    }),
  });

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: vi.fn((table: string) => {
      if (table === "sports_activities") {
        return {
          insert: insertMock,
          delete: deleteFn,
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
    __mocks: { insertMock, singleMock, deleteFn },
  };
}

const validInput = {
  activity_name: "Course à pied",
  met_value: 9.8,
  duration_minutes: 30,
  calories_burned: 392,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("logSportActivity (TICK-023)", () => {
  it("returns a validation error for an invalid payload without hitting Supabase", async () => {
    const mock = createSupabaseMock({ id: "user-1" });
    mockedCreateClient.mockResolvedValue(
      mock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await logSportActivity({ ...validInput, duration_minutes: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/1 minute/i);
    }
    expect(mock.from).not.toHaveBeenCalled();
  });

  it("returns an error when the user is unauthenticated", async () => {
    const mock = createSupabaseMock(null);
    mockedCreateClient.mockResolvedValue(
      mock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await logSportActivity(validInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("connecté");
    }
    expect(mock.from).not.toHaveBeenCalled();
  });

  it("inserts an activity and returns its id on success", async () => {
    const mock = createSupabaseMock({ id: "user-1" });
    mockedCreateClient.mockResolvedValue(
      mock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await logSportActivity(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.activityId).toBe("activity-uuid-1");
    }
    expect(mock.__mocks.insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        activity_name: "Course à pied",
        met_value: 9.8,
        duration_minutes: 30,
        calories_burned: 392,
      })
    );
  });

  it("surfaces a user-facing error when the insert fails", async () => {
    const mock = createSupabaseMock({ id: "user-1" }, { message: "db down" });
    mockedCreateClient.mockResolvedValue(
      mock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await logSportActivity(validInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Impossible");
    }
  });
});

describe("deleteSportActivity (TICK-023)", () => {
  it("returns an error when the user is unauthenticated", async () => {
    const mock = createSupabaseMock(null);
    mockedCreateClient.mockResolvedValue(
      mock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await deleteSportActivity("activity-uuid-1");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("connecté");
    }
  });

  it("returns success when the delete goes through", async () => {
    const mock = createSupabaseMock({ id: "user-1" });
    mockedCreateClient.mockResolvedValue(
      mock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await deleteSportActivity("activity-uuid-1");
    expect(result.success).toBe(true);
  });
});
