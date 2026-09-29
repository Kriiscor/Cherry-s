import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      // Note (TICK-016): `all` was removed from @vitest/coverage-v8's options
      // in this installed version (5.x) — TypeScript rejects it under
      // `pnpm type-check`. It's a no-op removal, not a scope change: setting
      // `include` below already makes every matched file appear in the
      // report (0% included) regardless of whether a test touches it, which
      // is exactly what `all: true` used to opt into on older versions.
      // TICK-016: ≥80% backend coverage. Scoped to actual backend logic
      // (API routes, Server Actions, scoring/calculation/validation libs) —
      // excludes UI components, providers, and thin Supabase SDK wrappers,
      // which aren't meaningfully unit-testable without a browser/DOM harness
      // and aren't what "backend coverage" refers to in CLAUDE.md.
      include: [
        "src/app/api/**/route.ts",
        "src/features/*/actions.ts",
        "src/lib/scoring/**",
        "src/lib/calculations/**",
        "src/lib/validators/**",
        "src/lib/rate-limit.ts",
        "src/lib/replicate/**",
      ],
      thresholds: {
        statements: 80,
        lines: 80,
        functions: 80,
        branches: 70,
      },
    },
  },
});
