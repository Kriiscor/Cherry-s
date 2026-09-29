import React from "react";
import { Droplet, PartyPopper, CheckCircle2 } from "lucide-react";

interface HydrationTrackerCardProps {
  currentMl: number;
  targetMl: number;
  onAddWater: (amountMl: number) => void;
}

export const HydrationTrackerCard: React.FC<HydrationTrackerCardProps> = ({
  currentMl,
  targetMl,
  onAddWater,
}) => {
  const currentLitres = (currentMl / 1000).toFixed(2);
  const targetLitres = (targetMl / 1000).toFixed(2);
  const rawPercentage = Math.round((currentMl / targetMl) * 100);
  const percentage = Math.min(rawPercentage, 100);
  const isTargetReached = currentMl >= targetMl;

  return (
    <div
      className={`p-6 rounded-3xl border transition-all duration-500 space-y-5 ${
        isTargetReached
          ? "bg-gradient-to-b from-emerald-50/60 via-white to-white border-emerald-300 shadow-md shadow-emerald-500/10"
          : "bg-white border-slate-200 shadow-sm"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          {isTargetReached ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
          ) : (
            <Droplet className="w-5 h-5 text-sky-500 fill-sky-500" />
          )}
          <h3 className="font-extrabold text-slate-900 text-sm">Tracker d'Hydratation</h3>
        </div>

        {isTargetReached ? (
          <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
            <PartyPopper className="w-3.5 h-3.5 text-emerald-600" /> 🎉 Objectif Atteint !
          </span>
        ) : (
          <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
            Cible {targetLitres} Litres
          </span>
        )}
      </div>

      {/* Main Counter & Progress Bar */}
      <div className="text-center space-y-1.5">
        <p
          className={`text-2xl font-black transition-colors ${
            isTargetReached ? "text-emerald-900" : "text-sky-900"
          }`}
        >
          {currentLitres} / {targetLitres}{" "}
          <span className="text-sm font-bold text-slate-400">Litres</span>
        </p>

        {/* Progress Bar Container */}
        <div
          className={`h-3.5 w-full rounded-full overflow-hidden p-0.5 border transition-all duration-500 ${
            isTargetReached ? "bg-emerald-100 border-emerald-200" : "bg-sky-50 border-sky-100"
          }`}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isTargetReached
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/30"
                : "bg-sky-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {isTargetReached && (
          <p className="text-[11px] font-extrabold text-emerald-700 pt-1 flex items-center justify-center gap-1">
            <span>👏 Bravo ! Hydratation parfaite pour la journée.</span>
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => onAddWater(250)}
          className={`p-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 border ${
            isTargetReached
              ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900"
              : "bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-800"
          }`}
        >
          💧 +250 ml (Verre)
        </button>
        <button
          onClick={() => onAddWater(500)}
          className={`p-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 border ${
            isTargetReached
              ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900"
              : "bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-800"
          }`}
        >
          🍾 +500 ml (Gourde)
        </button>
      </div>
    </div>
  );
};
