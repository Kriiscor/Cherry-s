"use client";

import { useMemo } from "react";
import { useDailySports } from "@/features/sport/hooks/use-daily-sports";

/**
 * Total calories burned from sport activities for the given day (TICK-019).
 * Optimization: Reuses `useDailySports(date)` instead of firing an independent
 * Supabase query for the same rows.
 */
export function useDailySportTotals(date: Date) {
  const query = useDailySports(date);

  const totalCalories = useMemo(() => {
    if (!query.data || query.data.length === 0) return 0;
    return query.data.reduce(
      (sum, row) => sum + (row.calories_burned ?? 0),
      0
    );
  }, [query.data]);

  return {
    ...query,
    data: totalCalories,
  };
}
