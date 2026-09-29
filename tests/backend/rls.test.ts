import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = join(__dirname, "..", "..", "supabase", "migrations");

const EXPECTED_TABLES = [
  "profiles",
  "user_goals",
  "meals",
  "meal_items",
  "weekly_reports",
  // New tables added in migration 003 (TICK-022)
  "sports_activities",
  "weight_logs",
  "hydration_logs",
];

function readAllMigrations(): string {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync(join(MIGRATIONS_DIR, f), "utf-8"))
    .join("\n");
}

/**
 * Static audit of the SQL migrations (TICK-016's "RLS verification" AC).
 * This does not hit a live database — it's a fast regression guard that
 * fails the build if someone removes RLS or a policy while editing the
 * schema. Live cross-user isolation is exercised by TICK-006's integration
 * tests (401/403 scenarios against a mocked Supabase server client).
 */
describe("RLS policy audit (TICK-016)", () => {
  const sql = readAllMigrations();

  it.each(EXPECTED_TABLES)("enables row level security on `%s`", (table) => {
    const pattern = new RegExp(
      `alter table public\\.${table} enable row level security`,
      "i"
    );
    expect(sql).toMatch(pattern);
  });

  it.each(EXPECTED_TABLES)("has at least one policy on `%s`", (table) => {
    const pattern = new RegExp(`create policy[^;]*on public\\.${table}`, "i");
    expect(sql).toMatch(pattern);
  });

  it("every policy checks auth.uid() (directly or via a meals join)", () => {
    const policyBlocks = sql.match(/create policy[\s\S]*?;/gi) ?? [];
    expect(policyBlocks.length).toBeGreaterThan(0);
    for (const block of policyBlocks) {
      expect(
        block.includes("auth.uid()"),
        `policy without auth.uid() check: ${block.slice(0, 80)}...`
      ).toBe(true);
    }
  });

  it("never uses raw string concatenation to build a query (no || in DML)", () => {
    // Guards against SQL built by concatenating untrusted input; parameterized
    // Supabase client queries (used everywhere in src/) are unaffected since
    // they never appear in the migration files at all.
    const suspicious = sql.match(/(select|insert|update|delete)[^;]*\|\|/gi);
    expect(suspicious).toBeNull();
  });
});
