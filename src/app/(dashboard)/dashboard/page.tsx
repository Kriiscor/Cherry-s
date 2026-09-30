"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Apple, Calculator, Dumbbell } from "lucide-react";

import { DailyGauges } from "@/features/dashboard/components/daily-gauges";
import { NetCalorieCard } from "@/features/dashboard/components/net-calorie-card";
import { MealTimeline } from "@/features/dashboard/components/meal-timeline";
import { HydrationTrackerCard } from "@/features/hydration/components/hydration-tracker-card";
import { DailySportList } from "@/features/sport/components/daily-sport-list";
import { useMealsRealtimeSync } from "@/features/dashboard/hooks/use-meals-realtime-sync";
import { MealInputDrawer } from "@/features/meals/components/meal-input-drawer";

function SectionDivider({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-4 text-primary" />
      </div>
      <span className="text-sm font-bold text-foreground">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export default function DashboardPage() {
  const [date, setDate] = useState(() => new Date());

  useMealsRealtimeSync();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-6 pb-28">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Tableau de bord</p>
        <h1 className="text-xl font-bold capitalize text-foreground">
          {format(date, "EEEE d MMMM yyyy", { locale: fr })}
        </h1>
      </header>

      <SectionDivider icon={Apple} label="Nutrition" />
      <DailyGauges date={date} />
      <HydrationTrackerCard date={date} />
      <MealTimeline date={date} onDateChange={setDate} />

      <SectionDivider icon={Dumbbell} label="Sport" />
      <DailySportList date={date} />

      <SectionDivider icon={Calculator} label="Bilan net" />
      <NetCalorieCard date={date} />

      <MealInputDrawer />
    </div>
  );
}
