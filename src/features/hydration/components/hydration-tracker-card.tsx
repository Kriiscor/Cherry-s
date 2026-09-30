"use client";

import { CheckCircle2, Droplet, PartyPopper } from "lucide-react";

import { useDailyHydration } from "@/features/hydration/hooks/use-daily-hydration";
import { useAddHydrationMutation } from "@/features/hydration/hooks/use-add-hydration-mutation";
import { useUserGoals } from "@/features/dashboard/hooks/use-user-goals";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const DEFAULT_DAILY_WATER_ML = 2500;

type HydrationTrackerCardProps = {
  date: Date;
};

/**
 * Daily hydration tracker (TICK-021). Target comes from
 * `user_goals.daily_water_ml` (default 2 500 ml) so each user can
 * personalise it from the Settings page.
 */
export function HydrationTrackerCard({ date }: HydrationTrackerCardProps) {
  const hydrationQuery = useDailyHydration(date);
  const addHydration = useAddHydrationMutation(date);
  const goalsQuery = useUserGoals();

  const currentMl = hydrationQuery.data ?? 0;
  const targetMl = goalsQuery.data?.daily_water_ml ?? DEFAULT_DAILY_WATER_ML;
  const currentLitres = (currentMl / 1000).toFixed(2);
  const targetLitres = (targetMl / 1000).toFixed(2);
  const percentage = Math.min(
    Math.round((currentMl / targetMl) * 100),
    100
  );
  const isTargetReached = currentMl >= targetMl;

  const handleAdd = (amount: number) => {
    addHydration.mutate({ amount_ml: amount });
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
            <Droplet className="size-5 fill-sky-500 text-sky-500" />
          )}
          <h3 className="text-sm font-extrabold text-foreground">
            Hydratation
          </h3>
        </div>

        {isTargetReached ? (
          <span className="flex animate-pulse items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <PartyPopper className="size-3.5" /> 🎉 Objectif atteint !
          </span>
        ) : (
          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
            Cible {targetLitres} litres
          </span>
        )}
      </div>

      {hydrationQuery.isPending ? (
        <Skeleton className="h-16 w-full rounded-2xl" />
      ) : (
        <>
          {/* Counter + gauge */}
          <div className="space-y-1.5 text-center">
            <p
              className={cn(
                "text-2xl font-black transition-colors",
                isTargetReached
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-sky-700 dark:text-sky-300"
              )}
            >
              {currentLitres} / {targetLitres}{" "}
              <span className="text-sm font-bold text-muted-foreground">
                litres
              </span>
            </p>

            <div
              className={cn(
                "h-3.5 w-full overflow-hidden rounded-full border p-0.5 transition-all duration-500",
                isTargetReached
                  ? "border-emerald-200 bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50"
                  : "border-sky-100 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/50"
              )}
            >
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isTargetReached
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/30"
                    : "bg-sky-500"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {isTargetReached && (
              <p className="pt-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">
                👏 Bravo ! Hydratation parfaite pour la journée.
              </p>
            )}
          </div>

          {/* Quick-add buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleAdd(250)}
              disabled={addHydration.isPending}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border p-2.5 text-xs font-bold transition active:scale-95 disabled:opacity-50",
                isTargetReached
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                  : "border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200"
              )}
            >
              💧 +250 ml (verre)
            </button>
            <button
              type="button"
              onClick={() => handleAdd(500)}
              disabled={addHydration.isPending}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border p-2.5 text-xs font-bold transition active:scale-95 disabled:opacity-50",
                isTargetReached
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                  : "border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200"
              )}
            >
              🍾 +500 ml (gourde)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
