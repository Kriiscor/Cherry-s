"use client";

import { useQuery } from "@tanstack/react-query";
import { addDays, format, startOfDay } from "date-fns";

import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import { dailyTotalsQueryKey } from "@/features/dashboard/lib/query-keys";

export type DailyTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

const EMPTY_TOTALS: DailyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

/**
 * Aggregates `SUM(total_calories/protein/carbs/fat)` from `meals` for the
 * given day, filtered by the current user (TICK-011). The sum happens
 * client-side over the day's rows rather than via a Postgres RPC, since the
 * `meals` table already stores per-meal totals and a day's row count is
 * small.
 *
 * Cache is kept fresh via explicit mutation invalidation (`useDeleteMealMutation`,
 * `MealInputDrawer` on save) and the Supabase Realtime subscription (`useMealsRealtimeSync`).
 */
export function useDailyTotals(date: Date) {
  const { user } = useUser();
  const dateISO = format(date, "yyyy-MM-dd");

  return useQuery({
    queryKey: dailyTotalsQueryKey(dateISO),
    queryFn: async (): Promise<DailyTotals> => {
      const supabase = createClient();
      const dayStart = startOfDay(date);
      const dayEnd = addDays(dayStart, 1);

      const { data, error } = await supabase
        .from("meals")
        .select("total_calories, total_protein, total_carbs, total_fat")
        .eq("user_id", user!.id)
        .gte("logged_at", dayStart.toISOString())
        .lt("logged_at", dayEnd.toISOString());

      if (error) throw error;

      return (data ?? []).reduce<DailyTotals>(
        (acc, row) => ({
          calories: acc.calories + (row.total_calories ?? 0),
          protein: acc.protein + (row.total_protein ?? 0),
          carbs: acc.carbs + (row.total_carbs ?? 0),
          fat: acc.fat + (row.total_fat ?? 0),
        }),
        { ...EMPTY_TOTALS }
      );
    },
    enabled: !!user,
  });
}
