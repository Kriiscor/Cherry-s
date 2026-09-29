"use client";

import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { WizardFormValues } from "./goals-wizard";

interface StepProfileProps {
  register: UseFormRegister<WizardFormValues>;
  control: Control<WizardFormValues>;
  errors: FieldErrors<WizardFormValues>;
}

export function StepProfile({ register, control, errors }: StepProfileProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="weightKg">Poids (kg)</Label>
          <Input
            id="weightKg"
            type="number"
            step="0.1"
            inputMode="decimal"
            placeholder="70"
            aria-invalid={!!errors.weightKg}
            {...register("weightKg", { valueAsNumber: true })}
          />
          {errors.weightKg && (
            <p className="text-xs text-destructive">
              {errors.weightKg.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="heightCm">Taille (cm)</Label>
          <Input
            id="heightCm"
            type="number"
            step="0.1"
            inputMode="decimal"
            placeholder="175"
            aria-invalid={!!errors.heightCm}
            {...register("heightCm", { valueAsNumber: true })}
          />
          {errors.heightCm && (
            <p className="text-xs text-destructive">
              {errors.heightCm.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="age">Âge</Label>
        <Input
          id="age"
          type="number"
          step="1"
          inputMode="numeric"
          placeholder="30"
          aria-invalid={!!errors.age}
          {...register("age", { valueAsNumber: true })}
        />
        {errors.age && (
          <p className="text-xs text-destructive">{errors.age.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sex-male">Sexe</Label>
        <Controller
          name="sex"
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="grid-cols-2"
            >
              <Label
                htmlFor="sex-male"
                className="flex items-center gap-2 rounded-lg border border-input px-3 py-2"
              >
                <RadioGroupItem id="sex-male" value="male" />
                Homme
              </Label>
              <Label
                htmlFor="sex-female"
                className="flex items-center gap-2 rounded-lg border border-input px-3 py-2"
              >
                <RadioGroupItem id="sex-female" value="female" />
                Femme
              </Label>
            </RadioGroup>
          )}
        />
        {errors.sex && (
          <p className="text-xs text-destructive">{errors.sex.message}</p>
        )}
      </div>
    </div>
  );
}
