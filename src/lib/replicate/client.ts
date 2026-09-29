import Replicate from "replicate";

/**
 * Server-only Replicate client. `REPLICATE_API_TOKEN` must never be exposed
 * to the browser (no `NEXT_PUBLIC_` prefix) — see CLAUDE.md section 4.
 */
export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  // Resolve `fetch` lazily (at call time) instead of letting the SDK cache
  // `globalThis.fetch` at construction time. Without this, request-mocking
  // tools (MSW) that patch `globalThis.fetch` after this module has already
  // been imported would be silently bypassed.
  fetch: (...args: Parameters<typeof fetch>) => fetch(...args),
});

/**
 * Model identifier for photo-based meal analysis (TICK-005).
 * `meta/llama-3.2-11b-vision-instruct` was removed from Replicate's catalog
 * (confirmed 404 on the model itself, 2026-09-28) — replaced with
 * `yorickvp/llava-13b` (36M+ runs, actively maintained). This model's
 * "official model" shortcut endpoint (`/v1/models/{owner}/{name}/predictions`)
 * also 404s for it specifically (confirmed by direct API testing — some
 * community models aren't registered for that shortcut), so the version is
 * pinned here (`owner/name:version`), which routes the SDK through the
 * classic `/v1/predictions` endpoint instead and works reliably.
 */
export const MEAL_VISION_MODEL =
  "yorickvp/llava-13b:80537f9eead1a5bfa72d5ac6ea6414379be41d4d4f6679fd776e9535d1eb58bb" as const;

/**
 * Model identifier for text-only meal analysis (no photo). A separate model
 * from `MEAL_VISION_MODEL` because llava-13b requires an `image` input —
 * this one is a plain instruction-following text model.
 */
export const MEAL_TEXT_MODEL = "meta/meta-llama-3-8b-instruct" as const;
