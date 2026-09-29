"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/supabase-provider";
import type { Database } from "@/lib/supabase/database.types";

export type WeeklyReport = Database["public"]["Tables"]["weekly_reports"]["Row"];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Same "current week" start (J-7, UTC) as `/api/ai/weekly-summary` (TICK-006). */
function getCurrentWeekStartDate(reference: Date): string {
  const startOfToday = Date.UTC(
    reference.getUTCFullYear(),
    reference.getUTCMonth(),
    reference.getUTCDate()
  );
  return new Date(startOfToday - 7 * MS_PER_DAY).toISOString().slice(0, 10);
}

export function weeklyReportQueryKey(userId: string | undefined) {
  return ["weekly-report", userId] as const;
}

async function fetchWeeklyReport(userId: string): Promise<WeeklyReport | null> {
  const supabase = createClient();
  const weekStartDate = getCurrentWeekStartDate(new Date());

  const { data, error } = await supabase
    .from("weekly_reports")
    .select("*")
    .eq("user_id", userId)
    .eq("week_start_date", weekStartDate)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Reads the current week's report from `weekly_reports` (filtered to
 * `auth.uid() = user_id`). Returns `null` when no report has been generated
 * yet for this week, so `WeeklyReportCard` can show a call-to-action state.
 * Powers TICK-014.
 */
export function useWeeklyReport() {
  const { user } = useUser();

  return useQuery({
    queryKey: weeklyReportQueryKey(user?.id),
    queryFn: () => fetchWeeklyReport(user!.id),
    enabled: !!user,
  });
}
