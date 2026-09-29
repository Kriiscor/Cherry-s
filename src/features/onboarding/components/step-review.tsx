"use client";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import type { NutritionGoalsResult } from "@/lib/calculations/nutrition-goals";

export interface AdjustableGoals {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

interface StepReviewProps {
  computed: NutritionGoalsResult;
  values: AdjustableGoals;
  onChange: (key: keyof AdjustableGoals, value: number) => void;
}

/** Sliders are bounded to ±20% of the originally computed value. */
function bounds(base: number) {
  const min = Math.max(0, Math.round(base * 0.8));
  const max = Math.round(base * 1.2);
  return { min, max };
}

const ROWS: {
  key: keyof AdjustableGoals;
  label: string;
  unit: string;
}[] = [
  { key: "dailyCalories", label: "Calories quotidiennes", unit: "kcal" },
  { key: "proteinGrams", label: "Protéines", unit: "g" },
  { key: "carbsGrams", label: "Glucides", unit: "g" },
  { key: "fatGrams", label: "Lipides", unit: "g" },
];

export function StepReview({ computed, values, onChange }: StepReviewProps) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Voici vos objectifs calculés à partir de votre profil. Vous pouvez les
        ajuster légèrement (±20%) avant de valider.
      </p>

      {ROWS.map((row) => {
        const base = computed[row.key];
        const { min, max } = bounds(base);
        const current = values[row.key];

        return (
          <div key={row.key} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`slider-${row.key}`}>{row.label}</Label>
              <span className="text-sm font-medium text-foreground">
                {current} {row.unit}
              </span>
            </div>
            <Slider
              id={`slider-${row.key}`}
              min={min}
              max={max}
              step={1}
              value={[current]}
              onValueChange={([next]) => onChange(row.key, next)}
            />
            <span className="text-xs text-muted-foreground">
              Recommandé : {base} {row.unit} (plage {min}–{max})
            </span>
          </div>
        );
      })}
    </div>
  );
}
