import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { NextRequest } from "next/server";

// Must be set before ./route is imported, since src/lib/replicate/client.ts
// reads it at module load time to configure the Replicate SDK client.
const MOCK_REPLICATE_TOKEN = "r8_mock_test_token_do_not_use";
process.env.REPLICATE_API_TOKEN = MOCK_REPLICATE_TOKEN;

const { POST } = await import("./route");

// Text-only requests (no imageUrl) hit MEAL_TEXT_MODEL via the "official
// model" shortcut endpoint.
const REPLICATE_PREDICTIONS_URL =
  "https://api.replicate.com/v1/models/meta/meta-llama-3-8b-instruct/predictions";
// imageUrl requests hit MEAL_VISION_MODEL, which is pinned to a specific
// version (`owner/name:version`) — the SDK routes that through the classic,
// non-shortcut endpoint instead.
const REPLICATE_VISION_PREDICTIONS_URL = "https://api.replicate.com/v1/predictions";

const MOCK_MEAL_ITEMS = [
  {
    item_name: "Poulet grillé",
    weight_grams: 150,
    calories: 250,
    protein: 40,
    carbs: 0,
    fat: 8,
  },
  {
    item_name: "Riz blanc",
    weight_grams: 200,
    calories: 260,
    protein: 5,
    carbs: 56,
    fat: 0.5,
  },
];

function mockPredictionResponse() {
  return HttpResponse.json({
    id: "mock-prediction-id",
    status: "succeeded",
    output: [JSON.stringify(MOCK_MEAL_ITEMS)],
    urls: {
      get: "https://api.replicate.com/v1/predictions/mock-prediction-id",
      cancel:
        "https://api.replicate.com/v1/predictions/mock-prediction-id/cancel",
    },
  });
}

