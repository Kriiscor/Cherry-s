"use client";

import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useWeeklyReport } from "@/features/analytics/hooks/use-weekly-report";
import { useGenerateWeeklyReportMutation } from "@/features/analytics/hooks/use-generate-weekly-report-mutation";

/**
 * Weekly AI coach card (TICK-014), mockup style
 * (components_library/WeeklyCoachCard): a cherry-gradient hero card with the
 * quality score, an empathetic summary line, and the AI advice rendered in a
 * translucent panel. Stays wired to the weekly-report query + generate
 * mutation. The gradient is a branded surface, identical in light and dark.
 */
export function WeeklyReportCard() {
  const { data: report, isLoading, isError } = useWeeklyReport();
  const generateMutation = useGenerateWeeklyReportMutation();

  const isGenerating = generateMutation.isPending;
  const buttonLabel = report ? "Régénérer le bilan" : "Générer mon bilan";

  const weekLabel = report?.week_start_date
    ? `Semaine du ${format(new Date(report.week_start_date), "d MMM", { locale: fr })}`
    : "Cette semaine";

  const score = report?.quality_score ?? 0;
  const qualityMessage =
    score >= 80
      ? "Excellente régularité !"
      : score >= 60
        ? "Bonne progression"
        : "En route vers l'équilibre";

  return (
    <div className="relative space-y-5 overflow-hidden rounded-3xl bg-gradient-to-br from-cherry-600 to-cherry-900 p-6 text-white shadow-xl shadow-cherry-900/20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-amber-300" />
          <h4 className="text-sm font-extrabold tracking-wide">
            Coach IA hebdo
          </h4>
        </div>
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold backdrop-blur-md">
          {weekLabel}
        </span>
      </div>

      {isLoading || isGenerating ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl bg-white/20" />
          <Skeleton className="h-16 w-full rounded-2xl bg-white/20" />
        </div>
      ) : isError ? (
        <p className="rounded-2xl bg-black/20 p-4 text-sm text-cherry-100">
          Impossible de charger le bilan pour le moment.
        </p>
      ) : (
        <>
          {/* Score block */}
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-white/30 bg-white/20 text-3xl font-black text-white">
              {report ? score : "—"}
            </div>
            <div>
              <p className="text-xs font-medium text-cherry-100">
                Score de qualité{report ? " / 100" : ""}
              </p>
              <p className="text-sm font-bold text-white">
                {report ? qualityMessage : "Aucun bilan généré pour l'instant"}
              </p>
            </div>
          </div>

          {/* Advice */}
          {report ? (
            <div className="space-y-2 text-xs leading-relaxed text-cherry-100">
              <p className="font-semibold text-white">
                💡 Conseils de la semaine :
              </p>
              <div className="rounded-xl bg-black/20 p-3 text-sm text-cherry-50 backdrop-blur-sm [&_h1]:mb-2 [&_h1]:mt-3 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-white [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-white [&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:font-semibold [&_h3]:text-white [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p:not(:last-child)]:mb-3 [&_strong]:font-semibold [&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-5">
                <ReactMarkdown>{report.ai_advice_markdown ?? ""}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <p className="rounded-xl bg-black/20 p-3 text-sm text-cherry-100 backdrop-blur-sm">
              Génère ton bilan pour voir ta note de qualité et les conseils
              personnalisés du coach IA.
            </p>
          )}
        </>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={() => generateMutation.mutate()}
        disabled={isGenerating || isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-cherry-900 shadow-sm transition hover:bg-cherry-50 disabled:opacity-60 sm:w-auto"
      >
        {isGenerating ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Génération en cours...
          </>
        ) : (
          <>
            <RefreshCw className="size-4" />
            {buttonLabel}
          </>
        )}
      </button>
    </div>
  );
}
