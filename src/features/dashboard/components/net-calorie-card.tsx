"use client";

import { Calculator } from "lucide-react";

import { useDailyTotals } from "@/features/dashboard/hooks/use-daily-totals";
import { useDailySportTotals } from "@/features/sport/hooks/use-daily-sport-totals";
import { useDailySteps } from "@/features/sport/hooks/use-daily-steps";
import { useUserGoals } from "@/features/dashboard/hooks/use-user-goals";
import { estimateCaloriesFromSteps } from "@/features/sport/lib/calories";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type NetCalorieCardProps = {
  date: Date;
};

const DEFAULT_DAILY_CALORIES = 2000;

/**
 * Net calorie balance card (TICK-019):
 *   Net = calories from meals − calories burned from sport
 * Mockup style (components_library/NetCalorieCard) rebuilt on theme tokens:
 * rounded card with a divider header, a big net total, the eaten/burned
 * decomposition as two tinted tiles, and a cherry-gradient progress gauge
 * vs. the user's daily calorie target. Stays wired to the live query hooks
 * and dark-mode aware.
 */
export function NetCalorieCard({ date }: NetCalorieCardProps) {
  const mealsQuery = useDailyTotals(date);
  const sportQuery = useDailySportTotals(date);
  const stepsQuery = useDailySteps(date);
  const goalsQuery = useUserGoals();

  const isLoading =
    mealsQuery.isPending || sportQuery.isPending || stepsQuery.isPending || goalsQuery.isPending;

  const weightKg = goalsQuery.data?.weight_kg ?? 70;
  const caloriesEaten = mealsQuery.data?.calories ?? 0;
  const sportCalories = sportQuery.data ?? 0;
  const stepCalories = estimateCaloriesFromSteps(stepsQuery.data ?? 0, weightKg);
  const caloriesBurned = sportCalories + stepCalories;
  const netCalories = Math.max(0, caloriesEaten - caloriesBurned);
  const targetCalories = goalsQuery.data?.daily_calories ?? DEFAULT_DAILY_CALORIES;
  const percentage =
    targetCalories > 0
      ? Math.min(Math.round((netCalories / targetCalories) * 100), 100)
      : 0;
  const remaining = targetCalories - netCalories;

  return (
    <div className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Calculator className="size-5 text-primary" />
          <h3 className="text-sm font-extrabold text-foreground">
            Bilan calorique net
          </h3>
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
          Objectif {targetCalories} kcal
        </span>
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-2xl" />
      ) : (
        <>
          {/* Net total */}
          <div className="py-1 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total net du jour
            </p>
            <p className="text-3xl font-black text-foreground">
              {netCalories}{" "}
              <span className="text-sm font-bold text-muted-foreground">
                kcal
              </span>
            </p>
          </div>

          {/* Decomposition tiles */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="rounded-2xl border border-cherry-100 bg-cherry-50 p-3 text-center dark:border-cherry-900/60 dark:bg-cherry-950/40">
              <span className="text-[10px] font-bold uppercase text-cherry-700 dark:text-cherry-300">
                Mangé (+ repas)
              </span>
              <p className="text-base font-extrabold text-cherry-900 dark:text-cherry-200">
                +{caloriesEaten} kcal
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-center dark:border-emerald-900/60 dark:bg-emerald-950/40">
              <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                Brûlé (− sport)
              </span>
              <p className="text-base font-extrabold text-emerald-900 dark:text-emerald-200">
                −{caloriesBurned} kcal
              </p>
            </div>
          </div>

          {/* Gauge */}
          <div className="space-y-1">
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted p-0.5">
              <div
                className={cn(
                  "h-full rounded-full bg-gradient-to-r from-cherry-600 to-cherry-900 transition-all duration-500"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-right text-[11px] font-semibold text-muted-foreground">
              {remaining > 0
                ? `Reste ${remaining} kcal disponible`
                : "Objectif dépassé"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
