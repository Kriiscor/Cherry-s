import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const isConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

/**
 * Builds an @upstash/ratelimit limiter, or a no-op stand-in when Upstash
 * env vars are absent (local dev — see USER_CHECKLIST.md, optional step).
 * The no-op always allows the request instead of crashing the route.
 */
export function createRateLimiter(limit: number, window: `${number} ${"s" | "m" | "h"}`) {
  if (!isConfigured) {
    return {
      limit: async (_identifier: string) => ({
        success: true,
        limit,
        remaining: limit,
        reset: Date.now(),
      }),
    };
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
  });
}
