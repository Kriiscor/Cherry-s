import { WeeklyTrendsChart } from "@/features/analytics/components/weekly-trends-chart";
import { WeeklyReportCard } from "@/features/analytics/components/weekly-report-card";
import { WeightChart } from "@/features/weight/components/weight-chart";

export default function AnalyticsPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analyses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tes tendances nutritionnelles, ton suivi de poids et ton bilan de
          coaching IA de la semaine.
        </p>
      </div>

      <WeeklyTrendsChart />
      <WeightChart />
      <WeeklyReportCard />
    </div>
  );
}