const server = setupServer(
  http.post(REPLICATE_PREDICTIONS_URL, mockPredictionResponse),
  http.post(REPLICATE_VISION_PREDICTIONS_URL, mockPredictionResponse)
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeRequest(
  body: unknown,
  extraHeaders: Record<string, string> = {}
): NextRequest {
  return new NextRequest("http://localhost:3000/api/ai/analyze-meal", {
    method: "POST",
    headers: { "content-type": "application/json", ...extraHeaders },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ai/analyze-meal", () => {
  it("scenario 1 (nominal): returns 200 with structured meal items from a mocked Replicate response", async () => {
    const response = await POST(
      makeRequest(
        { textDescription: "Poulet grillé avec du riz blanc" },
        { "x-forwarded-for": "10.0.0.1" }
      )
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ items: MOCK_MEAL_ITEMS });
  });

  it("succeeds with a valid imageUrl under the size limit (full validateImageUrl happy path)", async () => {
    server.use(
      http.get("https://cdn.example.com/valid-meal.jpg", () => {
        return new HttpResponse(new Uint8Array(1024).fill(1), {
          headers: {
            "Content-Type": "image/jpeg",
            "Content-Length": "1024",
          },
        });
      })
    );

    const response = await POST(
      makeRequest(
        { imageUrl: "https://cdn.example.com/valid-meal.jpg" },
        { "x-forwarded-for": "10.0.0.20" }
      )
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ items: MOCK_MEAL_ITEMS });
  });

  it("uses x-real-ip as a fallback client identifier when x-forwarded-for is absent", async () => {
    const response = await POST(
      makeRequest(
        { textDescription: "Salade" },
        { "x-real-ip": "10.0.0.21" }
      )
    );
    expect(response.status).toBe(200);
  });

  it("rejects an image whose declared Content-Length is missing but whose real byte count exceeds the 5 MB limit mid-stream", async () => {
    server.use(
      http.get("https://cdn.example.com/lying-stream.jpg", () => {
        // No Content-Length header — forces validateImageUrl to fall through
        // to the streaming byte-count loop instead of the declared-length check.
        return new HttpResponse(new Uint8Array(6 * 1024 * 1024).fill(1), {
          headers: { "Content-Type": "image/jpeg" },
        });
      })
    );

    const response = await POST(
      makeRequest(
        { imageUrl: "https://cdn.example.com/lying-stream.jpg" },
        { "x-forwarded-for": "10.0.0.22" }
      )
    );

    expect(response.status).toBe(413);
  });

  it("returns 400 when the image URL fetch throws a network error", async () => {
    server.use(
      http.get("https://cdn.example.com/network-error.jpg", () => {
        return HttpResponse.error();
      })
    );

    const response = await POST(
      makeRequest(
        { imageUrl: "https://cdn.example.com/network-error.jpg" },
        { "x-forwarded-for": "10.0.0.23" }
      )
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 when the image URL responds with a non-OK status", async () => {
    server.use(
      http.get("https://cdn.example.com/not-found.jpg", () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    const response = await POST(
      makeRequest(
        { imageUrl: "https://cdn.example.com/not-found.jpg" },
        { "x-forwarded-for": "10.0.0.24" }
      )
    );

    expect(response.status).toBe(400);
  });

  it("returns 413 when the Content-Length request header exceeds the max request body size", async () => {
    const response = await POST(
      makeRequest(
        { textDescription: "x".repeat(10) },
        { "x-forwarded-for": "10.0.0.25", "content-length": String(2 * 1024 * 1024) }
      )
    );

    expect(response.status).toBe(413);
  });

  it("returns 400 when the request body is not valid JSON", async () => {
    const request = new NextRequest("http://localhost:3000/api/ai/analyze-meal", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "10.0.0.26" },
      body: "{not valid json",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when neither imageUrl nor textDescription is provided", async () => {
    const response = await POST(makeRequest({}, { "x-forwarded-for": "10.0.0.2" }));
    expect(response.status).toBe(400);
  });

  it("returns 400 for an invalid imageUrl (fails Zod validation)", async () => {
    const response = await POST(
      makeRequest(
        { imageUrl: "not-a-valid-url" },
        { "x-forwarded-for": "10.0.0.3" }
      )
    );
    expect(response.status).toBe(400);
  });

  it("scenario 3 (security payload): rejects a 10 MB file disguised as an image with 413 or 400", async () => {
    const disguisedFile = new Uint8Array(10 * 1024 * 1024).fill(65); // 10 MB of "A" bytes, a text file in disguise
    server.use(
      http.get("https://cdn.example.com/disguised-meal.jpg", () => {
        return new HttpResponse(disguisedFile, {
          headers: {
            // Spoofed to look like an accepted image MIME type / size.
            "Content-Type": "image/jpeg",
            "Content-Length": String(disguisedFile.byteLength),
          },
        });
      })
    );

    const response = await POST(
      makeRequest(
        { imageUrl: "https://cdn.example.com/disguised-meal.jpg" },
        { "x-forwarded-for": "10.0.0.4" }
      )
    );

    expect([400, 413]).toContain(response.status);
  });

  it("rejects an image URL whose real MIME type is not in the whitelist", async () => {
    server.use(
      http.get("https://cdn.example.com/not-an-image.txt", () => {
        return new HttpResponse("just some text", {
          headers: { "Content-Type": "text/plain" },
        });
      })
    );

    const response = await POST(
      makeRequest(
        { imageUrl: "https://cdn.example.com/not-an-image.txt" },
        { "x-forwarded-for": "10.0.0.5" }
      )
    );

    expect(response.status).toBe(400);
  });

  it("scenario 4 (secret non-exposé): never leaks REPLICATE_API_TOKEN in the response body or headers", async () => {
    const response = await POST(
      makeRequest(
        { textDescription: "Salade César" },
        { "x-forwarded-for": "10.0.0.6" }
      )
    );

    const text = await response.text();
    expect(text).not.toContain(MOCK_REPLICATE_TOKEN);

    for (const [key, value] of response.headers.entries()) {
      expect(key.toLowerCase()).not.toBe("authorization");
      expect(value).not.toContain(MOCK_REPLICATE_TOKEN);
    }
  });

  it("scenario 2a (Replicate 429): surfaces a clean error when Replicate itself rate-limits the request", async () => {
    server.use(
      http.post(REPLICATE_PREDICTIONS_URL, () => {
        return HttpResponse.json(
          { detail: "Request was throttled." },
          { status: 429 }
        );
      })
    );

    const response = await POST(
      makeRequest(
        { textDescription: "Poulet grillé" },
        { "x-forwarded-for": "10.0.0.8" }
      )
    );

    expect(response.status).toBeGreaterThanOrEqual(400);
    const body = await response.json();
    expect(body).not.toHaveProperty("items");
  });

  it("scenario 2b (Replicate 500): surfaces a clean 500 (not a crash) when Replicate has an internal error", async () => {
    server.use(
      http.post(REPLICATE_PREDICTIONS_URL, () => {
        return HttpResponse.json(
          { detail: "Internal server error" },
          { status: 500 }
        );
      })
    );

    const response = await POST(
      makeRequest(
        { textDescription: "Poulet grillé" },
        { "x-forwarded-for": "10.0.0.9" }
      )
    );

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).not.toHaveProperty("items");
    expect(body).toHaveProperty("error");
  });

  it("extracts the JSON array even when the vision model appends trailing prose after it (observed llava-13b behavior)", async () => {
    server.use(
      http.get("https://cdn.example.com/trailing-prose-meal.jpg", () => {
        return new HttpResponse(new Uint8Array(1024).fill(1), {
          headers: {
            "Content-Type": "image/jpeg",
            "Content-Length": "1024",
          },
        });
      }),
      http.post(REPLICATE_VISION_PREDICTIONS_URL, () => {
        return HttpResponse.json({
          id: "mock-prediction-id-trailing-prose",
          status: "succeeded",
          output: [
            JSON.stringify(MOCK_MEAL_ITEMS),
            "\n\nCe repas est composé de poulet grillé et de riz blanc.",
          ],
          urls: {
            get: "https://api.replicate.com/v1/predictions/mock-prediction-id-trailing-prose",
            cancel:
              "https://api.replicate.com/v1/predictions/mock-prediction-id-trailing-prose/cancel",
          },
        });
      })
    );

    const response = await POST(
      makeRequest(
        { imageUrl: "https://cdn.example.com/trailing-prose-meal.jpg" },
        { "x-forwarded-for": "10.0.0.30" }
      )
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ items: MOCK_MEAL_ITEMS });
  });

  it("returns a clean 500 (not a crash) when the AI output is not valid JSON matching the schema", async () => {
    server.use(
      http.post(REPLICATE_PREDICTIONS_URL, () => {
        return HttpResponse.json({
          id: "mock-prediction-id-bad",
          status: "succeeded",
          output: ["this is not valid json at all"],
          urls: {
            get: "https://api.replicate.com/v1/predictions/mock-prediction-id-bad",
            cancel:
              "https://api.replicate.com/v1/predictions/mock-prediction-id-bad/cancel",
          },
        });
      })
    );

    const response = await POST(
      makeRequest(
        { textDescription: "Repas quelconque" },
        { "x-forwarded-for": "10.0.0.7" }
      )
    );

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).not.toHaveProperty("items");
  });

  it("correctly handles LLaVA model markdown-escaped underscores (item\\_name) without failing JSON.parse", async () => {
    const rawLlavaOutput = `[
      {
        "item\\_name": "Salade composée",
        "weight\\_grams": 200,
        "calories": 150,
        "protein": 5,
        "carbs": 12,
        "fat": 8
      }
    ]`;

    server.use(
      http.post(REPLICATE_PREDICTIONS_URL, () => {
        return HttpResponse.json({
          id: "mock-prediction-id-llava-escapes",
          status: "succeeded",
          output: [rawLlavaOutput],
          urls: {
            get: "https://api.replicate.com/v1/predictions/mock-prediction-id-llava-escapes",
            cancel:
              "https://api.replicate.com/v1/predictions/mock-prediction-id-llava-escapes/cancel",
          },
        });
      })
    );

    const response = await POST(
      makeRequest(
        { textDescription: "Une salade" },
        { "x-forwarded-for": "10.0.0.99" }
      )
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("items");
    expect(body.items).toHaveLength(1);
    expect(body.items[0].item_name).toBe("Salade composée");
    expect(body.items[0].weight_grams).toBe(200);
  });
});
