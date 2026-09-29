"use client";

import { useQuery } from "@tanstack/react-query";
import { addDays, format, startOfDay } from "date-fns";

import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { dailyMealsListQueryKey } from "@/features/dashboard/lib/query-keys";

export type DailyMeal = Database["public"]["Tables"]["meals"]["Row"];

/**
 * Lists the current user's `meals` rows for the given day, ordered
 * chronologically (TICK-012's timeline). Cache is kept fresh via mutation
 * invalidations and the Supabase Realtime subscription (`useMealsRealtimeSync`).
 */
export function useDailyMeals(date: Date) {
  const { user } = useUser();
  const dateISO = format(date, "yyyy-MM-dd");

  return useQuery({
    queryKey: dailyMealsListQueryKey(dateISO),
    queryFn: async (): Promise<DailyMeal[]> => {
      const supabase = createClient();
      const dayStart = startOfDay(date);
      const dayEnd = addDays(dayStart, 1);

      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user!.id)
        .gte("logged_at", dayStart.toISOString())
        .lt("logged_at", dayEnd.toISOString())
        .order("logged_at", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}
