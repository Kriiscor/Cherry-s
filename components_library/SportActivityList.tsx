import React from "react";
import { Dumbbell, Plus, Activity } from "lucide-react";

export interface SportSession {
  id: string;
  activityName: string;
  emoji: string;
  durationMinutes: number;
  metValue: number;
  caloriesBurned: number;
}

interface SportActivityListProps {
  sessions: SportSession[];
  onOpenAddModal: () => void;
}

export const SportActivityList: React.FC<SportActivityListProps> = ({
  sessions,
  onOpenAddModal,
}) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-[#C9184A]" />
          <h3 className="font-extrabold text-slate-900 text-sm">Module Sport (METs)</h3>
        </div>
        <button
          onClick={onOpenAddModal}
          className="text-xs font-bold text-[#C9184A] bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Ajouter
        </button>
      </div>

      <div className="space-y-2.5">
        {sessions.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400">
            Aucune séance enregistrée aujourd'hui.
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  {session.emoji}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{session.activityName}</p>
                  <p className="text-[10px] text-slate-400">
                    {session.durationMinutes} min • MET {session.metValue}
                  </p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                -{session.caloriesBurned} kcal
              </span>
            </div>
          ))
        )}
      </div>

      <div className="pt-1">
        <button
          onClick={onOpenAddModal}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
        >
          <Activity className="w-4 h-4" /> Enregistrer une séance
        </button>
      </div>
    </div>
  );
};
