import React from "react";
import { Sparkles } from "lucide-react";

interface WeeklyCoachCardProps {
  score: number;
  weekLabel: string;
  adviceText: string;
}

export const WeeklyCoachCard: React.FC<WeeklyCoachCardProps> = ({
  score,
  weekLabel,
  adviceText,
}) => {
  return (
    <div className="bg-gradient-to-br from-[#C9184A] to-[#590D22] p-6 rounded-3xl text-white shadow-xl shadow-rose-900/20 space-y-5 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <h4 className="font-extrabold text-sm tracking-wide">Coach IA Hebdo</h4>
        </div>
        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold">
          {weekLabel}
        </span>
      </div>

      <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
        <div className="text-3xl font-black text-white bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/30">
          {score}
        </div>
        <div>
          <p className="text-xs text-rose-100 font-medium">Score de Qualité</p>
          <p className="text-sm font-bold text-white">
            {score >= 80 ? "Excellente régularité !" : "Bonne progression"}
          </p>
        </div>
      </div>

      <div className="text-xs text-rose-100 leading-relaxed space-y-2">
        <p className="font-semibold text-white">💡 Conseil de la semaine :</p>
        <p className="bg-black/20 p-3 rounded-xl backdrop-blur-sm italic">
          "{adviceText}"
        </p>
      </div>
    </div>
  );
};
