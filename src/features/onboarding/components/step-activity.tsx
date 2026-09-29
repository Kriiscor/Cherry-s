"use client";

import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { WizardFormValues } from "./goals-wizard";

interface StepActivityProps {
  control: Control<WizardFormValues>;
  errors: FieldErrors<WizardFormValues>;
}

const ACTIVITY_OPTIONS: { value: WizardFormValues["activityLevel"]; label: string }[] = [
  { value: "sedentary", label: "Sédentaire (peu ou pas d'exercice)" },
  { value: "light", label: "Légère (exercice 1-3x / semaine)" },
  { value: "moderate", label: "Modérée (exercice 3-5x / semaine)" },
  { value: "active", label: "Active (exercice 6-7x / semaine)" },
  { value: "very_active", label: "Très active (exercice intense quotidien)" },
];

const GOAL_OPTIONS: { value: WizardFormValues["goalType"]; label: string }[] = [
  { value: "lose", label: "Perdre du poids" },
  { value: "maintain", label: "Maintenir mon poids" },
  { value: "gain", label: "Prendre du poids / de la masse" },
];

export function StepActivity({ control, errors }: StepActivityProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="activityLevel">Niveau d&apos;activité</Label>
        <Controller
          name="activityLevel"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="activityLevel" className="w-full">
                <SelectValue placeholder="Choisissez votre niveau d'activité" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.activityLevel && (
          <p className="text-xs text-destructive">
            {errors.activityLevel.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Objectif</Label>
        <Controller
          name="goalType"
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="gap-2"
            >
              {GOAL_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`goal-${option.value}`}
                  className="flex items-center gap-2 rounded-lg border border-input px-3 py-2"
                >
                  <RadioGroupItem id={`goal-${option.value}`} value={option.value} />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
          )}
        />
        {errors.goalType && (
          <p className="text-xs text-destructive">{errors.goalType.message}</p>
        )}
      </div>
    </div>
  );
}
