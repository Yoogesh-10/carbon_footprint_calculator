import React, { useState, useEffect } from 'react';
import { Sliders, Car, Zap, Clock, DollarSign, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TradeoffAnalyzer() {
  const { user } = useAuth();
  const [distanceKm, setDistanceKm] = useState(10);
  const [priority, setPriority] = useState("Balanced");
  const [analysis, setAnalysis] = useState({
    distance_km: 10.0,
    priority: "Balanced",
    options: [
      { option: "Car", carbon: "High", co2_kg: 1.92, cost: "High", cost_usd: 4.50, time: "Low", mins: 18 },
      { option: "Bus", carbon: "Low", co2_kg: 0.41, cost: "Low", cost_usd: 2.25, time: "Medium", mins: 28 },
      { option: "Train / Metro", carbon: "Very Low", co2_kg: 0.25, cost: "Low", cost_usd: 2.50, time: "Low", mins: 15 },
      { option: "Bike", carbon: "Zero", co2_kg: 0.0, cost: "Free", cost_usd: 0.0, time: "Medium", mins: 35 },
      { option: "Walk", carbon: "Zero", co2_kg: 0.0, cost: "Free", cost_usd: 0.0, time: "High", mins: 120 }
    ],
    lowest_carbon_option: "Walk / Bike",
    recommended_option: "Bus or Train",
    recommendation_reason: "Provides the optimal balance of low carbon output, low cost, and fast travel time."
  });

  const [loading, setLoading] = useState(false);

  const fetchTradeoff = async (dist, prio) => {
    setLoading(true);
    try {
      if (user) {
        const res = await api.analyzeTradeoff(parseFloat(dist), prio);
        if (res) setAnalysis(res);
      } else {
        const d = parseFloat(dist) || 10;
        let rec = "Bus or Train";
        let r = "Provides the optimal balance of low carbon output, low cost, and fast travel time.";
        if (prio === 'Carbon') { rec = "Walk / Bike"; r = "Selected as zero-emission choices producing 0 kg CO₂e."; }
        else if (prio === 'Cost') { rec = "Walk / Bike"; r = "Selected as zero-cost options."; }
        else if (prio === 'Time') { rec = "Train / Metro"; r = "Selected as fastest transit mode avoiding traffic."; }

        setAnalysis({
          distance_km: d,
          priority: prio,
          options: [
            { option: "Car", carbon: "High", co2_kg: round2(d * 0.192), cost: "High", cost_usd: round2(d * 0.45), time: "Low", mins: int(d * 1.8) },
            { option: "Bus", carbon: "Low", co2_kg: round2(d * 0.041), cost: "Low", cost_usd: 2.25, time: "Medium", mins: int(d * 2.8) },
            { option: "Train / Metro", carbon: "Very Low", co2_kg: round2(d * 0.025), cost: "Low", cost_usd: 2.50, time: "Low", mins: int(d * 1.5) },
            { option: "Bike", carbon: "Zero", co2_kg: 0.0, cost: "Free", cost_usd: 0.0, time: "Medium", mins: int(d * 3.5) },
            { option: "Walk", carbon: "Zero", co2_kg: 0.0, cost: "Free", cost_usd: 0.0, time: "High", mins: int(d * 12.0) }
          ],
          lowest_carbon_option: "Walk / Bike",
          recommended_option: rec,
          recommendation_reason: r
        });
      }
    } catch (err) {
      console.warn("Tradeoff error:", err);
    } finally {
      setLoading(false);
    }
  };

  const round2 = (v) => Math.round(v * 100) / 100;
  const int = (v) => Math.round(v);

  useEffect(() => {
    fetchTradeoff(distanceKm, priority);
  }, [distanceKm, priority]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-[#123B2A] to-[#16A66A] p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black">
            Compare Your Travel Choices
          </h1>
          <p className="text-xs text-[#DDF7E9]/80 font-medium mt-1">
            Multi-modal travel trade-off matrix evaluating Carbon, Cost, and Travel Time across transit choices.
          </p>
        </div>
      </div>

      {/* INPUT CONTROLS */}
      <div className="glass-card p-6 rounded-3xl bg-white dark:bg-[#123B2A] border border-[#16A66A]/30 flex flex-wrap items-center justify-between gap-6 shadow-md text-xs font-bold">
        <div className="flex items-center gap-3">
          <label className="text-slate-800 dark:text-white">Trip Distance:</label>
          <input
            type="number"
            min="1"
            max="200"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white w-24 font-black"
          />
          <span className="text-slate-500">km</span>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-slate-800 dark:text-white">Prioritize By:</label>
          <div className="flex flex-wrap gap-1.5">
            {['Carbon', 'Cost', 'Time', 'Balanced'].map(p => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`px-4 py-2 rounded-xl border transition cursor-pointer ${
                  priority === p 
                    ? 'bg-[#123B2A] text-white border-[#16A66A]' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI RECOMMENDATION BOX */}
      <div className="p-6 rounded-3xl bg-[#DDF7E9]/50 dark:bg-white/5 border-2 border-[#16A66A] space-y-2 shadow-lg">
        <div className="flex items-center gap-2 text-[#16A66A]">
          <Sparkles className="w-5 h-5 text-[#F4C95D]" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Recommended Choice ({priority} Priority): <span className="text-[#16A66A]">{analysis.recommended_option}</span>
          </h3>
        </div>
        <p className="text-xs text-slate-700 dark:text-[#DDF7E9] font-bold">
          "{analysis.recommendation_reason}"
        </p>
      </div>

      {/* COMPARISON TABLE */}
      <div className="glass-card p-6 rounded-3xl bg-white dark:bg-[#123B2A] border border-[#16A66A]/30 space-y-4 shadow-md">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Multi-Modal Trade-off Comparison Matrix</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase font-black tracking-wider">
              <tr>
                <th className="p-3">Option</th>
                <th className="p-3">Carbon Output</th>
                <th className="p-3">Estimated Cost</th>
                <th className="p-3">Travel Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-bold">
              {analysis.options?.map((opt, i) => (
                <tr key={i} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${
                  analysis.recommended_option.includes(opt.option) ? 'bg-[#DDF7E9]/30 dark:bg-[#16A66A]/10' : ''
                }`}>
                  <td className="p-3 font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    {opt.option}
                    {analysis.recommended_option.includes(opt.option) && (
                      <span className="px-2 py-0.5 rounded bg-[#16A66A] text-white text-[9px] font-black uppercase">Recommended</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={opt.carbon === 'High' ? 'text-rose-500' : 'text-[#16A66A]'}>
                      {opt.carbon} ({opt.co2_kg} kg CO₂e)
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    {opt.cost} (${opt.cost_usd})
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    {opt.time} (~{opt.mins} mins)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
