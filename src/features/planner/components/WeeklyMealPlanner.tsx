"use client";

import { usePlannedRecipes } from "../hooks/use-planned-recipes";
import { PlannedRecipeCard } from "./PlannedRecipeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

const DAYS_OF_WEEK = 7;

function getWeekDays(baseDate: Date): Date[] {
  const monday = startOfWeek(baseDate, { weekStartsOn: 1 });
  return Array.from({ length: DAYS_OF_WEEK }, (_, i) => addDays(monday, i));
}

export function WeeklyMealPlanner() {
  const { data: recipes, isPending } = usePlannedRecipes();
  const today = new Date();
  const weekDays = getWeekDays(today);

  if (isPending) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const allRecipes = recipes ?? [];

  // Group by planned_date string
  const byDate = allRecipes.reduce<Record<string, typeof allRecipes>>(
    (acc, r) => {
      const key = r.planned_date ?? "unscheduled";
      (acc[key] ??= []).push(r);
      return acc;
    },
    {}
  );

  const unscheduled = byDate["unscheduled"] ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 px-1">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Planning de la semaine</h2>
      </div>

      {/* Week grid */}
      <div className="space-y-4">
        {weekDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayRecipes = byDate[dateKey] ?? [];
          const isToday = isSameDay(day, today);

          return (
            <div key={dateKey}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-sm font-semibold capitalize">
                  {format(day, "EEEE d MMM", { locale: fr })}
                </span>
                {isToday && (
                  <Badge variant="default" className="text-xs px-1.5 py-0 bg-primary">
                    Aujourd'hui
                  </Badge>
                )}
              </div>

              {dayRecipes.length > 0 ? (
                <div className="space-y-2">
                  {dayRecipes.map((recipe) => (
                    <PlannedRecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
                  Aucun repas planifié
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unscheduled recipes */}
      {unscheduled.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="text-sm font-semibold text-muted-foreground">
              Sans date
            </span>
          </div>
          <div className="space-y-2">
            {unscheduled.map((recipe) => (
              <PlannedRecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      )}

      {allRecipes.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-base">Aucune recette planifiée</p>
          <p className="text-sm mt-1">Importez des recettes depuis la liste de courses</p>
        </div>
      )}
    </div>
  );
}
