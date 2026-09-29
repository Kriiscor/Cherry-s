/**
 * Wraps an async Replicate SDK call with automatic retries on 429 (rate-limited)
 * errors. Handles Replicate accounts with reduced bursts/quotas (< $5 credit)
 * where rapid calls trigger temporary throttling.
 */
const DEFAULT_DELAY_MS = process.env.NODE_ENV === "test" ? 10 : 2500;

export async function runWithReplicateRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = DEFAULT_DELAY_MS
): Promise<T> {
  try {
    return await fn();
  } catch (error: unknown) {
    const err = error as {
      response?: { status?: number };
      status?: number;
      message?: string;
    };

    const is429 =
      err?.response?.status === 429 ||
      err?.status === 429 ||
      (typeof err?.message === "string" && err.message.includes("429"));

    if (retries > 0 && is429) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return runWithReplicateRetry(fn, retries - 1, Math.round(delayMs * 1.5));
    }

    throw error;
  }
}
