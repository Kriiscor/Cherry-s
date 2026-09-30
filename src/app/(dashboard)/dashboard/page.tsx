"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { DailyGauges } from "@/features/dashboard/components/daily-gauges";
import { NetCalorieCard } from "@/features/dashboard/components/net-calorie-card";
import { MealTimeline } from "@/features/dashboard/components/meal-timeline";
import { HydrationTrackerCard } from "@/features/hydration/components/hydration-tracker-card";
import { useMealsRealtimeSync } from "@/features/dashboard/hooks/use-meals-realtime-sync";
import { MealInputDrawer } from "@/features/meals/components/meal-input-drawer";

export default function DashboardPage() {
  const [date, setDate] = useState(() => new Date());

  useMealsRealtimeSync();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-6 pb-28">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Nutrition</p>
        <h1 className="text-xl font-bold capitalize text-foreground">
          {format(date, "EEEE d MMMM yyyy", { locale: fr })}
        </h1>
      </header>

      <DailyGauges date={date} />
      <NetCalorieCard date={date} />
      <HydrationTrackerCard date={date} />
      <MealTimeline date={date} onDateChange={setDate} />

      <MealInputDrawer />
    </div>
  );
}
