"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Trash2, UtensilsCrossed } from "lucide-react";

import { Cell, Pie, PieChart } from "recharts";

import { useMealDetail } from "@/features/meals/hooks/use-meal-detail";
import { useDeleteMealMutation } from "@/features/dashboard/hooks/use-delete-meal-mutation";
import { MealEditModal } from "@/features/meals/components/meal-edit-modal";
import type { MealType } from "@/features/meals/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Petit-déjeuner",
  lunch: "Déjeuner",
  dinner: "Dîner",
  snack: "Collation",
};

const MEAL_TYPE_EMOJI: Record<MealType, string> = {
  breakfast: "🥐",
  lunch: "🍽️",
  dinner: "🌙",
  snack: "🍎",
};

const macroChartConfig = {
  protein: { label: "Protéines", color: "var(--color-emerald-500)" },
  carbs: { label: "Glucides", color: "var(--color-amber-500)" },
  fat: { label: "Lipides", color: "var(--color-sky-500)" },
} satisfies ChartConfig;

const MACRO_COLORS = [
  "var(--color-emerald-500)",
  "var(--color-amber-500)",
  "var(--color-sky-500)",
];

function round1(v: number) {
  return Math.round(v * 10) / 10;
}

/** Reads a signed URL for a private `meal-photos` storage path. */
function useMealPhotoSignedUrl(photoPath: string | null) {
  return useQuery({
    queryKey: ["meal-photo-signed-url", photoPath],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("meal-photos")
        .createSignedUrl(photoPath!, 3600);
      if (error || !data) return null;
      return data.signedUrl;
    },
    enabled: !!photoPath,
    staleTime: 55 * 60 * 1000,
  });
}

type MealDetailModalProps = {
  mealId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful delete so the parent can close / update. */
  onDeleted?: () => void;
};

/**
 * Meal detail modal (TICK-017): zoomable photo, ingredient table, macro donut
 * chart, and edit / delete actions.
 *
 * Layout: `Dialog` on desktop (≥ 768 px), `Drawer` on mobile — same pattern
 * as `<MealInputDrawer />`.
 */
