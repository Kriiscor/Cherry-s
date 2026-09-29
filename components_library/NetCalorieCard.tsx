import React from "react";
import { Calculator } from "lucide-react";

interface NetCalorieCardProps {
  caloriesEaten: number;
  caloriesBurned: number;
  targetCalories: number;
}

export const NetCalorieCard: React.FC<NetCalorieCardProps> = ({
  caloriesEaten,
  caloriesBurned,
  targetCalories,
}) => {
  const netCalories = caloriesEaten - caloriesBurned;
  const percentage = Math.min(Math.round((netCalories / targetCalories) * 100), 100);
  const remaining = targetCalories - netCalories;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#C9184A]" />
          <h3 className="font-extrabold text-slate-900 text-sm">Bilan Calorique Net</h3>
        </div>
        <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
          Objectif {targetCalories} kcal
        </span>
      </div>

      <div className="text-center py-1">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Net du jour</p>
        <p className="text-3xl font-black text-slate-900">
          {netCalories} <span className="text-sm font-bold text-slate-400">kcal</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 text-center">
          <span className="text-[10px] font-bold text-rose-700 uppercase">Mangé (+ Repas)</span>
          <p className="text-base font-extrabold text-rose-900">+{caloriesEaten} kcal</p>
        </div>
        <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 text-center">
          <span className="text-[10px] font-bold text-emerald-700 uppercase">Brûlé (- Sport)</span>
          <p className="text-base font-extrabold text-emerald-900">-{caloriesBurned} kcal</p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#C9184A] to-[#590D22] rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400 font-semibold text-right">
          {remaining > 0 ? `Reste ${remaining} kcal disponible` : "Objectif dépassé"}
        </p>
      </div>
    </div>
  );
};
