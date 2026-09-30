"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import { dailyStepsQueryKey } from "@/features/dashboard/lib/query-keys";

/** Returns the step count logged for the given day (0 if none). */
export function useDailySteps(date: Date) {
  const { user } = useUser();
  const dateISO = format(date, "yyyy-MM-dd");

  return useQuery({
    queryKey: dailyStepsQueryKey(dateISO),
    queryFn: async (): Promise<number> => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("daily_steps")
        .select("step_count")
        .eq("user_id", user!.id)
        .eq("logged_date", dateISO)
        .maybeSingle();

      if (error) throw error;
      return data?.step_count ?? 0;
    },
    enabled: !!user,
  });
}
