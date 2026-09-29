"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TrendingDown } from "lucide-react";

import {
  Line,
  LineChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useWeightLogs, type WeightRange } from "@/features/weight/hooks/use-weight-logs";
import { useUserGoals } from "@/features/dashboard/hooks/use-user-goals";
import { calculateBmi } from "@/features/weight/lib/bmi";
import { WeightLogModal } from "@/features/weight/components/weight-log-modal";

const chartConfig = {
  weight_kg: {
    label: "Poids (kg)",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const RANGE_LABELS: Record<WeightRange, string> = {
  "7d": "7j",
  "30d": "30j",
  "3m": "3 mois",
  all: "Tout",
};

/**
 * Weight analytics panel (TICK-020), mockup style
 * (components_library/WeightTrackerCard) rebuilt on theme tokens: a divider
 * header with an IMC chip, the current weight + period variation, range tabs,
 * and a target reference line. Keeps the real Recharts line chart (richer than
 * the mockup's placeholder bars) and the weight-log entry point. Dark-mode
 * aware.
 */
export function WeightChart() {
  const [range, setRange] = useState<WeightRange>("30d");
  const logsQuery = useWeightLogs(range);
  const goalsQuery = useUserGoals();

  const chartData = useMemo(
    () =>
      (logsQuery.data ?? []).map((log) => ({
        ...log,
        label: format(new Date(log.logged_at), "d MMM", { locale: fr }),
      })),
    [logsQuery.data]
  );

  const latestWeight = logsQuery.data?.at(-1)?.weight_kg ?? null;
  const targetWeight = goalsQuery.data?.weight_kg ?? null;
  const heightCm = goalsQuery.data?.height_cm ?? null;

  const bmi =
    latestWeight && heightCm ? calculateBmi(latestWeight, heightCm) : null;

  // Period variation (first → last entry in the current range)
  const firstWeight = logsQuery.data?.[0]?.weight_kg ?? null;
  const variation =
    latestWeight !== null && firstWeight !== null
      ? Math.round((latestWeight - firstWeight) * 10) / 10
      : null;

  return (
    <div className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="size-5 text-emerald-600" />
          <h3 className="text-sm font-extrabold text-foreground">
            Suivi du poids & IMC
          </h3>
        </div>
        {bmi && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            IMC {bmi.value} ({bmi.label})
          </span>
        )}
      </div>

      {/* Current weight + variation */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Poids actuel
          </p>
          <h4 className="text-3xl font-black text-foreground">
            {latestWeight ?? "—"}{" "}
            <span className="text-base font-bold text-muted-foreground">kg</span>
          </h4>
        </div>
        <div className="text-right">
          {variation !== null && (
            <span
              className={cn(
                "rounded-xl px-2.5 py-1 text-xs font-bold",
                variation <= 0
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "bg-cherry-50 text-cherry-700 dark:bg-cherry-950/40 dark:text-cherry-300"
              )}
            >
              {variation <= 0 ? "↓" : "↑"} {variation > 0 ? `+${variation}` : variation} kg sur la période
            </span>
          )}
          {targetWeight && (
            <p className="mt-1 text-[10px] text-muted-foreground">
              Cible : {targetWeight} kg
            </p>
          )}
        </div>
      </div>

      {/* Range tabs */}
      <Tabs value={range} onValueChange={(v) => setRange(v as WeightRange)}>
        <TabsList>
          {(["7d", "30d", "3m", "all"] as WeightRange[]).map((r) => (
            <TabsTrigger key={r} value={r}>
              {RANGE_LABELS[r]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Chart */}
      {logsQuery.isPending && <Skeleton className="h-64 w-full rounded-2xl" />}
      {logsQuery.isError && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Impossible de charger les données de poids.
        </p>
      )}
      {logsQuery.isSuccess && chartData.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aucune pesée enregistrée sur cette période.
        </p>
      )}
      {logsQuery.isSuccess && chartData.length > 0 && (
        <ChartContainer
          config={chartConfig}
          className="h-64 w-full rounded-2xl border border-border bg-muted/30 p-3"
        >
          <LineChart data={chartData} margin={{ left: 0, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={36}
              domain={["auto", "auto"]}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            {targetWeight && (
              <ReferenceLine
                y={targetWeight}
                stroke="var(--color-emerald-500)"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: `Objectif ${targetWeight} kg`,
                  position: "insideTopRight",
                  fill: "var(--muted-foreground)",
                  fontSize: 11,
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="weight_kg"
              stroke="var(--color-weight_kg)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      )}

      <WeightLogModal />
    </div>
  );
}
