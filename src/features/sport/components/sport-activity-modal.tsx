"use client";

import { useMemo, useState } from "react";
import { Dumbbell, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useMediaQuery } from "@/hooks/use-media-query";
import { useUserGoals } from "@/features/dashboard/hooks/use-user-goals";
import { useLogSportMutation } from "@/features/sport/hooks/use-log-sport-mutation";
import { MET_CATALOG, findMetActivity } from "@/features/sport/lib/met-catalog";
import { estimateCaloriesBurned } from "@/features/sport/lib/calories";
import { sportActivitySchema } from "@/lib/validators/sportActivitySchema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Fallback body weight used only when the user hasn't completed onboarding. */
const DEFAULT_WEIGHT_KG = 70;

/**
 * Sport logging entry point (TICK-018). A responsive Dialog (desktop) /
 * Drawer (mobile) — same pattern as <MealInputDrawer /> — with an activity
 * picker (static MET catalogue), a duration input, and a live calories
 * estimate the user can override before saving. Body weight is read from
 * `user_goals` (onboarding output); the estimate recomputes whenever the
 * activity or duration changes and the user hasn't manually edited it.
 */
export function SportActivityModal() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const goalsQuery = useUserGoals();
  const logSport = useLogSportMutation();

  const weightKg = goalsQuery.data?.weight_kg ?? DEFAULT_WEIGHT_KG;

  const [open, setOpen] = useState(false);
  const [activitySlug, setActivitySlug] = useState<string>("");
  const [durationStr, setDurationStr] = useState<string>("");
  const [caloriesStr, setCaloriesStr] = useState<string>("");
  const [caloriesEdited, setCaloriesEdited] = useState(false);

  const activity = activitySlug ? findMetActivity(activitySlug) : undefined;
  const duration = Number(durationStr);

  const estimatedCalories = useMemo(() => {
    if (!activity || !Number.isFinite(duration) || duration <= 0) return 0;
    return estimateCaloriesBurned(activity.met, weightKg, duration);
  }, [activity, duration, weightKg]);

  /**
   * Effective calories displayed in the field (TICK-018: "possibilité
   * d'ajustement manuel"). When the user hasn't touched the field, we derive
   * its value from the estimate rather than storing it in state, which avoids
   * a useEffect→setState cascade. When the user has edited it, we keep their
   * value.
   */
  const effectiveCaloriesStr = caloriesEdited
    ? caloriesStr
    : estimatedCalories > 0
      ? String(estimatedCalories)
      : "";

  const resetForm = () => {
    setActivitySlug("");
    setDurationStr("");
    setCaloriesStr("");
    setCaloriesEdited(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  };

  const handleSave = () => {
    if (!activity) {
      toast.error("Sélectionne une activité.");
      return;
    }

    const parsed = sportActivitySchema.safeParse({
      activity_name: activity.name,
      met_value: activity.met,
      duration_minutes: durationStr,
      calories_burned: effectiveCaloriesStr,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Données invalides.");
      return;
    }

    logSport.mutate(parsed.data, {
      onSuccess: () => handleOpenChange(false),
    });
  };

  const formContent = (
    <div className="flex flex-col gap-4 px-4 pb-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sport-activity">Activité</Label>
        <Select value={activitySlug} onValueChange={setActivitySlug}>
          <SelectTrigger id="sport-activity" className="w-full">
            <SelectValue placeholder="Choisis une activité" />
          </SelectTrigger>
          <SelectContent>
            {MET_CATALOG.map((item) => (
              <SelectItem key={item.slug} value={item.slug}>
                {item.name} · MET {item.met}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sport-duration">Durée (minutes)</Label>
        <Input
          id="sport-duration"
          type="number"
          min={1}
          max={1440}
          inputMode="numeric"
          placeholder="30"
          value={durationStr}
          onChange={(event) => setDurationStr(event.target.value)}
          disabled={logSport.isPending}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sport-calories">Calories brûlées (kcal)</Label>
        <Input
          id="sport-calories"
          type="number"
          min={1}
          max={10000}
          inputMode="numeric"
          placeholder="0"
          value={effectiveCaloriesStr}
          onChange={(event) => {
            setCaloriesEdited(true);
            setCaloriesStr(event.target.value);
          }}
          disabled={logSport.isPending}
        />
        <p className="text-xs text-muted-foreground">
          {activity && duration > 0
            ? `Estimation : ${estimatedCalories} kcal (MET ${activity.met} × ${weightKg} kg × ${duration} min)`
            : "Estimé automatiquement selon ton poids, l'activité et la durée."}
          {caloriesEdited && (
            <>
              {" "}
              <button
                type="button"
                className="font-medium text-primary underline underline-offset-2"
                onClick={() => setCaloriesEdited(false)}
              >
                Réinitialiser
              </button>
            </>
          )}
        </p>
      </div>

      {!goalsQuery.data && (
        <p className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
          Poids par défaut de {DEFAULT_WEIGHT_KG} kg utilisé. Configure ton
          profil pour un calcul personnalisé.
        </p>
      )}
    </div>
  );

  const saveButton = (
    <Button
      type="button"
      onClick={handleSave}
      disabled={logSport.isPending}
      className="w-full"
    >
      {logSport.isPending ? (
        <>
          <Loader2 className="animate-spin" />
          Enregistrement...
        </>
      ) : (
        "Enregistrer l'activité"
      )}
    </Button>
  );

  const triggerButton = (
    <Button type="button" variant="outline" className="w-full">
      <Dumbbell />
      Ajouter une activité
    </Button>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle activité sportive</DialogTitle>
            <DialogDescription>
              Choisis une activité et sa durée : les calories brûlées sont
              estimées automatiquement.
            </DialogDescription>
          </DialogHeader>
          {formContent}
          <DialogFooter>{saveButton}</DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Nouvelle activité sportive</DrawerTitle>
          <DrawerDescription>
            Choisis une activité et sa durée : les calories brûlées sont
            estimées automatiquement.
          </DrawerDescription>
        </DrawerHeader>
        {formContent}
        <DrawerFooter>{saveButton}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
