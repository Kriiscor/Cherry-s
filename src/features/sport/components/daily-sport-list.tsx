"use client";

import { useState } from "react";
import { Dumbbell, Trash2 } from "lucide-react";

import { useDailySports } from "@/features/sport/hooks/use-daily-sports";
import { useDeleteSportMutation } from "@/features/sport/hooks/use-delete-sport-mutation";
import { SportActivityModal } from "@/features/sport/components/sport-activity-modal";
import type { SportActivity } from "@/features/sport/hooks/use-daily-sports";

import { Skeleton } from "@/components/ui/skeleton";
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

type DailySportListProps = {
  date: Date;
};

/** Maps a catalogue activity name to a display emoji for the mockup chip. */
const ACTIVITY_EMOJI: Record<string, string> = {
  "Course à pied": "🏃",
  Marche: "🚶",
  Vélo: "🚴",
  Natation: "🏊",
  Musculation: "🏋️",
  HIIT: "🔥",
  Yoga: "🧘",
  Football: "⚽",
  Basketball: "🏀",
  Tennis: "🎾",
  Boxe: "🥊",
  Danse: "💃",
  Elliptique: "🌀",
  Rameur: "🚣",
  "Corde à sauter": "🪢",
};

function emojiFor(name: string): string {
  return ACTIVITY_EMOJI[name] ?? "🏋️";
}

/**
 * Daily sport & activity panel (TICK-018), mockup style
 * (components_library/SportActivityList) rebuilt on theme tokens: a divider
 * header, activity rows with an emoji chip + duration/MET line and a burned
 * kcal badge, a delete flow, and the <SportActivityModal /> entry point as the
 * bottom call-to-action. Dark-mode aware.
 */
export function DailySportList({ date }: DailySportListProps) {
  const sportsQuery = useDailySports(date);
  const deleteSport = useDeleteSportMutation();
  const [pendingDelete, setPendingDelete] = useState<SportActivity | null>(null);

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="size-5 text-primary" />
          <h3 className="text-sm font-extrabold text-foreground">
            Module sport (METs)
          </h3>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {sportsQuery.isPending && (
          <>
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </>
        )}

        {sportsQuery.isError && (
          <p className="text-sm text-destructive">
            Impossible de charger les activités. Réessaie plus tard.
          </p>
        )}

        {sportsQuery.isSuccess && sportsQuery.data.length === 0 && (
          <div className="py-4 text-center text-xs text-muted-foreground">
            Aucune séance enregistrée aujourd&apos;hui.
          </div>
        )}

        {sportsQuery.isSuccess &&
          sportsQuery.data.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-lg font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                  {emojiFor(activity.activity_name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-foreground">
                    {activity.activity_name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {activity.duration_minutes} min • MET {activity.met_value}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
                  −{activity.calories_burned} kcal
                </span>
                <button
                  type="button"
                  onClick={() => setPendingDelete(activity)}
                  aria-label={`Supprimer ${activity.activity_name}`}
                  className="rounded-lg p-1.5 text-muted-foreground transition hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* CTA */}
      <div className="pt-1">
        <SportActivityModal />
      </div>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette activité ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible : l&apos;activité et les calories
              brûlées associées seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSport.isPending}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (pendingDelete) {
                  deleteSport.mutate(pendingDelete.id, {
                    onSettled: () => setPendingDelete(null),
                  });
                }
              }}
              disabled={deleteSport.isPending}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
