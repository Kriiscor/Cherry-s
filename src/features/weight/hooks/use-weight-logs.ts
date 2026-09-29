"use client";

import { useQuery } from "@tanstack/react-query";
import { subDays, subMonths } from "date-fns";

import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { weightLogsQueryKey } from "@/features/dashboard/lib/query-keys";

export type WeightLog = Database["public"]["Tables"]["weight_logs"]["Row"];

export type WeightRange = "7d" | "30d" | "3m" | "all";

/**
 * Fetches the current user's `weight_logs` for a given time range (TICK-020).
 * Ordered chronologically so Recharts can plot a progressive time-series.
 * Uses the shared `weightLogsQueryKey` — mutation invalidations use the same key.
 */
export function useWeightLogs(range: WeightRange = "30d") {
  const { user } = useUser();

  return useQuery({
    queryKey: [...weightLogsQueryKey(user?.id), range],
    queryFn: async (): Promise<WeightLog[]> => {
      const supabase = createClient();

      let query = supabase
        .from("weight_logs")
        .select("*")
        .eq("user_id", user!.id)
        .order("logged_at", { ascending: true });

      const now = new Date();
      if (range === "7d") {
        query = query.gte("logged_at", subDays(now, 7).toISOString());
      } else if (range === "30d") {
        query = query.gte("logged_at", subDays(now, 30).toISOString());
      } else if (range === "3m") {
        query = query.gte("logged_at", subMonths(now, 3).toISOString());
      }
      // "all" — no date filter

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}
