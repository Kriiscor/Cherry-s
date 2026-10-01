"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useQueryClient } from "@tanstack/react-query";
import { saveMealAction, updateMealAction } from "@/features/meals/actions";
import { useAnalyzeMealMutation } from "@/features/meals/hooks/use-analyze-meal-mutation";
import { MEAL_TYPE_OPTIONS, type MealType } from "@/features/meals/types";
import { mealItemFormSchema, type MealSaveValues } from "@/lib/validators/mealItemSchema";
import type { MealItem } from "@/lib/validators/aiMealSchema";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type EditableRow = {
  id: string;
  item_name: string;
  weight_grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  // Immutable basis captured when the row is created — used to scale
  // calories/protein/carbs/fat proportionally whenever weight_grams changes.
  originalWeight: number;
  originalCalories: number;
  originalProtein: number;
  originalCarbs: number;
  originalFat: number;
};

type MealEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealId?: string;
  items: MealItem[];
  mealType: MealType;
  photoUrl: string | null;
  onSaved?: (mealId: string) => void;
};

function round1(value: number): number {
  return Math.round(value);
}

function itemsToRows(items: MealItem[]): EditableRow[] {
  return items.map((item) => ({
    id: crypto.randomUUID(),
    item_name: item.item_name,
    weight_grams: Math.round(item.weight_grams),
    calories: Math.round(item.calories),
    protein: Math.round(item.protein),
    carbs: Math.round(item.carbs),
    fat: Math.round(item.fat),
    originalWeight: Math.round(item.weight_grams),
    originalCalories: Math.round(item.calories),
    originalProtein: Math.round(item.protein),
    originalCarbs: Math.round(item.carbs),
    originalFat: Math.round(item.fat),
  }));
}

function recalcForWeight(row: EditableRow, newWeight: number): EditableRow {
  const roundedWeight = Math.round(newWeight);
  const scale = row.originalWeight > 0 ? roundedWeight / row.originalWeight : 0;
  return {
    ...row,
    weight_grams: roundedWeight,
    calories: Math.round(row.originalCalories * scale),
    protein: Math.round(row.originalProtein * scale),
    carbs: Math.round(row.originalCarbs * scale),
    fat: Math.round(row.originalFat * scale),
  };
}

/**
 * AI result review/edit modal (TICK-010). Weight edits recalculate that
 * row's macros proportionally (scale = newWeight / originalWeight applied
 * to the row's original macro values) and the running total updates in
 * real time. Rows can be deleted or added manually. Save is blocked until
 * every row passes `mealItemFormSchema`.
 */
