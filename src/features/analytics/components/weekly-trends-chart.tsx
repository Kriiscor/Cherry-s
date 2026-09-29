"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useWeeklyTrends } from "@/features/analytics/hooks/use-weekly-trends";

type TrendView = "calories" | "protein";

const chartConfig = {
  calories: {
    label: "Calories",
    color: "var(--primary)",
  },
  protein: {
    label: "Protéines",
    color: "var(--color-emerald-500)",
  },
} satisfies ChartConfig;

/** Formats an ISO day ("2026-09-22") as a short French weekday label ("lun. 22"), UTC-safe. */
function formatDayLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function WeeklyTrendsChart() {
  const { data, isLoading, isError } = useWeeklyTrends();
  const [view, setView] = useState<TrendView>("calories");

  const chartData = useMemo(
    () =>
      (data ?? []).map((day) => ({
        ...day,
        label: formatDayLabel(day.date),
      })),
    [data]
  );

  const targetCalories = data?.[0]?.target_calories ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          Tendances sur 7 jours
        </CardTitle>
        <CardDescription>
          Tes apports quotidiens de la semaine glissante, comparés à ton
          objectif.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={view} onValueChange={(value) => setView(value as TrendView)}>
          <TabsList>
            <TabsTrigger value="calories">Calories</TabsTrigger>
            <TabsTrigger value="protein">Protéines</TabsTrigger>
          </TabsList>

          <TabsContent value="calories">
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : isError ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Impossible de charger les tendances pour le moment.
              </p>
            ) : (
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <BarChart data={chartData} margin={{ left: 0, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} width={36} />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  {targetCalories > 0 && (
                    <ReferenceLine
                      y={targetCalories}
                      stroke="var(--color-emerald-500)"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      label={{
                        value: `Objectif ${targetCalories} kcal`,
                        position: "insideTopRight",
                        fill: "var(--muted-foreground)",
                        fontSize: 11,
                      }}
                    />
                  )}
                  <Bar
                    dataKey="calories"
                    fill="var(--color-calories)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </TabsContent>

          <TabsContent value="protein">
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : isError ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Impossible de charger les tendances pour le moment.
              </p>
            ) : (
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <BarChart data={chartData} margin={{ left: 0, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} width={36} />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Bar
                    dataKey="protein"
                    fill="var(--color-protein)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
