"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Footprints, Plus } from "lucide-react";

import { useDailySteps } from "@/features/sport/hooks/use-daily-steps";
import { useSetStepsMutation } from "@/features/sport/hooks/use-set-steps-mutation";
import { useUserGoals } from "@/features/dashboard/hooks/use-user-goals";
import { estimateCaloriesFromSteps } from "@/features/sport/lib/calories";

import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const DEFAULT_WEIGHT_KG = 70;
const DEFAULT_STEPS_GOAL = 10000;

type StepsTrackerCardProps = {
  date: Date;
};

/**
 * Daily step counter card. Shows current steps vs. the user's personalised
 * step goal (from `user_goals.daily_steps_goal`, defaulting to 10 000),
 * a progress gauge, quick-add chips (+1 000, +5 000), a manual input,
 * and an estimated calories burned. Data is persisted via an upsert on
 * `daily_steps` (one row per user per day).
 */
export function StepsTrackerCard({ date }: StepsTrackerCardProps) {
  const stepsQuery = useDailySteps(date);
  const goalsQuery = useUserGoals();
  const setSteps = useSetStepsMutation(date);

  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const currentSteps = stepsQuery.data ?? 0;
  const weightKg = goalsQuery.data?.weight_kg ?? DEFAULT_WEIGHT_KG;
  const stepsGoal = goalsQuery.data?.daily_steps_goal ?? DEFAULT_STEPS_GOAL;
  const percentage = Math.min(
    Math.round((currentSteps / stepsGoal) * 100),
    100
  );
  const isTargetReached = currentSteps >= stepsGoal;
  const estimatedKcal = estimateCaloriesFromSteps(currentSteps, weightKg);

  const handleQuickAdd = (amount: number) => {
    if (setSteps.isPending) return;
    setSteps.mutate(currentSteps + amount);
  };

  const handleInputSubmit = () => {
    const value = parseInt(inputValue, 10);
    if (!Number.isFinite(value) || value < 0 || value > 200000) return;
    setSteps.mutate(value, {
      onSettled: () => setInputValue(""),
    });
  };

  return (
    <div
      className={cn(
        "space-y-5 rounded-3xl border p-6 transition-all duration-500",
        isTargetReached
          ? "border-emerald-300 bg-gradient-to-b from-emerald-50/60 via-card to-card shadow-md shadow-emerald-500/10 dark:border-emerald-800 dark:from-emerald-950/30"
          : "border-border bg-card shadow-sm"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          {isTargetReached ? (
            <CheckCircle2 className="size-5 fill-emerald-100 text-emerald-500 dark:fill-emerald-900" />
          ) : (
            <Footprints className="size-5 text-violet-500" />
          )}
          <h3 className="text-sm font-extrabold text-foreground">
            Pas du jour
          </h3>
        </div>

        {isTargetReached ? (
          <span className="flex animate-pulse items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            🎉 Objectif atteint !
          </span>
        ) : (
          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
            Cible {stepsGoal.toLocaleString("fr-FR")} pas
          </span>
        )}
      </div>

      {stepsQuery.isPending ? (
        <Skeleton className="h-20 w-full rounded-2xl" />
      ) : (
        <>
          {/* Counter + gauge */}
          <div className="space-y-1.5 text-center">
            <p
              className={cn(
                "text-2xl font-black transition-colors",
                isTargetReached
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-violet-700 dark:text-violet-300"
              )}
            >
              {currentSteps.toLocaleString("fr-FR")}{" "}
              <span className="text-sm font-bold text-muted-foreground">
                pas
              </span>
            </p>

            <div
              className={cn(
                "h-3.5 w-full overflow-hidden rounded-full border p-0.5 transition-all duration-500",
                isTargetReached
                  ? "border-emerald-200 bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50"
                  : "border-violet-100 bg-violet-50 dark:border-violet-900 dark:bg-violet-950/50"
              )}
            >
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isTargetReached
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/30"
                    : "bg-violet-500"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {percentage}% de l&apos;objectif ·{" "}
              <span className="font-semibold">≈ {estimatedKcal} kcal</span>{" "}
              brûlées
            </p>
          </div>

          {/* Quick-add chips */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[1000, 5000].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handleQuickAdd(amount)}
                disabled={setSteps.isPending}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-2xl border p-2.5 text-xs font-bold transition active:scale-95 disabled:opacity-50",
                  isTargetReached
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                    : "border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-200"
                )}
              >
                <Plus className="size-3" />
                {amount.toLocaleString("fr-FR")} pas
              </button>
            ))}
          </div>

          {/* Manual input */}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              min={0}
              max={200000}
              placeholder="Saisir un total exact…"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInputSubmit();
              }}
              disabled={setSteps.isPending}
              className="flex-1 text-sm"
            />
            <button
              type="button"
              onClick={handleInputSubmit}
              disabled={setSteps.isPending || inputValue === ""}
              className={cn(
                "rounded-xl border px-3 py-2 text-xs font-bold transition active:scale-95 disabled:opacity-40",
                isTargetReached
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                  : "border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-200"
              )}
            >
              OK
            </button>
          </div>
        </>
      )}
    </div>
  );
}