export function MealEditModal({
  open,
  onOpenChange,
  mealId,
  items,
  mealType,
  photoUrl,
  onSaved,
}: MealEditModalProps) {
  const queryClient = useQueryClient();
  const analyzeMeal = useAnalyzeMealMutation();
  const [rows, setRows] = useState<EditableRow[]>(() => itemsToRows(items));
  const [selectedMealType, setSelectedMealType] = useState<MealType>(mealType);
  const [refinementText, setRefinementText] = useState("");
  const [isSaving, startSaving] = useTransition();

  const isRefining = analyzeMeal.isPending;

  const handleRefine = async () => {
    const trimmed = refinementText.trim();
    if (!trimmed) return;
    try {
      const result = await analyzeMeal.mutateAsync({
        correction: trimmed,
        previousItems: rows.map(({ item_name, weight_grams, calories, protein, carbs, fat }) => ({
          item_name, weight_grams, calories, protein, carbs, fat,
        })),
      });
      setRows(itemsToRows(result.items));
      setRefinementText("");
    } catch {
      // useAnalyzeMealMutation already shows an error toast
    }
  };

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({
          calories: acc.calories + row.calories,
          protein: acc.protein + row.protein,
          carbs: acc.carbs + row.carbs,
          fat: acc.fat + row.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [rows]
  );

  const rowErrors = useMemo(() => {
    const errors = new Map<string, string>();
    for (const row of rows) {
      const result = mealItemFormSchema.safeParse({
        item_name: row.item_name,
        weight_grams: row.weight_grams,
        calories: row.calories,
        protein: row.protein,
        carbs: row.carbs,
        fat: row.fat,
      });
      if (!result.success) {
        errors.set(row.id, result.error.issues[0]?.message ?? "Ligne invalide");
      }
    }
    return errors;
  }, [rows]);

  const hasBlockingErrors = rowErrors.size > 0 || rows.length === 0;

  const handleWeightChange = (id: string, rawValue: string) => {
    const parsed = rawValue === "" ? 0 : Number(rawValue);
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? recalcForWeight(row, Number.isFinite(parsed) ? parsed : 0)
          : row
      )
    );
  };

  const handleNameChange = (id: string, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, item_name: value } : row))
    );
  };

  const handleDelete = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleSave = () => {
    if (hasBlockingErrors) {
      toast.error("Corrige les erreurs avant d'enregistrer.");
      return;
    }

    const payload: MealSaveValues = {
      meal_type: selectedMealType,
      photo_url: photoUrl,
      items: rows.map(({ item_name, weight_grams, calories, protein, carbs, fat }) => ({
        item_name,
        weight_grams,
        calories,
        protein,
        carbs,
        fat,
      })),
    };

    startSaving(async () => {
      const result = mealId
        ? await updateMealAction({ mealId, ...payload })
        : await saveMealAction(payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      queryClient.invalidateQueries({ queryKey: ["daily-totals"] });
      toast.success(mealId ? "Repas modifié avec succès !" : "Repas enregistré !");
      onSaved?.(result.mealId);
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Vérifie ton repas</DialogTitle>
          <DialogDescription>
            Ajuste les poids, corrige ou complète les aliments détectés avant
            d&apos;enregistrer.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {MEAL_TYPE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={selectedMealType === option.value ? "default" : "outline"}
              onClick={() => setSelectedMealType(option.value)}
              disabled={isSaving}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 rounded-xl bg-muted/50 p-3">
          <Badge variant="default">{round1(totals.calories)} kcal</Badge>
          <Badge variant="secondary">{round1(totals.protein)} g protéines</Badge>
          <Badge variant="secondary">{round1(totals.carbs)} g glucides</Badge>
          <Badge variant="secondary">{round1(totals.fat)} g lipides</Badge>
        </div>

        <div className="max-h-[45vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aliment</TableHead>
                <TableHead>Poids (g)</TableHead>
                <TableHead>Calories</TableHead>
                <TableHead>Protéines</TableHead>
                <TableHead>Glucides</TableHead>
                <TableHead>Lipides</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Input
                      value={row.item_name}
                      onChange={(event) =>
                        handleNameChange(row.id, event.target.value)
                      }
                      aria-invalid={rowErrors.has(row.id)}
                      disabled={isSaving}
                      className="min-w-32"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      step="1"
                      value={row.weight_grams}
                      onChange={(event) =>
                        handleWeightChange(row.id, event.target.value)
                      }
                      aria-invalid={row.weight_grams <= 0}
                      disabled={isSaving}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>{round1(row.calories)}</TableCell>
                  <TableCell>{round1(row.protein)} g</TableCell>
                  <TableCell>{round1(row.carbs)} g</TableCell>
                  <TableCell>{round1(row.fat)} g</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(row.id)}
                      disabled={isSaving}
                      aria-label={`Supprimer ${row.item_name || "cet aliment"}`}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {rowErrors.size > 0 && (
          <ul className="space-y-1 text-xs text-destructive">
            {rows
              .filter((row) => rowErrors.has(row.id))
              .map((row) => (
                <li key={row.id}>
                  {row.item_name || "Ingrédient"} : {rowErrors.get(row.id)}
                </li>
              ))}
          </ul>
        )}
        {rows.length === 0 && (
          <p className="text-xs text-destructive">
            Ajoute au moins un aliment avant d&apos;enregistrer.
          </p>
        )}

        {/* Refinement section */}
        <div className="flex gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <div className="flex flex-1 flex-col gap-1">
            <span className="flex items-center gap-1 text-xs font-medium text-primary">
              <Sparkles className="size-3" />
              Quelque chose a-t-il été oublié ?
            </span>
            <Input
              value={refinementText}
              onChange={(e) => setRefinementText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && refinementText.trim()) handleRefine(); }}
              placeholder="Ex : il y avait aussi des oignons et une sauce tomate"
              disabled={isSaving || isRefining}
              className="text-sm"
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleRefine}
            disabled={isSaving || isRefining || !refinementText.trim()}
            className="self-end"
          >
            {isRefining ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Affiner"
            )}
          </Button>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isRefining || hasBlockingErrors}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Valider et enregistrer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
