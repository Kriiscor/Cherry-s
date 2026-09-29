"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Wraps the app with a single `QueryClient` instance (created once per
 * component lifetime via `useState`, so it survives re-renders but not
 * full remounts — the standard App Router pattern for TanStack Query).
 * Required by dashboard hooks such as `useDailyTotals` / `useUserGoals`
 * (TICK-011/012).
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