export function MealDetailModal({
  mealId,
  open,
  onOpenChange,
  onDeleted,
}: MealDetailModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const detailQuery = useMealDetail(mealId);
  const deleteMeal = useDeleteMealMutation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const meal = detailQuery.data;
  const photoUrl = useMealPhotoSignedUrl(meal?.photo_url ?? null);

  const macroData = useMemo(() => {
    if (!meal) return [];
    const p = meal.total_protein ?? 0;
    const c = meal.total_carbs ?? 0;
    const f = meal.total_fat ?? 0;
    const total = p + c + f;
    if (total === 0) return [];
    return [
      { name: "Protéines", value: round1((p / total) * 100), grams: p },
      { name: "Glucides", value: round1((c / total) * 100), grams: c },
      { name: "Lipides", value: round1((f / total) * 100), grams: f },
    ];
  }, [meal]);

  const innerContent = (
    <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
      {detailQuery.isPending && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {detailQuery.isError && (
        <p className="text-sm text-destructive">
          Impossible de charger les détails de ce repas.
        </p>
      )}

      {meal && (
        <>
          {/* Photo */}
          <div className="flex items-center justify-center overflow-hidden rounded-xl bg-muted">
            {photoUrl.data ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl.data}
                alt="Photo du repas"
                className="max-h-56 w-full object-contain"
              />
            ) : (
              <div className="flex h-32 w-full items-center justify-center">
                <UtensilsCrossed className="size-10 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Summary hero (mockup style) */}
          <div className="flex items-center gap-4 rounded-2xl border border-cherry-100 bg-cherry-50 p-3 dark:border-cherry-900/60 dark:bg-cherry-950/40">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-card text-3xl shadow-sm">
              {MEAL_TYPE_EMOJI[meal.meal_type as MealType]}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-extrabold text-foreground">
                {MEAL_TYPE_LABELS[meal.meal_type as MealType]}
              </h4>
              <p className="text-xs font-semibold text-muted-foreground">
                {Math.round(meal.total_calories)} kcal •{" "}
                {Math.round(meal.total_protein)} g protéines •{" "}
                {format(new Date(meal.logged_at), "HH:mm", { locale: fr })}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <span className="rounded border border-emerald-200 bg-card px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-900 dark:text-emerald-300">
                  Prot : {Math.round(meal.total_protein)} g
                </span>
                <span className="rounded border border-amber-200 bg-card px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:border-amber-900 dark:text-amber-300">
                  Gluc : {Math.round(meal.total_carbs)} g
                </span>
                <span className="rounded border border-cherry-200 bg-card px-2 py-0.5 text-[10px] font-bold text-cherry-700 dark:border-cherry-900 dark:text-cherry-300">
                  Lip : {Math.round(meal.total_fat)} g
                </span>
              </div>
            </div>
          </div>

          {/* Ingredient table */}
          {(meal.meal_items?.length ?? 0) > 0 && (
            <div className="overflow-x-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aliment</TableHead>
                    <TableHead className="text-right">g</TableHead>
                    <TableHead className="text-right">kcal</TableHead>
                    <TableHead className="text-right">P</TableHead>
                    <TableHead className="text-right">G</TableHead>
                    <TableHead className="text-right">L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meal.meal_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.item_name}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.weight_grams}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.calories}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.protein} g
                      </TableCell>
                      <TableCell className="text-right">
                        {item.carbs} g
                      </TableCell>
                      <TableCell className="text-right">
                        {item.fat} g
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Subtotals row */}
                  <TableRow className="font-semibold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">
                      {meal.meal_items.reduce(
                        (s, i) => s + i.weight_grams,
                        0
                      )}{" "}
                      g
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.round(meal.total_calories)} kcal
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.round(meal.total_protein)} g
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.round(meal.total_carbs)} g
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.round(meal.total_fat)} g
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          {/* Macro donut */}
          {macroData.length > 0 && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-medium text-foreground">
                Répartition des macronutriments
              </p>
              <ChartContainer
                config={macroChartConfig}
                className="h-40 w-full max-w-xs"
              >
                <PieChart>
                  <Pie
                    data={macroData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={3}
                  >
                    {macroData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={MACRO_COLORS[index % MACRO_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [
                          `${value}%`,
                          name,
                        ]}
                      />
                    }
                  />
                </PieChart>
              </ChartContainer>
              <div className="flex flex-wrap justify-center gap-3 text-xs">
                {macroData.map((d, i) => (
                  <span
                    key={d.name}
                    className="flex items-center gap-1 text-muted-foreground"
                  >
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{ background: MACRO_COLORS[i] }}
                    />
                    {d.name} {d.value}% ({d.grams} g)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions (mockup style) */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              className="flex-1 rounded-xl font-bold"
              onClick={() => setEditOpen(true)}
            >
              Modifier ce repas
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-xl text-muted-foreground hover:text-destructive"
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="Supprimer ce repas"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {meal
                  ? `${MEAL_TYPE_LABELS[meal.meal_type as MealType]} — ${format(
                      new Date(meal.logged_at),
                      "d MMMM yyyy",
                      { locale: fr }
                    )}`
                  : "Détail du repas"}
              </DialogTitle>
              <DialogDescription>
                Ingrédients, macronutriments et actions.
              </DialogDescription>
            </DialogHeader>
            {innerContent}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="max-h-[90dvh]">
            <DrawerHeader>
              <DrawerTitle>
                {meal
                  ? `${MEAL_TYPE_LABELS[meal.meal_type as MealType]}`
                  : "Détail du repas"}
              </DrawerTitle>
              <DrawerDescription>
                Ingrédients, macronutriments et actions.
              </DrawerDescription>
            </DrawerHeader>
            {innerContent}
          </DrawerContent>
        </Drawer>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
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
              disabled={deleteMeal.isPending}
              onClick={() => {
                if (!meal) return;
                deleteMeal.mutate(meal.id, {
                  onSuccess: () => {
                    setShowDeleteConfirm(false);
                    onOpenChange(false);
                    onDeleted?.();
                  },
                  onSettled: () => setShowDeleteConfirm(false),
                });
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit modal — re-uses the existing TICK-010 component */}
      {meal && editOpen && (
        <MealEditModal
          open={editOpen}
          onOpenChange={setEditOpen}
          items={meal.meal_items.map((item) => ({
            item_name: item.item_name,
            weight_grams: item.weight_grams,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
          }))}
          mealType={meal.meal_type as MealType}
          photoUrl={meal.photo_url}
          onSaved={() => {
            setEditOpen(false);
            onOpenChange(false);
          }}
        />
      )}
    </>
  );
}
