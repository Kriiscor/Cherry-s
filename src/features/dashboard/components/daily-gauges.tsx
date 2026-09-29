"use client";

import Link from "next/link";
import { Dumbbell, Droplet, Flame, Wheat } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDailyTotals } from "@/features/dashboard/hooks/use-daily-totals";
import { useUserGoals } from "@/features/dashboard/hooks/use-user-goals";

type GaugeStatus = "onTrack" | "warning" | "over";

/** Vert 0-100%, Orange 100-110%, Rouge >110% — cf. TICK-011 thresholds. */
function getGaugeStatus(percent: number): GaugeStatus {
  if (percent > 110) return "over";
  if (percent > 100) return "warning";
  return "onTrack";
}

const STATUS_STYLES: Record<
  GaugeStatus,
  { indicator: string; text: string; badge: "secondary" | "default" | "destructive" }
> = {
  onTrack: {
    indicator: "[&>[data-slot=progress-indicator]]:bg-emerald-500",
    text: "text-emerald-600",
    badge: "secondary",
  },
  warning: {
    indicator: "[&>[data-slot=progress-indicator]]:bg-amber-500",
    text: "text-amber-600",
    badge: "secondary",
  },
  over: {
    indicator: "[&>[data-slot=progress-indicator]]:bg-destructive",
    text: "text-destructive",
    badge: "destructive",
  },
};

function round(value: number): number {
  return Math.round(value);
}

type GaugeRowProps = {
  icon: React.ElementType;
  label: string;
  value: number;
  target: number;
  unit: string;
  size?: "lg" | "sm";
};

function GaugeRow({ icon: Icon, label, value, target, unit, size = "sm" }: GaugeRowProps) {
  const percent = target > 0 ? (value / target) * 100 : 0;
  const status = getGaugeStatus(percent);
  const styles = STATUS_STYLES[status];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Icon className={cn(size === "lg" ? "size-5" : "size-4", styles.text)} />
          {label}
        </div>
        <Badge variant={styles.badge} className={cn(status === "onTrack" && "bg-emerald-100 text-emerald-700")}>
          {round(percent)}%
        </Badge>
      </div>
      <Progress
        value={Math.min(percent, 100)}
        className={cn(size === "lg" ? "h-2.5" : "h-2", styles.indicator)}
      />
      <p className="text-xs text-muted-foreground">
        {round(value)} / {round(target)} {unit}
      </p>
    </div>
  );
}

function GaugesSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Daily calorie + macro progress gauges (TICK-011). Reads totals for the
 * viewed `date` via `useDailyTotals` and targets via `useUserGoals`, and
 * relies on `useMealsRealtimeSync` (mounted once at the dashboard page
 * level) plus a 5s poll baked into both hooks to recalculate automatically
 * when a meal is added or removed.
 */
const DEFAULT_GOALS = {
  daily_calories: 2000,
  protein_grams: 100,
  carbs_grams: 250,
  fat_grams: 65,
};

export function DailyGauges({ date }: { date: Date }) {
  const totalsQuery = useDailyTotals(date);
  const goalsQuery = useUserGoals();

  const isLoading = totalsQuery.isPending || goalsQuery.isPending;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progression du jour</CardTitle>
        </CardHeader>
        <CardContent>
          <GaugesSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (totalsQuery.isError || goalsQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progression du jour</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Impossible de charger ta progression du jour. Réessaie plus tard.
          </p>
        </CardContent>
      </Card>
    );
  }

  const goals = goalsQuery.data;
  const totals = totalsQuery.data ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const effectiveGoals = goals ?? DEFAULT_GOALS;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progression du jour</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {!goals && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
            <span>
              Objectifs indicatifs standard (2 000 kcal). Personnalise tes cibles selon ton profil.
            </span>
            <Link
              href="/onboarding"
              className="font-medium text-primary underline underline-offset-2 shrink-0"
            >
              Configurer mes objectifs
            </Link>
          </div>
        )}
        <GaugeRow
          icon={Flame}
          label="Calories"
          value={totals.calories}
          target={effectiveGoals.daily_calories}
          unit="kcal"
          size="lg"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <GaugeRow
            icon={Dumbbell}
            label="Protéines"
            value={totals.protein}
            target={effectiveGoals.protein_grams}
            unit="g"
          />
          <GaugeRow
            icon={Wheat}
            label="Glucides"
            value={totals.carbs}
            target={effectiveGoals.carbs_grams}
            unit="g"
          />
          <GaugeRow
            icon={Droplet}
            label="Lipides"
            value={totals.fat}
            target={effectiveGoals.fat_grams}
            unit="g"
          />
        </div>
      </CardContent>
    </Card>
  );
}
