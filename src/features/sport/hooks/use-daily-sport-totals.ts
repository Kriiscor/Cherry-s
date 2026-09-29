"use client";

import { useQuery } from "@tanstack/react-query";
import { addDays, format, startOfDay } from "date-fns";

import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import { dailySportsQueryKey } from "@/features/dashboard/lib/query-keys";

/**
 * Total calories burned from sport activities for the given day (TICK-019).
 * Shares the `dailySportsQueryKey` prefix with `useDailySports` so that
 * logging/deleting an activity refreshes both the list and this aggregation.
 */
export function useDailySportTotals(date: Date) {
  const { user } = useUser();
  const dateISO = format(date, "yyyy-MM-dd");

  return useQuery({
    queryKey: [...dailySportsQueryKey(dateISO), "totals"],
    queryFn: async (): Promise<number> => {
      const supabase = createClient();
      const dayStart = startOfDay(date);
      const dayEnd = addDays(dayStart, 1);

      const { data, error } = await supabase
        .from("sports_activities")
        .select("calories_burned")
        .eq("user_id", user!.id)
        .gte("logged_at", dayStart.toISOString())
        .lt("logged_at", dayEnd.toISOString());

      if (error) throw error;

      return (data ?? []).reduce(
        (sum, row) => sum + (row.calories_burned ?? 0),
        0
      );
    },
    enabled: !!user,
  });
}
