import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..", "..");

/** Env var names that must never be exposed to the client bundle. */
const SERVER_ONLY_SECRETS = [
  "REPLICATE_API_TOKEN",
  "SUPABASE_SERVICE_ROLE_KEY",
  "UPSTASH_REDIS_REST_TOKEN",
];

function listSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === ".git") {
      continue;
    }
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      listSourceFiles(full, acc);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

describe("secret exposure audit (TICK-016)", () => {
  it("never prefixes a server-only secret with NEXT_PUBLIC_ in .env.example", () => {
    const envExample = readFileSync(join(ROOT, ".env.example"), "utf-8");
    for (const secret of SERVER_ONLY_SECRETS) {
      expect(envExample).not.toContain(`NEXT_PUBLIC_${secret}`);
      expect(envExample).toContain(secret);
    }
  });

  it("never references a NEXT_PUBLIC_-prefixed server secret anywhere in src/", () => {
    const files = listSourceFiles(join(ROOT, "src"));
    for (const file of files) {
      const content = readFileSync(file, "utf-8");
      for (const secret of SERVER_ONLY_SECRETS) {
        expect(
          content.includes(`NEXT_PUBLIC_${secret}`),
          `${file} references NEXT_PUBLIC_${secret}`
        ).toBe(false);
      }
    }
  });

  it("only imports the Supabase service-role admin client from server-side code", () => {
    const files = listSourceFiles(join(ROOT, "src"));
    for (const file of files) {
      const content = readFileSync(file, "utf-8");
      if (content.includes("createAdminClient")) {
        expect(
          content.includes('"use client"'),
          `${file} imports createAdminClient but is a Client Component`
        ).toBe(false);
      }
    }
  });
});
