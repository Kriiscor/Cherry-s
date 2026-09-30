"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { StepsTrackerCard } from "@/features/sport/components/steps-tracker-card";
import { DailySportList } from "@/features/sport/components/daily-sport-list";

export default function SportPage() {
  const [date] = useState(() => new Date());

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-6 pb-28">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Sport</p>
        <h1 className="text-xl font-bold capitalize text-foreground">
          {format(date, "EEEE d MMMM yyyy", { locale: fr })}
        </h1>
      </header>

      <StepsTrackerCard date={date} />
      <DailySportList date={date} />
    </div>
  );
}
