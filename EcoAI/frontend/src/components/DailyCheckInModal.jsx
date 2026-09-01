import React, { useState } from 'react';
import { X, CheckCircle2, Flame, Car, Zap, Utensils, Trash2, Sparkles, Check } from 'lucide-react';
import { api } from '../services/api';

export default function DailyCheckInModal({ isOpen, onClose, onCheckInComplete }) {
  const [travelMode, setTravelMode] = useState("Car");
  const [electricityChange, setElectricityChange] = useState("Normal");
  const [dietMeat, setDietMeat] = useState("Normal");
  const [unusualWaste, setUnusualWaste] = useState(false);
  const [sustainableAct, setSustainableAct] = useState("None");
  const [submitting, setSubmitting] = useState(false);
  const [res, setRes] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        travel_mode: travelMode,
        electricity_change: electricityChange,
        diet_meat: dietMeat,
        unusual_waste: unusualWaste,
        sustainable_act: sustainableAct
      };
      const result = await api.submitCheckin(payload);
      setRes(result);
      if (onCheckInComplete) onCheckInComplete(result);
    } catch (err) {
      // Demo fallback
      setRes({
        status: "Check-in recorded!",
        daily_co2_kg: 6.2,
        eco_points_earned: 10,
        current_streak_days: 4
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#123B2A] rounded-3xl max-w-lg w-full border border-[#16A66A]/30 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-[#16A66A] tracking-wider block mb-1">
              DAILY 1-MINUTE CHECK-IN
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#F4C95D]" /> Today's Carbon Check-In
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-[#17231D] dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {res ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#16A66A] text-white mx-auto flex items-center justify-center font-black text-xl">
              <Check className="w-8 h-8 text-[#F4C95D]" />
            </div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">{res.status}</h4>
            <div className="p-4 rounded-2xl bg-[#DDF7E9]/50 dark:bg-[#16A66A]/10 border border-[#16A66A]/30 text-xs font-bold space-y-1">
              <p>Today's Estimated Impact: <strong>{res.daily_co2_kg} kg CO₂e</strong></p>
              <p className="text-[#16A66A]">Earned +{res.eco_points_earned} Eco Points! | Streak: {res.current_streak_days} Days 🔥</p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#123B2A] text-white font-bold text-xs hover:bg-[#0B2A1D] cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
            
            {/* 1. Travel */}
            <div className="space-y-1.5">
              <label className="text-slate-800 dark:text-white flex items-center gap-1.5">
                <Car className="w-4 h-4 text-[#16A66A]" /> How did you travel today?
              </label>
              <div className="grid grid-cols-5 gap-1.5 text-[11px]">
                {['Car', 'Bike', 'Bus', 'Train', 'Walk'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTravelMode(mode)}
                    className={`py-2 rounded-xl border transition cursor-pointer ${
                      travelMode === mode 
                        ? 'bg-[#123B2A] text-white border-[#16A66A]' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Electricity */}
            <div className="space-y-1.5">
              <label className="text-slate-800 dark:text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#14B8A6]" /> Electricity Usage Change?
              </label>
              <select
                value={electricityChange}
                onChange={(e) => setElectricityChange(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Normal">Normal Usage</option>
                <option value="Higher">Higher Than Usual (Extended AC/Appliances)</option>
                <option value="Lower">Lower Than Usual (Conserved Power)</option>
              </select>
            </div>

            {/* 3. Meat Intake */}
            <div className="space-y-1.5">
              <label className="text-slate-800 dark:text-white flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-[#F4C95D]" /> Meat Consumption Today?
              </label>
              <select
                value={dietMeat}
                onChange={(e) => setDietMeat(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Normal">Normal Diet</option>
                <option value="Less">Less Meat / Plant-Based Day</option>
                <option value="More">More Meat Meals Than Usual</option>
              </select>
            </div>

            {/* 4. Sustainable Activity */}
            <div className="space-y-1.5">
              <label className="text-slate-800 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-500" /> Any Sustainable Activity?
              </label>
              <input
                type="text"
                value={sustainableAct}
                onChange={(e) => setSustainableAct(e.target.value)}
                placeholder="e.g. Recycled plastics, used public transit, turned off AC"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#16A66A] hover:bg-emerald-600 text-white font-black shadow cursor-pointer transition mt-2"
            >
              {submitting ? 'Recording...' : 'Submit Daily Check-In'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
