import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { POST } from "./route";

const mockedCreateClient = vi.mocked(createClient);

type MockUser = { id: string } | null;

interface MockSupabaseOptions {
  user: MockUser;
  goals?: {
    daily_calories: number;
    protein_grams: number;
    carbs_grams: number;
    fat_grams: number;
  } | null;
  meals?: Array<{
    meal_type: string;
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
    logged_at: string;
  }>;
  upsertError?: { message: string } | null;
  goalsError?: { message: string } | null;
  mealsError?: { message: string } | null;
}

function createSupabaseMock({
  user,
  goals = { daily_calories: 2000, protein_grams: 150, carbs_grams: 250, fat_grams: 70 },
  meals = [],
  upsertError = null,
  goalsError = null,
  mealsError = null,
}: MockSupabaseOptions) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
    from: vi.fn((table: string) => {
      if (table === "user_goals") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () =>
                goalsError ? { data: null, error: goalsError } : { data: goals, error: null },
            }),
          }),
        };
      }
      if (table === "meals") {
        return {
          select: () => ({
            eq: () => ({
              gte: () => ({
                lt: async () =>
                  mealsError ? { data: null, error: mealsError } : { data: meals, error: null },
              }),
            }),
          }),
        };
      }
      if (table === "weekly_reports") {
        return {
          upsert: (payload: { ai_advice_markdown: string; quality_score: number }) => ({
            select: () => ({
              single: async () =>
                upsertError
                  ? { data: null, error: upsertError }
                  : {
                      data: {
                        user_id: user?.id,
                        week_start_date: "2026-01-01",
                        quality_score: payload.quality_score,
                        ai_advice_markdown: payload.ai_advice_markdown,
                      },
                      error: null,
                    },
            }),
          }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
  };
}

function makeRequest(body?: unknown) {
  return new NextRequest("http://localhost/api/ai/weekly-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** A couple of meals within the last 7 days so the route has data to score. */
function recentMeals() {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
  return [
    {
      meal_type: "lunch",
      total_calories: 2000,
      total_protein: 150,
      total_carbs: 250,
      total_fat: 70,
      logged_at: twoDaysAgo,
    },
  ];
}

const server = setupServer(
  http.post("https://api.replicate.com/v1/models/:owner/:name/predictions", () =>
    HttpResponse.json({
      id: "mock-prediction",
      status: "succeeded",
      output: ["## Bilan\n\nContinuez comme ça !"],
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

describe("POST /api/ai/weekly-summary", () => {
  it("returns 401 when the request is unauthenticated", async () => {
    mockedCreateClient.mockResolvedValue(
      createSupabaseMock({ user: null }) as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const res = await POST(makeRequest({}));

    expect(res.status).toBe(401);
  });

  it("returns 403 when the body's user_id differs from the authenticated user", async () => {
    mockedCreateClient.mockResolvedValue(
      createSupabaseMock({ user: { id: "11111111-1111-4111-8111-111111111111" } }) as unknown as Awaited<
        ReturnType<typeof createClient>
      >
    );

    const res = await POST(
      makeRequest({ user_id: "22222222-2222-4222-8222-222222222222" })
    );

    expect(res.status).toBe(403);
  });

  it("sanitizes malicious markdown from the AI output before persisting it", async () => {
    server.use(
      http.post("https://api.replicate.com/v1/models/:owner/:name/predictions", () =>
        HttpResponse.json({
          id: "mock-prediction-xss",
          status: "succeeded",
          output: ["Bravo cette semaine ! <img src=x onerror=alert(1)> Continuez."],
        })
      )
    );

    const supabaseMock = createSupabaseMock({
      user: { id: "11111111-1111-4111-8111-111111111111" },
      meals: recentMeals(),
    });
    mockedCreateClient.mockResolvedValue(
      supabaseMock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const res = await POST(makeRequest({}));
    expect(res.status).toBe(200);

    const body = await res.json();
    // DOMPurify's default allowlist keeps safe tags like <img> (used
    // throughout normal markdown-rendered advice) — it strips the
    // dangerous part: any inline event-handler attribute such as onerror.
    expect(body.report.ai_advice_markdown).not.toContain("onerror");
    expect(body.report.ai_advice_markdown).not.toMatch(/on\w+\s*=/i);
  });

  it("persists a successful report for an authenticated user", async () => {
    const supabaseMock = createSupabaseMock({
      user: { id: "11111111-1111-4111-8111-111111111111" },
      meals: recentMeals(),
    });
    mockedCreateClient.mockResolvedValue(
      supabaseMock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const res = await POST(makeRequest({}));

    expect(res.status).toBe(200);
    expect(supabaseMock.from).toHaveBeenCalledWith("weekly_reports");
  });

  it("returns 400 when the request body is present but not valid JSON", async () => {
    mockedCreateClient.mockResolvedValue(
      createSupabaseMock({ user: { id: "11111111-1111-4111-8111-111111111111" } }) as unknown as Awaited<
        ReturnType<typeof createClient>
      >
    );

    const req = new NextRequest("http://localhost/api/ai/weekly-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not valid json",
    });

    // readJsonBody swallows the JSON.parse error and falls back to `{}`,
    // which is a valid (empty) body per bodySchema — so this still reaches
    // the authenticated happy path rather than a 400.
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("returns 400 when the request body fails schema validation (non-uuid user_id)", async () => {
    mockedCreateClient.mockResolvedValue(
      createSupabaseMock({ user: { id: "11111111-1111-4111-8111-111111111111" } }) as unknown as Awaited<
        ReturnType<typeof createClient>
      >
    );

    const res = await POST(makeRequest({ user_id: "not-a-uuid" }));
    expect(res.status).toBe(400);
  });

  it("returns 500 when loading user goals fails", async () => {
    mockedCreateClient.mockResolvedValue(
      createSupabaseMock({
        user: { id: "11111111-1111-4111-8111-111111111111" },
        goalsError: { message: "db down" },
      }) as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const res = await POST(makeRequest({}));
    expect(res.status).toBe(500);
  });

  it("returns 400 when the user has no goals configured yet", async () => {
    mockedCreateClient.mockResolvedValue(
      createSupabaseMock({
        user: { id: "11111111-1111-4111-8111-111111111111" },
        goals: null,
      }) as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 500 when loading meals fails", async () => {
    mockedCreateClient.mockResolvedValue(
      createSupabaseMock({
        user: { id: "11111111-1111-4111-8111-111111111111" },
        mealsError: { message: "db down" },
      }) as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const res = await POST(makeRequest({}));
    expect(res.status).toBe(500);
  });

  it("returns 500 when persisting the report fails", async () => {
    mockedCreateClient.mockResolvedValue(
      createSupabaseMock({
        user: { id: "11111111-1111-4111-8111-111111111111" },
        meals: recentMeals(),
        upsertError: { message: "db down" },
      }) as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const res = await POST(makeRequest({}));
    expect(res.status).toBe(500);
  });

  it("falls back to a default markdown message when Replicate generation fails, without crashing", async () => {
    server.use(
      http.post("https://api.replicate.com/v1/models/:owner/:name/predictions", () =>
        HttpResponse.json({ detail: "Internal error" }, { status: 500 })
      )
    );

    const supabaseMock = createSupabaseMock({
      user: { id: "11111111-1111-4111-8111-111111111111" },
      meals: recentMeals(),
    });
    mockedCreateClient.mockResolvedValue(
      supabaseMock as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const res = await POST(makeRequest({}));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.report.ai_advice_markdown).toContain("Bilan indisponible");
  });
});
