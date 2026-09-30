"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, LineChart, Settings, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { CherryLogo } from "@/components/ui/cherry-logo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Nutrition", icon: Utensils },
  { href: "/sport", label: "Sport", icon: Dumbbell },
  { href: "/analytics", label: "Analyses", icon: LineChart },
  { href: "/settings", label: "Réglages", icon: Settings },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-40 flex items-center justify-around border-t border-cherry-100 bg-background/95 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 dark:border-cherry-900">
      {/* Cherry's brand mark — visible on wider bottom bars */}
      <Link
        href="/dashboard"
        prefetch={false}
        className="hidden items-center gap-1.5 px-3 text-xs font-bold text-primary sm:flex"
        aria-label="Cherry's — Nutrition"
      >
        <CherryLogo size="sm" />
        Cherry&apos;s
      </Link>

      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
