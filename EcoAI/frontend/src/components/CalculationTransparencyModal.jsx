import React, { useState, useEffect } from 'react';
import { X, Calculator, HelpCircle, CheckCircle2, Info } from 'lucide-react';
import { api } from '../services/api';

export default function CalculationTransparencyModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getTransparencyBreakdown()
        .then(res => setData(res))
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#123B2A] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#16A66A]/30 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-[#16A66A] tracking-wider block mb-1">
              CALCULATION TRANSPARENCY
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-6 h-6 text-[#16A66A]" /> How Was This Calculated?
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#DDF7E9]/70">
              Clear breakdown of your inputs, formulas, and IPCC emission benchmark factors.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-10 h-10 rounded-full border-4 border-[#16A66A] border-t-transparent animate-spin mx-auto" />
          </div>
        ) : data && data.has_data ? (
          <div className="space-y-4 text-xs font-bold">
            <div className="p-4 rounded-2xl bg-[#DDF7E9]/50 dark:bg-[#16A66A]/10 border border-[#16A66A]/30 flex justify-between items-center">
              <span>Total Monthly Footprint:</span>
              <span className="text-xl font-black text-[#16A66A]">{data.total_co2_kg} kg CO₂e</span>
            </div>

            <div className="space-y-3">
              {data.categories && Object.entries(data.categories).map(([cat, item]) => (
                <div key={cat} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-sm font-black text-[#123B2A] dark:text-white">
                    <span>{cat}</span>
                    <span className="text-[#16A66A]">{item.calculated_co2_kg} kg CO₂e</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600 dark:text-[#DDF7E9]/80">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Input Data</span>
                      <span>{item.input}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Emission Factor</span>
                      <span>{item.emission_factor}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-500 font-mono">
                    Formula: {item.formula}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs font-bold text-slate-500 py-8 text-center">
            No carbon footprint recorded yet. Complete the calculator to view formulas.
          </p>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#123B2A] text-white font-bold text-xs hover:bg-[#0B2A1D] cursor-pointer"
          >
            Close Transparency View
          </button>
        </div>

      </div>
    </div>
  );
}
