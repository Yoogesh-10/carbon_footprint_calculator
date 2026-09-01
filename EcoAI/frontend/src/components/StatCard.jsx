import React from 'react';

export default function StatCard({ title, value, unit, subtitle, icon: Icon, trend, color = "emerald" }) {
  const colorMap = {
    emerald: "border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-slate-800",
    cyan: "border-teal-200 dark:border-teal-800/60 bg-white dark:bg-slate-800",
    amber: "border-amber-200 dark:border-amber-800/60 bg-white dark:bg-slate-800",
    purple: "border-purple-200 dark:border-purple-800/60 bg-white dark:bg-slate-800"
  };

  const iconBgMap = {
    emerald: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
    cyan: "bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800",
    amber: "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
    purple: "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
  };

  return (
    <div className={`p-5 rounded-2xl ${colorMap[color]} border shadow-sm flex flex-col justify-between hover-lift`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {value}
            </span>
            {unit && <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{unit}</span>}
          </div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${iconBgMap[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-700">
        <span className="text-slate-600 dark:text-slate-300 font-medium">{subtitle}</span>
        {trend && (
          <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
            trend.startsWith('-') || trend.includes('Dec') || trend.includes('Good') || trend.includes('Improved')
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
          }`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
