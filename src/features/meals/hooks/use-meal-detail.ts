"use client";

import { useQuery } from "@tanstack/react-query";

import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

export type MealDetail = Database["public"]["Tables"]["meals"]["Row"] & {
  meal_items: Database["public"]["Tables"]["meal_items"]["Row"][];
};

/**
 * Fetches a single meal with its items (TICK-017). The Supabase `select` join
 * scoped to `auth.uid()` ensures a user can never read another user's meal
 * (the query returns zero rows rather than a 403, which is the RLS guarantee
 * without a REST layer). The stale-time is intentionally low so the modal
 * always shows fresh data when opened.
 */
export function useMealDetail(mealId: string | null) {
  const { user } = useUser();

  return useQuery({
    queryKey: ["meals", "detail", mealId],
    queryFn: async (): Promise<MealDetail | null> => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("meals")
        .select("*, meal_items(*)")
        .eq("id", mealId!)
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return data as MealDetail | null;
    },
    enabled: !!user && !!mealId,
    staleTime: 0,
  });
}
