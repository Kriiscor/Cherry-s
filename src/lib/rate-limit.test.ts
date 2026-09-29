import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * The ticket's scenario 2 (11 requests -> 429) needs a real Upstash Redis
 * instance to exercise the sliding-window limiter, which isn't available
 * in this test environment. Per the ticket's documented tradeoff, we
 * instead unit-test src/lib/rate-limit.ts's no-op vs configured branching
 * directly: the no-op path must never block requests (asserted here with
 * 11 consecutive calls, mirroring the ticket's scenario), and the
 * configured path must build a real @upstash/ratelimit Ratelimit instance.
 */

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("createRateLimiter branching (src/lib/rate-limit.ts)", () => {
  it("falls back to a no-op limiter that always succeeds when Upstash env vars are absent (local dev)", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    vi.resetModules();

    const { createRateLimiter } = await import("./rate-limit");
    const limiter = createRateLimiter(10, "1 m");

    for (let i = 0; i < 11; i += 1) {
      const result = await limiter.limit(`test-ip-${i}`);
      expect(result.success).toBe(true);
    }
  });

  it("returns a real @upstash/ratelimit Ratelimit instance when Upstash env vars are configured", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example-test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    vi.resetModules();

    const { Ratelimit } = await import("@upstash/ratelimit");
    const { createRateLimiter } = await import("./rate-limit");
    const limiter = createRateLimiter(10, "1 m");

    expect(limiter).toBeInstanceOf(Ratelimit);
  });
});
