"use client";

import { useMemo } from "react";
import { useDailyMeals } from "@/features/dashboard/hooks/use-daily-meals";

export type DailyTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

const EMPTY_TOTALS: DailyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

/**
 * Aggregates `SUM(total_calories/protein/carbs/fat)` from `meals` for the
 * given day (TICK-011).
 *
 * Optimization: Reuses `useDailyMeals(date)` instead of firing an independent
 * Supabase query for the same rows. This eliminates duplicate network calls on
 * dashboard loads and guarantees totals and timeline are strictly in sync.
 */
export function useDailyTotals(date: Date) {
  const query = useDailyMeals(date);

  const totals = useMemo<DailyTotals>(() => {
    if (!query.data || query.data.length === 0) return { ...EMPTY_TOTALS };

    return query.data.reduce<DailyTotals>(
      (acc, row) => ({
        calories: acc.calories + (row.total_calories ?? 0),
        protein: acc.protein + (row.total_protein ?? 0),
        carbs: acc.carbs + (row.total_carbs ?? 0),
        fat: acc.fat + (row.total_fat ?? 0),
      }),
      { ...EMPTY_TOTALS }
    );
  }, [query.data]);

  return {
    ...query,
    data: totals,
  };
}
