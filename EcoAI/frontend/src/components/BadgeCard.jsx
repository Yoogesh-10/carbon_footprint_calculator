import React from 'react';
import { Award, Sprout, Bus, Sun, Leaf, Recycle, Lock } from 'lucide-react';

const ICON_MAP = {
  Sprout,
  Seedling: Sprout,
  Bus,
  Sun,
  Leaf,
  Recycle,
  Award
};

export default function BadgeCard({ title, category, description, iconName, unlocked }) {
  const IconComponent = ICON_MAP[iconName] || Award;

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
      unlocked
        ? 'bg-gradient-to-br from-emerald-500/10 via-white/80 to-cyan-500/10 dark:from-emerald-950/40 dark:via-slate-900/80 dark:to-cyan-950/40 border-emerald-500/40 shadow-lg shadow-emerald-500/10 hover:scale-[1.02]'
        : 'bg-slate-100/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
    }`}>
      {unlocked && (
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
      )}

      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
          unlocked
            ? 'bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white'
            : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
        }`}>
          {unlocked ? <IconComponent className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{title}</h4>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
              {category}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {description}
          </p>

          <div className="mt-3 flex items-center gap-1.5">
            {unlocked ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 inline-flex items-center gap-1">
                ✓ Unlocked Badge
              </span>
            ) : (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                Locked Badge
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
