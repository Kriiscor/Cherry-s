import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { addHydration } from "./actions";

const mockedCreateClient = vi.mocked(createClient);

type MockUser = { id: string } | null;

function createSupabaseMock(
  user: MockUser,
  insertError: { message: string } | null = null
) {
  const singleMock = vi.fn().mockResolvedValue({
    data: insertError ? null : { id: "log-uuid-1" },
    error: insertError,
  });
  const selectMock = vi.fn().mockReturnValue({ single: singleMock });
  const insertMock = vi.fn().mockReturnValue({ select: selectMock });

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: vi.fn((table: string) => {
      if (table === "hydration_logs") {
        return { insert: insertMock };
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
    __mocks: { insertMock },
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("addHydration (TICK-023)", () => {
  it("returns a validation error for amount_ml = 0 without hitting Supabase", async () => {
    const mock = createSupabaseMock({ id: "user-1" });
    mockedCreateClient.mockResolvedValue(
      mock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await addHydration({ amount_ml: 0 });
    expect(result.success).toBe(false);
    expect(mock.from).not.toHaveBeenCalled();
  });

  it("rejects amount > 5000 ml", async () => {
    const mock = createSupabaseMock({ id: "user-1" });
    mockedCreateClient.mockResolvedValue(
      mock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await addHydration({ amount_ml: 9999 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/5000/);
    }
  });

  it("returns an error when the user is unauthenticated", async () => {
    const mock = createSupabaseMock(null);
    mockedCreateClient.mockResolvedValue(
      mock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await addHydration({ amount_ml: 250 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("connecté");
    }
  });

  it("inserts a hydration log and returns its id on success", async () => {
    const mock = createSupabaseMock({ id: "user-1" });
    mockedCreateClient.mockResolvedValue(
      mock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await addHydration({ amount_ml: 250 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.logId).toBe("log-uuid-1");
    }
    expect(mock.__mocks.insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        amount_ml: 250,
      })
    );
  });

  it("surfaces a user-facing error when the insert fails", async () => {
    const mock = createSupabaseMock({ id: "user-1" }, { message: "db down" });
    mockedCreateClient.mockResolvedValue(
      mock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await addHydration({ amount_ml: 500 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Impossible");
    }
  });
});
