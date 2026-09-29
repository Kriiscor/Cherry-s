"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  settingsSchema,
  type SettingsInput,
} from "@/lib/validators/settingsSchema";
import { computeNutritionGoals } from "@/lib/calculations/nutrition-goals";
import { updateSettingsAction } from "@/features/settings/actions";
import { cn } from "cn";

interface SettingsFormProps {
  defaultValues: SettingsInput;
}

const ACTIVITY_OPTIONS: { value: SettingsInput["activityLevel"]; label: string }[] = [
  { value: "sedentary", label: "Sédentaire (peu ou pas d'exercice)" },
  { value: "light", label: "Légère (exercice 1-3x / semaine)" },
  { value: "moderate", label: "Modérée (exercice 3-5x / semaine)" },
  { value: "active", label: "Active (exercice 6-7x / semaine)" },
  { value: "very_active", label: "Très active (exercice intense quotidien)" },
];

const GOAL_OPTIONS: { value: SettingsInput["goalType"]; label: string }[] = [
  { value: "lose", label: "Perdre du poids" },
  { value: "maintain", label: "Maintenir mon poids" },
  { value: "gain", label: "Prendre du poids / de la masse" },
];

const GOAL_LABELS: Record<SettingsInput["goalType"], string> = {
  lose: "Perte de poids",
  maintain: "Maintien",
  gain: "Prise de masse",
};

export function SettingsForm({ defaultValues }: SettingsFormProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    mode: "onChange",
    defaultValues,
  });

  const currentWeight = watch("weightKg") ?? defaultValues.weightKg;
  const currentHeight = watch("heightCm") ?? defaultValues.heightCm;
  const currentCalories = watch("dailyCalories") ?? defaultValues.dailyCalories;
  const currentGoal = watch("goalType") ?? defaultValues.goalType;

  function handleRecalculate() {
    const values = getValues();
    if (
      !values.weightKg ||
      !values.heightCm ||
      !values.age ||
      !values.sex ||
      !values.activityLevel ||
      !values.goalType
    ) {
      toast.error("Veuillez renseigner toutes vos informations physiques.");
      return;
    }

    const computed = computeNutritionGoals({
      weightKg: values.weightKg,
      heightCm: values.heightCm,
      age: values.age,
      sex: values.sex,
      activityLevel: values.activityLevel,
      goalType: values.goalType,
    });

    setValue("dailyCalories", computed.dailyCalories, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("proteinGrams", computed.proteinGrams, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("carbsGrams", computed.carbsGrams, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("fatGrams", computed.fatGrams, {
      shouldDirty: true,
      shouldValidate: true,
    });

    toast.info("Objectifs recalculés selon votre profil");
  }

  function onSubmit(values: SettingsInput) {
    startTransition(async () => {
      const result = await updateSettingsAction(values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      // Invalidate cached goals, totals and weekly trends so gauges and charts update instantly
      queryClient.invalidateQueries({ queryKey: ["user-goals"] });
      queryClient.invalidateQueries({ queryKey: ["daily-totals"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-trends"] });

      // Resets the form's dirty state to the just-saved values
      reset(values);
      toast.success("Paramètres enregistrés avec succès");
    });
  }

  return (
    <Card className="w-full max-w-lg overflow-hidden transition-all duration-200">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div
            role="button"
            tabIndex={0}
            className="flex cursor-pointer select-none items-center justify-between p-6 transition-colors hover:bg-muted/40"
          >
            <div className="flex flex-col gap-1 text-left">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <span>Profil & objectifs</span>
                <span className="text-xs font-normal text-muted-foreground">
                  (cliquer pour {isOpen ? "fermer" : "dérouler"})
                </span>
              </CardTitle>
              <CardDescription>
                {isOpen
                  ? "Modifiez vos données personnelles, votre activité et vos cibles."
                  : "Consultez et modifiez vos métriques physiques et cibles."}
              </CardDescription>

              {!isOpen && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="text-xs">
                    {currentWeight} kg
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {currentHeight} cm
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {currentCalories} kcal
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {GOAL_LABELS[currentGoal] ?? currentGoal}
                  </Badge>
                </div>
              )}
            </div>

            <div className="ml-4 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-muted">
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform duration-300",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="transition-all duration-300 data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
          <CardContent className="border-t border-border pt-6">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
              noValidate
            >
              {/* Section Profil personnel */}
              <div className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Profil physique
                </h2>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fullName">Nom</Label>
                  <Input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Votre nom"
                    aria-invalid={!!errors.fullName}
                    {...register("fullName")}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

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

                <div className="grid grid-cols-2 gap-4">
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
                      <p className="text-xs text-destructive">
                        {errors.age.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>Sexe</Label>
                    <Controller
                      name="sex"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="grid grid-cols-2 gap-2"
                        >
                          <Label
                            htmlFor="sex-male"
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-input py-2 text-xs font-normal cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            <RadioGroupItem id="sex-male" value="male" />
                            Homme
                          </Label>
                          <Label
                            htmlFor="sex-female"
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-input py-2 text-xs font-normal cursor-pointer hover:bg-muted/50 transition-colors"
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
              </div>

              <div className="h-px bg-border" />

              {/* Section Activité & Objectif */}
              <div className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Activité & Objectif
                </h2>

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
                  <Label>Objectif de poids</Label>
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
                            className="flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm font-normal cursor-pointer hover:bg-muted/50 transition-colors"
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

              <div className="h-px bg-border" />

              {/* Section Objectifs nutritionnels */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Cibles nutritionnelles
                  </h2>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRecalculate}
                    className="h-8 gap-1.5 text-xs text-cherry-600 hover:text-cherry-700 hover:bg-cherry-50 dark:hover:bg-cherry-950/30"
                  >
                    <Calculator className="size-3.5" />
                    Recalculer
                  </Button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dailyCalories">Objectif calorique quotidien (kcal)</Label>
                  <Input
                    id="dailyCalories"
                    type="number"
                    step="1"
                    inputMode="numeric"
                    aria-invalid={!!errors.dailyCalories}
                    {...register("dailyCalories", { valueAsNumber: true })}
                  />
                  {errors.dailyCalories && (
                    <p className="text-sm text-destructive">
                      {errors.dailyCalories.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="proteinGrams" className="text-xs">
                      Protéines (g)
                    </Label>
                    <Input
                      id="proteinGrams"
                      type="number"
                      step="1"
                      inputMode="numeric"
                      aria-invalid={!!errors.proteinGrams}
                      {...register("proteinGrams", { valueAsNumber: true })}
                    />
                    {errors.proteinGrams && (
                      <p className="text-xs text-destructive">
                        {errors.proteinGrams.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="carbsGrams" className="text-xs">
                      Glucides (g)
                    </Label>
                    <Input
                      id="carbsGrams"
                      type="number"
                      step="1"
                      inputMode="numeric"
                      aria-invalid={!!errors.carbsGrams}
                      {...register("carbsGrams", { valueAsNumber: true })}
                    />
                    {errors.carbsGrams && (
                      <p className="text-xs text-destructive">
                        {errors.carbsGrams.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="fatGrams" className="text-xs">
                      Lipides (g)
                    </Label>
                    <Input
                      id="fatGrams"
                      type="number"
                      step="1"
                      inputMode="numeric"
                      aria-invalid={!!errors.fatGrams}
                      {...register("fatGrams", { valueAsNumber: true })}
                    />
                    {errors.fatGrams && (
                      <p className="text-xs text-destructive">
                        {errors.fatGrams.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isPending} className="mt-2 w-full">
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Enregistrer
              </Button>
            </form>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
