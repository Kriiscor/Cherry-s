"use client";

import { useMemo, useState } from "react";
import { addDays, format, isToday, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";

import type { Database } from "@/lib/supabase/database.types";
import {
  useDailyMeals,
  type DailyMeal,
} from "@/features/dashboard/hooks/use-daily-meals";
import { useDeleteMealMutation } from "@/features/dashboard/hooks/use-delete-meal-mutation";
import { MealThumbnail } from "@/features/dashboard/components/meal-thumbnail";
import { MealDetailModal } from "@/features/meals/components/meal-detail-modal";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type MealType = Database["public"]["Tables"]["meals"]["Row"]["meal_type"];

const MEAL_TYPE_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Petit-déjeuner",
  lunch: "Déjeuner",
  dinner: "Dîner",
  snack: "Collation",
};

type MealTimelineProps = {
  date: Date;
  onDateChange: (date: Date) => void;
};

/**
 * Daily meal timeline (TICK-012): date navigation, meals grouped by
 * `meal_type`, and a delete flow (`DropdownMenu` → `AlertDialog` confirm →
 * delete). "Modifier" is left disabled — no edit-existing-meal ticket exists
 * yet. Deletion invalidates the shared `["meals", "daily", ...]` query
 * prefix (via `useDeleteMealMutation`) so `<DailyGauges />` refreshes too.
 */
export function MealTimeline({ date, onDateChange }: MealTimelineProps) {
  const mealsQuery = useDailyMeals(date);
  const deleteMeal = useDeleteMealMutation();
  const [pendingDelete, setPendingDelete] = useState<DailyMeal | null>(null);
  const [detailMealId, setDetailMealId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<MealType, DailyMeal[]>();
    for (const meal of mealsQuery.data ?? []) {
      const list = map.get(meal.meal_type) ?? [];
      list.push(meal);
      map.set(meal.meal_type, list);
    }
    return map;
  }, [mealsQuery.data]);

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    const mealId = pendingDelete.id;
    deleteMeal.mutate(mealId, {
      onSettled: () => setPendingDelete(null),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onDateChange(subDays(date, 1))}
          aria-label="Jour précédent"
        >
          <ChevronLeft />
        </Button>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm font-medium capitalize">
            {format(date, "EEEE d MMMM", { locale: fr })}
          </span>
          {!isToday(date) && (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => onDateChange(new Date())}
            >
              Aujourd&apos;hui
            </Button>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onDateChange(addDays(date, 1))}
          aria-label="Jour suivant"
        >
          <ChevronRight />
        </Button>
      </div>

      {mealsQuery.isPending && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      )}

      {mealsQuery.isError && (
        <p className="text-sm text-destructive">
          Impossible de charger les repas de cette journée. Réessaie plus
          tard.
        </p>
      )}

      {mealsQuery.isSuccess &&
        (mealsQuery.data.length === 0 ? (
          <p className="rounded-xl bg-muted/50 p-4 text-center text-sm text-muted-foreground">
            Aucun repas enregistré ce jour-là.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {MEAL_TYPE_ORDER.filter((type) => grouped.has(type)).map(
              (type) => (
                <div key={type} className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {MEAL_TYPE_LABELS[type]}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {grouped.get(type)!.map((meal) => (
                      <Card
                        key={meal.id}
                        className="cursor-pointer transition-shadow hover:shadow-md"
                        onClick={() => setDetailMealId(meal.id)}
                      >
                        <CardContent className="flex items-center gap-3">
                          <MealThumbnail photoPath={meal.photo_url} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(meal.logged_at), "HH:mm")}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              <Badge variant="secondary">
                                {Math.round(meal.total_calories)} kcal
                              </Badge>
                              <Badge variant="outline">
                                {Math.round(meal.total_protein)} g protéines
                              </Badge>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Options du repas"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <MoreVertical />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() => setDetailMealId(meal.id)}
                              >
                                Voir le détail
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => setPendingDelete(meal)}
                              >
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        ))}

      {/* Meal detail modal (TICK-017) */}
      <MealDetailModal
        mealId={detailMealId}
        open={!!detailMealId}
        onOpenChange={(open) => {
          if (!open) setDetailMealId(null);
        }}
        onDeleted={() => setDetailMealId(null)}
      />

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce repas ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible : le repas et ses totaux
              nutritionnels seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMeal.isPending}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMeal.isPending}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
