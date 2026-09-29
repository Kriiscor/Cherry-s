"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";

/**
 * Subscribes to Supabase Realtime changes on `meals` for the current user
 * and invalidates every cached daily-meals query (both the gauges' totals
 * and the timeline's list, since they share the `["meals", "daily", ...]`
 * key prefix — see `src/features/dashboard/lib/query-keys.ts`) whenever a
 * row is inserted, updated, or deleted.
 *
 * This is what makes gauges/timeline refresh immediately when
 * `<MealInputDrawer />` (built in TICK-009/010, outside this feature) saves
 * a meal — that component is self-contained with no save callback we can
 * hook into, so Realtime is the only way to observe its writes without
 * touching `src/features/meals/*`. `useDailyTotals`/`useDailyMeals` also
 * poll every 5s as a fallback in case the `meals` table hasn't been added
 * to the `supabase_realtime` publication (no migration in this repo does
 * so — see report).
 *
 * Mount this once near the top of the dashboard page.
 */
export function useMealsRealtimeSync() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`meals-changes-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "meals",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["meals", "daily"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}
