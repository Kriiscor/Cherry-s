/**
 * Shared React Query key prefix for a given day's meals (TICK-011/012).
 * `useDailyTotals` (gauges) and the meal timeline's list query both nest
 * under this prefix so a single `invalidateQueries({ queryKey:
 * dailyMealsQueryKey(dateISO) })` — or the broader `["meals", "daily"]`
 * prefix used by the realtime sync hook — refreshes both at once.
 */
export function dailyMealsQueryKey(dateISO: string) {
  return ["meals", "daily", dateISO] as const;
}

export function dailyTotalsQueryKey(dateISO: string) {
  return [...dailyMealsQueryKey(dateISO), "totals"] as const;
}

export function dailyMealsListQueryKey(dateISO: string) {
  return [...dailyMealsQueryKey(dateISO), "list"] as const;
}

export function userGoalsQueryKey(userId: string | undefined) {
  return ["user-goals", userId] as const;
}

/**
 * Sport activities for a given day (TICK-018). The `useDailyNetBalance`
 * card (TICK-019) reads under the same `["sports", "daily", dateISO]` prefix,
 * so logging/deleting an activity invalidates both the day's list and the net
 * balance at once.
 */
export function dailySportsQueryKey(dateISO: string) {
  return ["sports", "daily", dateISO] as const;
}

/** All of a user's weight logs for the analytics curve (TICK-020). */
export function weightLogsQueryKey(userId: string | undefined) {
  return ["weight-logs", userId] as const;
}

/** Total water intake for a given day (TICK-021). */
export function dailyHydrationQueryKey(dateISO: string) {
  return ["hydration", "daily", dateISO] as const;
}

/** Daily step count for a given day. */
export function dailyStepsQueryKey(dateISO: string) {
  return ["steps", "daily", dateISO] as const;
}
