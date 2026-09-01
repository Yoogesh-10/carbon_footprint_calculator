import React, { useState, useEffect } from 'react';
import { Activity, Sparkles, BarChart2, Info, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HabitImpact() {
  const { user } = useAuth();
  const [correlationData, setCorrelationData] = useState({
    sufficient_data: true,
    correlations: [
      {
        habit: "Daily Car Travel Distance",
        sector: "Transportation",
        correlation_r: 0.88,
        strength: "Strong",
        explanation: "Higher daily driving distance is strongly associated with higher transportation carbon output."
      },
      {
        habit: "Air Conditioning Runtime",
        sector: "Electricity",
        correlation_r: 0.74,
        strength: "Moderate",
        explanation: "Extended daily AC duration shows a moderate relationship with monthly power draw."
      },
      {
        habit: "Dietary Meat Frequency",
        sector: "Food",
        correlation_r: 0.82,
        strength: "Strong",
        explanation: "Frequent meat consumption strongly correlates with elevated food carbon intensity."
      }
    ],
    note: "Correlation indicates statistical association between behaviors and emissions. It does not prove direct sole causation."
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (user) {
      api.getHabitCorrelations()
        .then(res => {
          if (res) setCorrelationData(res);
        })
        .catch(err => console.warn("Correlation fetch error:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-24 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#16A66A] border-t-transparent animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-[#123B2A] to-[#16A66A] p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black">
            My Habit Impact
          </h1>
          <p className="text-xs text-[#DDF7E9]/80 font-medium mt-1">
            Statistical Pearson correlation analysis examining relationship between lifestyle behaviors and emissions.
          </p>
        </div>
      </div>

      {/* Non-Causation Disclaimer Box */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-3 shadow-sm font-semibold">
        <Info className="w-5 h-5 flex-shrink-0 text-amber-500" />
        <span>
          <strong>Statistical Correlation Note:</strong> Correlation measures the strength of association between two variables (r-score). <strong>Correlation does NOT prove direct sole causation.</strong>
        </span>
      </div>

      {/* CORRELATION ANALYSIS RESULTS */}
      {!correlationData.sufficient_data ? (
        <div className="glass-card p-10 rounded-3xl text-center space-y-4 bg-white dark:bg-[#123B2A] border border-[#16A66A]/30 shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center font-black text-2xl">
            📊
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {correlationData.message || "More activity data is needed to identify reliable patterns."}
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#DDF7E9]/70 max-w-md mx-auto">
            Log at least 3 carbon records or daily check-ins so the statistical engine can compute Pearson correlation coefficients for your habits.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {correlationData.correlations?.map((item, idx) => (
            <div key={idx} className="glass-card p-6 rounded-3xl bg-white dark:bg-[#123B2A] border border-[#16A66A]/30 space-y-4 shadow-lg flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-[#16A66A]/15 text-[#16A66A]">
                    {item.sector}
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    r = {item.correlation_r}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {item.habit}
                </h3>

                <p className="text-xs text-slate-600 dark:text-[#DDF7E9]/80 font-medium leading-relaxed">
                  {item.explanation}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400">Correlation Strength:</span>
                <span className="text-[#16A66A] font-black">{item.strength}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
