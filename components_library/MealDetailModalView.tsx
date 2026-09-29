import React from "react";
import { Eye, Trash2 } from "lucide-react";

export interface MealItemDetail {
  id: string;
  name: string;
  weightGrams: number;
  calories: number;
}

export interface MealDetailData {
  id: string;
  title: string;
  emoji: string;
  totalCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  loggedTime: string;
  items: MealItemDetail[];
}

interface MealDetailModalViewProps {
  meal: MealDetailData;
  onEditMeal: (mealId: string) => void;
  onDeleteMeal: (mealId: string) => void;
}

export const MealDetailModalView: React.FC<MealDetailModalViewProps> = ({
  meal,
  onEditMeal,
  onDeleteMeal,
}) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#C9184A]" />
          <h3 className="font-extrabold text-slate-900 text-sm">Aperçu Vue Détaillée Repas</h3>
        </div>
        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          {meal.loggedTime}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4 bg-rose-50 p-3 rounded-2xl border border-rose-100">
          <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center text-3xl shadow-sm">
            {meal.emoji}
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">{meal.title}</h4>
            <p className="text-xs text-slate-500 font-semibold">
              {meal.totalCalories} kcal • {meal.proteinGrams}g Protéines
            </p>
            <div className="flex gap-2 mt-1.5">
              <span className="text-[10px] font-bold bg-white text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                Prot: {meal.proteinGrams}g
              </span>
              <span className="text-[10px] font-bold bg-white text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                Gluc: {meal.carbsGrams}g
              </span>
              <span className="text-[10px] font-bold bg-white text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                Lip: {meal.fatGrams}g
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
            Composition détaillée :
          </p>
          {meal.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between py-1 border-b border-slate-100 text-slate-600 font-medium"
            >
              <span>
                • {item.name} ({item.weightGrams}g)
              </span>
              <span className="font-bold text-slate-900">{item.calories} kcal</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 flex gap-2">
        <button
          onClick={() => onEditMeal(meal.id)}
          className="w-full bg-[#C9184A] hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm"
        >
          Modifier ce repas
        </button>
        <button
          onClick={() => onDeleteMeal(meal.id)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
