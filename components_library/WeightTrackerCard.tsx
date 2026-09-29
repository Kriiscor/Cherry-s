import React from "react";
import { TrendingDown, PlusCircle } from "lucide-react";

interface WeightLog {
  id: string;
  weightKg: number;
  date: string;
}

interface WeightTrackerCardProps {
  currentWeightKg: number;
  targetWeightKg: number;
  bmiValue: number;
  bmiCategory: string;
  monthlyVariationKg: number;
  logsHistory: WeightLog[];
  onOpenWeightModal: () => void;
}

export const WeightTrackerCard: React.FC<WeightTrackerCardProps> = ({
  currentWeightKg,
  targetWeightKg,
  bmiValue,
  bmiCategory,
  monthlyVariationKg,
  logsHistory,
  onOpenWeightModal,
}) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-slate-900 text-sm">Suivi du Poids & IMC</h3>
        </div>
        <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
          IMC {bmiValue} ({bmiCategory})
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wide">Poids Actuel</p>
          <h4 className="text-3xl font-black text-slate-900">
            {currentWeightKg} <span className="text-base font-bold text-slate-400">kg</span>
          </h4>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
            {monthlyVariationKg <= 0 ? "↓" : "↑"} {monthlyVariationKg} kg ce mois
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Cible : {targetWeightKg} kg</p>
        </div>
      </div>

      {/* Simulated Curve Bars */}
      <div className="h-28 bg-slate-50 rounded-2xl border border-slate-100 p-3 flex items-end justify-between gap-2">
        {logsHistory.map((log, idx) => (
          <div
            key={log.id || idx}
            className={`w-full rounded-t-lg transition-all ${
              idx === logsHistory.length - 1
                ? "bg-gradient-to-t from-[#C9184A] to-[#590D22] shadow-sm"
                : "bg-rose-200 hover:bg-rose-300"
            }`}
            style={{
              height: `${Math.max(40, Math.min(100, (log.weightKg / (targetWeightKg * 1.1)) * 100))}%`,
            }}
            title={`${log.weightKg} kg (${log.date})`}
          />
        ))}
      </div>

      <button
        onClick={onOpenWeightModal}
        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition"
      >
        <PlusCircle className="w-4 h-4" /> Enregistrer ma pesée
      </button>
    </div>
  );
};
