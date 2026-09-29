"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  activityStepSchema,
  profileStepSchema,
  type ActivityStepInput,
  type ProfileStepInput,
} from "@/lib/validators/userGoalsSchema";
import {
  computeNutritionGoals,
  type NutritionGoalsResult,
} from "@/lib/calculations/nutrition-goals";
import { saveUserGoals } from "@/features/onboarding/actions";
import { StepProfile } from "./step-profile";
import { StepActivity } from "./step-activity";
import { StepReview, type AdjustableGoals } from "./step-review";

export type WizardFormValues = ProfileStepInput & ActivityStepInput;

const wizardSchema = profileStepSchema.extend(activityStepSchema.shape);

const TOTAL_STEPS = 3;

const STEP_COPY = [
  {
    title: "Votre profil",
    description: "Ces informations servent à calculer vos besoins caloriques.",
  },
  {
    title: "Activité & objectif",
    description: "Votre niveau d'activité et votre objectif nutritionnel.",
  },
  {
    title: "Vos objectifs",
    description: "Ajustez si besoin, puis validez pour terminer.",
  },
] as const;

export function GoalsWizard() {
  const [step, setStep] = useState(1);
  const [computed, setComputed] = useState<NutritionGoalsResult | null>(null);
  const [adjusted, setAdjusted] = useState<AdjustableGoals | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<WizardFormValues>({
    resolver: zodResolver(wizardSchema),
    mode: "onSubmit",
    defaultValues: {
      weightKg: undefined,
      heightCm: undefined,
      age: undefined,
      sex: "male",
      activityLevel: "moderate",
      goalType: "maintain",
    },
  });

  async function handleNext() {
    if (step === 1) {
      const valid = await trigger(["weightKg", "heightCm", "age", "sex"]);
      if (!valid) return;
      setStep(2);
      return;
    }

    if (step === 2) {
      const valid = await trigger(["activityLevel", "goalType"]);
      if (!valid) return;

      const values = getValues();
      const result = computeNutritionGoals(values);
      setComputed(result);
      setAdjusted((current) => current ?? { ...result });
      setStep(3);
    }
  }

  function handleBack() {
    setStep((current) => Math.max(1, current - 1));
  }

  function handleAdjust(key: keyof AdjustableGoals, value: number) {
    setAdjusted((current) => (current ? { ...current, [key]: value } : current));
  }

  function handleSubmit() {
    if (!adjusted) return;
    setSubmitError(null);

    const payload = { ...getValues(), ...adjusted };

    startTransition(async () => {
      const result = await saveUserGoals(payload);
      if (result?.error) {
        setSubmitError(result.error);
      }
    });
  }

  const progressValue = (step / TOTAL_STEPS) * 100;
  const copy = STEP_COPY[step - 1];

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <Progress value={progressValue} className="mb-2" />
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>

      <CardContent>
        {step === 1 && (
          <StepProfile register={register} control={control} errors={errors} />
        )}
        {step === 2 && <StepActivity control={control} errors={errors} />}
        {step === 3 && computed && adjusted && (
          <StepReview computed={computed} values={adjusted} onChange={handleAdjust} />
        )}
        {submitError && (
          <p className="mt-4 text-sm text-destructive">{submitError}</p>
        )}
      </CardContent>

      <CardFooter className="justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={step === 1 || isPending}
        >
          Précédent
        </Button>

        {step < TOTAL_STEPS ? (
          <Button type="button" onClick={handleNext}>
            Suivant
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Enregistrement..." : "Valider mes objectifs"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
