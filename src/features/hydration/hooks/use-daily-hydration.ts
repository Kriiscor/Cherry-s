"use client";

import { useQuery } from "@tanstack/react-query";
import { addDays, format, startOfDay } from "date-fns";

import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import { dailyHydrationQueryKey } from "@/features/dashboard/lib/query-keys";

/**
 * Total water intake in ml for the current user on the given day (TICK-021).
 * Refreshed by the add-hydration mutation invalidating the
 * `["hydration", "daily"]` prefix.
 */
export function useDailyHydration(date: Date) {
  const { user } = useUser();
  const dateISO = format(date, "yyyy-MM-dd");

  return useQuery({
    queryKey: dailyHydrationQueryKey(dateISO),
    queryFn: async (): Promise<number> => {
      const supabase = createClient();
      const dayStart = startOfDay(date);
      const dayEnd = addDays(dayStart, 1);

      const { data, error } = await supabase
        .from("hydration_logs")
        .select("amount_ml")
        .eq("user_id", user!.id)
        .gte("logged_at", dayStart.toISOString())
        .lt("logged_at", dayEnd.toISOString());

      if (error) throw error;

      return (data ?? []).reduce((sum, row) => sum + (row.amount_ml ?? 0), 0);
    },
    enabled: !!user,
  });
}
