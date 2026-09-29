import React from "react";
import { Flame, Trophy, Award, Sparkles } from "lucide-react";

interface StreakBadgeCardProps {
  currentStreakDays: number;
  unlockedBadgesCount: number;
  totalBadgesCount: number;
  motivationalQuote: string;
}

export const StreakBadgeCard: React.FC<StreakBadgeCardProps> = ({
  currentStreakDays,
  unlockedBadgesCount,
  totalBadgesCount,
  motivationalQuote,
}) => {
  return (
    <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-[#C9184A] p-6 rounded-3xl text-white shadow-xl shadow-rose-900/20 space-y-4 relative overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black">
          <Flame className="w-4 h-4 text-amber-300 animate-pulse fill-amber-300" />
          <span>Série en cours : {currentStreakDays} Jours d'affilée 🔥</span>
        </div>
        <div className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full text-xs font-extrabold border border-white/20">
          <Trophy className="w-3.5 h-3.5 text-amber-300" />
          <span>
            {unlockedBadgesCount}/{totalBadgesCount} Badges
          </span>
        </div>
      </div>

      {/* Motivational Body */}
      <div className="space-y-2">
        <h4 className="text-lg font-black text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-300" /> Vos Progrès Sont Remarquables !
        </h4>
        <p className="text-xs text-rose-100 italic bg-black/20 p-3 rounded-2xl border border-white/10 leading-relaxed">
          "{motivationalQuote}"
        </p>
      </div>

      {/* Badges Preview Row */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm shadow-xs" title="Scan Master">
            📸
          </span>
          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm shadow-xs" title="Hydratation 7j">
            💧
          </span>
          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm shadow-xs" title="Athlète">
            🏃
          </span>
          <span className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
            +3
          </span>
        </div>

        <button className="text-[11px] font-extrabold bg-white text-rose-900 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition shadow-sm">
          Voir tous mes trophées 🏆
        </button>
      </div>
    </div>
  );
};
