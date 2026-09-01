import React, { useState, useEffect } from 'react';
import { Sliders, RotateCcw, Sparkles, Car, Zap, Utensils, Trash2, Info, CheckCircle2, Cpu, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CarbonTwin({ setActiveTab }) {
  const { user } = useAuth();
  const [baseline, setBaseline] = useState({
    daily_distance: 20,
    transport_type: "Petrol Car",
    monthly_electricity: 200,
    ac_usage_hours: 4.0,
    diet_type: "Non-vegetarian",
    recycling_habit: "Sometimes",
    total_footprint: 186.0,
    breakdown: { Transportation: 96.0, Electricity: 45.0, Food: 30.0, Waste: 15.0, Lifestyle: 0.0 }
  });

  const [twinState, setTwinState] = useState({
    daily_distance: 10,
    transport_type: "Petrol Car",
    monthly_electricity: 160,
    ac_usage_hours: 2.5,
    diet_type: "Vegetarian",
    recycling_habit: "Always"
  });

  const [result, setResult] = useState({
    current_emission: 186.0,
    simulated_emission: 164.0,
    potential_reduction: 22.0,
    reduction_percentage: 11.8,
    percentages: { Transportation: 52.0, Electricity: 24.0, Food: 16.0, Waste: 8.0 }
  });

  const [loading, setLoading] = useState(false);

  const fetchTwinBaseline = async () => {
    setLoading(true);
    try {
      if (user) {
        const data = await api.getSimulatorBaseline();
        if (data) {
          const baseVals = {
            daily_distance: data.daily_distance || 20,
            transport_type: data.transport_type || "Petrol Car",
            monthly_electricity: data.monthly_electricity || 200,
            ac_usage_hours: data.ac_usage_hours || 4.0,
            diet_type: data.diet_type || "Non-vegetarian",
            recycling_habit: data.recycling_habit || "Sometimes",
            total_footprint: data.total_footprint || 186.0,
            breakdown: { Transportation: 96.0, Electricity: 45.0, Food: 30.0, Waste: 15.0, Lifestyle: 0.0 }
          };
          setBaseline(baseVals);
          runTwinSim(baseVals);
        }
      }
    } catch (err) {
      console.warn("Twin baseline load warning:", err);
    } finally {
      setLoading(false);
    }
  };

  const runTwinSim = async (stateToSim) => {
    try {
      const res = await api.runSimulation(stateToSim);
      if (res) {
        const total = res.simulated_emission || 164.0;
        const b = res.simulated_breakdown || { Transportation: 80, Electricity: 45, Food: 25, Waste: 14 };
        const bSum = sumValues(b) || 1.0;
        const p = {
          Transportation: round1((b.Transportation / bSum) * 100),
          Electricity: round1((b.Electricity / bSum) * 100),
          Food: round1((b.Food / bSum) * 100),
          Waste: round1((b.Waste / bSum) * 100)
        };
        setResult({
          current_emission: res.current_emission,
          simulated_emission: res.simulated_emission,
          potential_reduction: res.potential_reduction,
          reduction_percentage: res.reduction_percentage,
          percentages: p
        });
      }
    } catch (err) {
      // Fallback
    }
  };

  const sumValues = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);
  const round1 = (v) => Math.round(v * 10) / 10;

  useEffect(() => {
    fetchTwinBaseline();
  }, [user]);

  const handleSliderChange = (field, val) => {
    const nextTwin = { ...twinState, [field]: val };
    setTwinState(nextTwin);
    runTwinSim(nextTwin);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-[#123B2A] to-[#16A66A] p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black text-[#F4C95D] bg-white/10 px-3 py-1 rounded-full mb-1">
            <Cpu className="w-3.5 h-3.5" /> FEATURE 4 — PERSONAL CARBON DIGITAL TWIN
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Your Carbon Digital Twin
          </h1>
          <p className="text-xs text-[#DDF7E9]/80 font-medium mt-1">
            Interactive virtual representation of your lifestyle. Modify virtual variables for instant preview.
          </p>
        </div>

        <button
          onClick={() => {
            setTwinState({
              daily_distance: baseline.daily_distance,
              transport_type: baseline.transport_type,
              monthly_electricity: baseline.monthly_electricity,
              ac_usage_hours: baseline.ac_usage_hours,
              diet_type: baseline.diet_type,
              recycling_habit: baseline.recycling_habit
            });
            runTwinSim(baseline);
          }}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 cursor-pointer flex items-center gap-2 transition"
        >
          <RotateCcw className="w-4 h-4 text-[#F4C95D]" /> Reset Digital Twin
        </button>
      </div>

      {/* Non-Mutating Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-800 dark:text-cyan-200 text-xs flex items-center gap-3 shadow-sm">
        <Info className="w-5 h-5 flex-shrink-0 text-cyan-500" />
        <span>
          <strong>Simulation Environment:</strong> The Carbon Twin runs entirely in a sandbox. Modifying virtual lifestyle parameters <strong>does NOT change your real carbon footprint history</strong>.
        </span>
      </div>

      {/* DIGITAL TWIN DISPLAY & VIRTUAL SLIDERS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Visual Carbon Twin Breakdown (5 cols) */}
        <div className="lg:col-span-5 glass-card p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123B2A] border border-[#16A66A]/30 space-y-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/10 pb-3">
              <h2 className="text-lg font-black text-[#17231D] dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#16A66A]" /> YOUR CARBON TWIN
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#16A66A]/10 text-[#16A66A] text-[10px] font-black uppercase">
                Virtual Sandbox
              </span>
            </div>

            {/* Simulated vs Current Comparison Box */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#DDF7E9]/40 dark:bg-[#16A66A]/10 border border-[#16A66A]/30 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Current</span>
                <span className="text-lg font-black text-slate-800 dark:text-white">{result.current_emission} kg</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#16A66A] uppercase block">Simulated</span>
                <span className="text-lg font-black text-[#16A66A]">{result.simulated_emission} kg</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#F4C95D] uppercase block">Reduction</span>
                <span className="text-lg font-black text-[#F4C95D]">-{result.potential_reduction} kg</span>
              </div>
            </div>

            {/* Category % Distribution */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Lifestyle Sector Distribution</h3>
              
              {Object.entries(result.percentages).map(([sec, pct]) => (
                <div key={sec} className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <div className="flex justify-between text-xs font-extrabold text-[#17231D] dark:text-white">
                    <span>{sec}</span>
                    <span className="text-[#16A66A]">{pct}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[#123B2A] to-[#16A66A]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-xs text-slate-600 dark:text-[#DDF7E9]/80 font-medium mt-4">
            💡 <strong>Estimated Savings:</strong> Moving sliders immediately reflects your twin's virtual footprint reduction of <strong>{result.reduction_percentage}%</strong>.
          </div>
        </div>

        {/* Right Column: Virtual Lifestyle Sliders (7 cols) */}
        <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123B2A] border border-[#16A66A]/30 space-y-6 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/10 pb-3">
            <h3 className="text-lg font-black text-[#17231D] dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#16A66A]" /> Virtual Lifestyle Parameters
            </h3>
            <span className="text-xs text-slate-400 font-bold">Sandbox Controls</span>
          </div>

          <div className="space-y-6 text-xs font-bold">
            
            {/* 1. Daily Car Travel Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-slate-800 dark:text-white">
                <span className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#16A66A]" /> Daily Car Travel Distance
                </span>
                <span className="text-[#16A66A] font-black">{twinState.daily_distance} km / day</span>
              </div>
              <input 
                type="range"
                min="0"
                max="80"
                step="1"
                value={twinState.daily_distance}
                onChange={(e) => handleSliderChange('daily_distance', parseFloat(e.target.value))}
                className="w-full accent-[#16A66A] h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 km (No Driving)</span>
                <span>40 km</span>
                <span>80 km</span>
              </div>
            </div>

            {/* 2. Monthly Electricity */}
            <div className="space-y-2">
              <div className="flex justify-between text-slate-800 dark:text-white">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#14B8A6]" /> Monthly Electricity Consumption
                </span>
                <span className="text-[#14B8A6] font-black">{twinState.monthly_electricity} kWh / mo</span>
              </div>
              <input 
                type="range"
                min="50"
                max="500"
                step="10"
                value={twinState.monthly_electricity}
                onChange={(e) => handleSliderChange('monthly_electricity', parseFloat(e.target.value))}
                className="w-full accent-[#14B8A6] h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* 3. Daily AC Hours */}
            <div className="space-y-2">
              <div className="flex justify-between text-slate-800 dark:text-white">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-500" /> AC Runtime Duration
                </span>
                <span className="text-cyan-500 font-black">{twinState.ac_usage_hours} hrs / day</span>
              </div>
              <input 
                type="range"
                min="0"
                max="14"
                step="0.5"
                value={twinState.ac_usage_hours}
                onChange={(e) => handleSliderChange('ac_usage_hours', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* 4. Diet Preference */}
            <div className="space-y-2">
              <label className="text-slate-800 dark:text-white flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#F4C95D]" /> Dietary Preference
              </label>
              <select
                value={twinState.diet_type}
                onChange={(e) => handleSliderChange('diet_type', e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#16A66A]"
              >
                <option value="Non-vegetarian">Non-vegetarian (Daily meat)</option>
                <option value="Vegetarian">Vegetarian (Dairy & plant-based)</option>
                <option value="Vegan">Vegan (100% plant-based)</option>
              </select>
            </div>

            {/* 5. Recycling Habit */}
            <div className="space-y-2">
              <label className="text-slate-800 dark:text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-purple-500" /> Recycling Habit
              </label>
              <select
                value={twinState.recycling_habit}
                onChange={(e) => handleSliderChange('recycling_habit', e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#16A66A]"
              >
                <option value="Never">Never (Mixed trash)</option>
                <option value="Sometimes">Sometimes (Occasional recycling)</option>
                <option value="Always">Always (100% segregation)</option>
              </select>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
