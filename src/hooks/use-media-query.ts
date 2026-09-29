"use client";

import { useSyncExternalStore } from "react";

/**
 * Tracks whether a CSS media query currently matches. Used to switch the
 * meal-capture UI between a bottom `Drawer` (mobile) and a centered
 * `Dialog` (desktop) — see src/features/meals/components/meal-input-drawer.tsx.
 *
 * Returns `false` during SSR/first paint (safe default for mobile-first
 * markup) and syncs to the real value on mount via useSyncExternalStore,
 * which subscribes to matchMedia without the setState-in-effect anti-pattern.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onChange);
      return () => mediaQueryList.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
