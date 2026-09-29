"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether a CSS media query currently matches. Used to switch the
 * meal-capture UI between a bottom `Drawer` (mobile) and a centered
 * `Dialog` (desktop).
 *
 * Returns `false` on SSR and first paint (mobile-first default), then
 * syncs to the real value after mount. Using useState+useEffect instead
 * of useSyncExternalStore avoids a React 19 hydration mismatch error
 * (#441) on iOS WebKit when the client snapshot differs from the server
 * snapshot at reconciliation time.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQueryList.addEventListener("change", handler);
    return () => mediaQueryList.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
