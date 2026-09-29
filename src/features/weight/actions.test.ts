import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { logWeight, deleteWeight } from "./actions";

const mockedCreateClient = vi.mocked(createClient);

type MockUser = { id: string } | null;

function createSupabaseMock(
  user: MockUser,
  insertError: { message: string } | null = null,
  deleteError: { message: string } | null = null
) {
  const singleMock = vi.fn().mockResolvedValue({
    data: insertError ? null : { id: "log-uuid-1" },
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
      if (table === "weight_logs") {
        return { insert: insertMock, delete: deleteFn };
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
    __mocks: { insertMock, singleMock },
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("logWeight (TICK-023)", () => {
  it("returns a validation error for weight < 20 kg without hitting Supabase", async () => {
    const mock = createSupabaseMock({ id: "user-1" });
    mockedCreateClient.mockResolvedValue(
      mock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await logWeight({ weight_kg: 15 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/20/);
    }
    expect(mock.from).not.toHaveBeenCalled();
  });

  it("rejects aberrant weight (1000 kg)", async () => {
    const mock = createSupabaseMock({ id: "user-1" });
    mockedCreateClient.mockResolvedValue(
      mock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await logWeight({ weight_kg: 1000 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/300/);
    }
    expect(mock.from).not.toHaveBeenCalled();
  });

  it("returns an error when the user is unauthenticated", async () => {
    const mock = createSupabaseMock(null);
    mockedCreateClient.mockResolvedValue(
      mock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await logWeight({ weight_kg: 75 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("connecté");
    }
  });

  it("inserts a weight log and returns its id on success", async () => {
    const mock = createSupabaseMock({ id: "user-1" });
    mockedCreateClient.mockResolvedValue(
      mock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await logWeight({ weight_kg: 75.5, note: "À jeun" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.logId).toBe("log-uuid-1");
    }
    expect(mock.__mocks.insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        weight_kg: 75.5,
        note: "À jeun",
      })
    );
  });
});

describe("deleteWeight (TICK-023)", () => {
  it("returns an error when the user is unauthenticated", async () => {
    const mock = createSupabaseMock(null);
    mockedCreateClient.mockResolvedValue(
      mock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await deleteWeight("log-uuid-1");
    expect(result.success).toBe(false);
  });

  it("returns success when the delete goes through", async () => {
    const mock = createSupabaseMock({ id: "user-1" });
    mockedCreateClient.mockResolvedValue(
      mock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const result = await deleteWeight("log-uuid-1");
    expect(result.success).toBe(true);
  });
});
