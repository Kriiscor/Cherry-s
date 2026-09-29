"use client";

import { useQuery } from "@tanstack/react-query";

import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { userGoalsQueryKey } from "@/features/dashboard/lib/query-keys";

export type UserGoals = Database["public"]["Tables"]["user_goals"]["Row"];

/**
 * Reads the single `user_goals` row for the current user (TICK-004's
 * onboarding output). Shared read hook — reuse this instead of duplicating
 * the query elsewhere (TICK-011's daily gauges need the calorie/macro
 * targets; other tickets working on `/analytics` or `/settings` in parallel
 * may also want to reuse this).
 *
 * Location note: lives under `src/features/dashboard/hooks/` rather than
 * `src/features/settings/` since `settings` doesn't exist as a feature
 * module yet — this is a sensible shared spot other tickets can import from
 * (`@/features/dashboard/hooks/use-user-goals`).
 *
 * Returns `data: null` (not an error) when the user hasn't completed
 * onboarding yet — callers should handle that state explicitly.
 */
export function useUserGoals() {
  const { user } = useUser();

  return useQuery({
    queryKey: userGoalsQueryKey(user?.id),
    queryFn: async (): Promise<UserGoals | null> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_goals")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
