import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./client", () => ({
  replicate: { run: vi.fn() },
}));

import { replicate } from "./client";
import { generateWeeklyAdvice, type WeeklyAdviceInput } from "./weekly-advice";

const mockedRun = vi.mocked(replicate.run);

const baseInput: WeeklyAdviceInput = {
  weekStartDate: "2026-01-01",
  qualityScore: 82,
  daysLogged: 5,
  target: { calories: 2000, protein: 150, carbs: 250, fat: 70 },
  dayScores: [80, 85, 90, 70, 75, 0, 0],
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("generateWeeklyAdvice", () => {
  it("joins an array output into a single string", async () => {
    mockedRun.mockResolvedValue(["## Bilan\n\n", "Continuez ainsi !"] as never);

    const result = await generateWeeklyAdvice(baseInput);

    expect(result).toBe("## Bilan\n\nContinuez ainsi !");
  });

  it("returns a plain string output as-is", async () => {
    mockedRun.mockResolvedValue("## Bilan\n\nBravo !" as never);

    const result = await generateWeeklyAdvice(baseInput);

    expect(result).toBe("## Bilan\n\nBravo !");
  });

  it("stringifies a non-string, non-array output", async () => {
    mockedRun.mockResolvedValue({ unexpected: true } as never);

    const result = await generateWeeklyAdvice(baseInput);

    expect(result).toBe(String({ unexpected: true }));
  });

  it("falls back to an empty string for a null/undefined output", async () => {
    mockedRun.mockResolvedValue(null as never);

    const result = await generateWeeklyAdvice(baseInput);

    expect(result).toBe("");
  });

  it("propagates a Replicate error to the caller", async () => {
    mockedRun.mockRejectedValue(new Error("Replicate is down"));

    await expect(generateWeeklyAdvice(baseInput)).rejects.toThrow("Replicate is down");
  });
});
