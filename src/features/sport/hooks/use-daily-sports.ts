"use client";

import { useQuery } from "@tanstack/react-query";
import { addDays, format, startOfDay } from "date-fns";

import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { dailySportsQueryKey } from "@/features/dashboard/lib/query-keys";

export type SportActivity =
  Database["public"]["Tables"]["sports_activities"]["Row"];

/**
 * Lists the current user's `sports_activities` rows for the given day, most
 * recent first (TICK-018). Same day-window pattern as `useDailyMeals`. Cache
 * is refreshed by the sport log/delete mutations invalidating the
 * `["sports", "daily"]` prefix.
 */
export function useDailySports(date: Date) {
  const { user } = useUser();
  const dateISO = format(date, "yyyy-MM-dd");

  return useQuery({
    queryKey: dailySportsQueryKey(dateISO),
    queryFn: async (): Promise<SportActivity[]> => {
      const supabase = createClient();
      const dayStart = startOfDay(date);
      const dayEnd = addDays(dayStart, 1);

      const { data, error } = await supabase
        .from("sports_activities")
        .select("*")
        .eq("user_id", user!.id)
        .gte("logged_at", dayStart.toISOString())
        .lt("logged_at", dayEnd.toISOString())
        .order("logged_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}
