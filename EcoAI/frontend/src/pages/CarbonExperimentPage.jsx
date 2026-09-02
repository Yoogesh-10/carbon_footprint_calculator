import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Play, Trophy, Calendar, ArrowRight, Check, Award } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CarbonExperimentPage() {
  const { user } = useAuth();
  const [availableExps, setAvailableExps] = useState([
    { id: "exp_1", title: "No car for 7 days", description: "Switch all personal driving trips to public transport, biking, or walking for 1 week.", predicted_reduction_kg: 15.0, difficulty: "Medium" },
    { id: "exp_2", title: "Reduce AC usage for 7 days", description: "Set AC thermostat to 24°C and limit daily operation duration by 2 hours for 1 week.", predicted_reduction_kg: 8.0, difficulty: "Easy" },
    { id: "exp_3", title: "Use public transport for one week", description: "Swap private vehicle commute for bus or metro transit.", predicted_reduction_kg: 12.0, difficulty: "Medium" },
    { id: "exp_4", title: "Reduce food waste for one week", description: "Plan meals, store food properly, and compost organic scraps for 7 days.", predicted_reduction_kg: 6.0, difficulty: "Easy" }
  ]);

  const [activeExp, setActiveExp] = useState(null);
  const [actualInput, setActualInput] = useState(13.0);
  const [completeResult, setCompleteResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActive = async () => {
    setLoading(true);
    try {
      if (user) {
        const [availRes, actRes] = await Promise.all([
          api.getAvailableExperiments().catch(() => null),
          api.getActiveExperiment().catch(() => null)
        ]);

        if (availRes && availRes.experiments) setAvailableExps(availRes.experiments);
        if (actRes && actRes.has_active) setActiveExp(actRes.experiment);
      }
    } catch (err) {
      console.warn("Experiment fetch warning:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();
  }, [user]);

  const handleStartExperiment = async (exp) => {
    try {
      if (user) {
        const res = await api.startExperiment(exp.title, exp.predicted_reduction_kg);
        if (res) fetchActive();
      } else {
        setActiveExp({
          id: Date.now(),
          title: exp.title,
          duration_days: 7,
          days_passed: 1,
          predicted_reduction_kg: exp.predicted_reduction_kg,
          start_date: "Today",
          end_date: "7 days from today"
        });
      }
    } catch (err) {
      alert("Failed starting experiment.");
    }
  };

  const handleCompleteExperiment = async () => {
    try {
      const actualVal = parseFloat(actualInput) || 13.0;
      if (user && activeExp?.id) {
        const res = await api.completeExperiment(activeExp.id, actualVal);
        setCompleteResult(res);
        setActiveExp(null);
      } else {
        const pred = activeExp?.predicted_reduction_kg || 10.0;
        const diff = round1(actualVal - pred);
        setCompleteResult({
          status: "Experiment Completed!",
          predicted_reduction_kg: pred,
          actual_reduction_kg: actualVal,
          difference_kg: diff,
          feedback_message: diff > 0 
            ? "Your experiment achieved a higher reduction than predicted!" 
            : "Your experiment saved significant carbon close to target."
        });
        setActiveExp(null);
      }
    } catch (err) {
      alert("Failed completing experiment.");
    }
  };

  const round1 = (v) => Math.round(v * 10) / 10;

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
            Run a Carbon Experiment
          </h1>
          <p className="text-xs text-[#DDF7E9]/80 font-medium mt-1">
            Choose a 7-day real-world experiment to test AI prediction accuracy against your actual observed reductions.
          </p>
        </div>
      </div>

      {/* COMPLETED EXPERIMENT RESULT NOTIFICATION */}
      {completeResult && (
        <div className="p-6 rounded-3xl bg-[#DDF7E9]/60 dark:bg-[#16A66A]/20 border-2 border-[#16A66A] space-y-3 animate-fade-in shadow-lg">
          <div className="flex items-center gap-2 text-[#16A66A]">
            <Trophy className="w-6 h-6 text-[#F4C95D]" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{completeResult.status}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold pt-2">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase">AI Predicted Reduction</span>
              <span className="text-slate-800 dark:text-white text-base font-black">{completeResult.predicted_reduction_kg} kg CO₂e</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200">
              <span className="text-[#16A66A] block text-[10px] uppercase">Actual Observed Reduction</span>
              <span className="text-[#16A66A] text-base font-black">{completeResult.actual_reduction_kg} kg CO₂e</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200">
              <span className="text-[#F4C95D] block text-[10px] uppercase">Difference</span>
              <span className="text-[#F4C95D] text-base font-black">
                {completeResult.difference_kg > 0 ? `+${completeResult.difference_kg}` : completeResult.difference_kg} kg
              </span>
            </div>
          </div>

          <p className="text-xs font-extrabold text-[#123B2A] dark:text-[#DDF7E9] italic pt-1">
            🎉 "{completeResult.feedback_message}"
          </p>
        </div>
      )}

      {/* ACTIVE EXPERIMENT CARD */}
      {activeExp && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123B2A] border-2 border-[#F4C95D] space-y-6 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/10 pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F4C95D] text-[#123B2A] text-[10px] font-black uppercase">
                ACTIVE 7-DAY EXPERIMENT
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {activeExp.title}
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-400">Day {activeExp.days_passed} of 7</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase block">AI Predicted Reduction</span>
              <span className="text-xl font-black text-[#16A66A]">{activeExp.predicted_reduction_kg} kg CO₂e</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Enter Observed Reduction</span>
                <input
                  type="number"
                  value={actualInput}
                  onChange={(e) => setActualInput(e.target.value)}
                  className="w-24 p-1 text-base font-black text-[#16A66A] bg-transparent border-b border-[#16A66A]"
                />
                <span className="text-slate-500 ml-1">kg</span>
              </div>
              <button
                onClick={handleCompleteExperiment}
                className="px-5 py-2.5 rounded-xl bg-[#16A66A] text-white font-black hover:bg-emerald-600 shadow cursor-pointer transition"
              >
                Complete & Compare
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AVAILABLE EXPERIMENTS GRID */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Choose a 7-Day Carbon Experiment</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableExps.map((exp) => (
            <div key={exp.id} className="glass-card p-6 rounded-3xl bg-white dark:bg-[#123B2A] border border-[#16A66A]/30 space-y-4 shadow-md flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#16A66A]/15 text-[#16A66A]">
                    7-Day Experiment
                  </span>
                  <span className="text-xs font-bold text-slate-400">{exp.difficulty}</span>
                </div>

                <h4 className="text-base font-black text-slate-900 dark:text-white">{exp.title}</h4>
                <p className="text-xs text-slate-600 dark:text-[#DDF7E9]/80 font-medium">{exp.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex justify-between items-center">
                <div className="text-xs font-bold text-[#16A66A]">
                  AI Expected: <strong>-{exp.predicted_reduction_kg} kg CO₂e</strong>
                </div>

                <button
                  onClick={() => handleStartExperiment(exp)}
                  className="px-4 py-2 rounded-xl bg-[#123B2A] hover:bg-[#0B2A1D] text-white text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Play className="w-3.5 h-3.5 text-[#F4C95D]" /> Start Experiment
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
