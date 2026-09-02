import React from 'react';
import { ArrowRight, Cpu, Sparkles, Shield, BarChart3, Award, FileText, Zap, Leaf, CheckCircle2, TrendingDown, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage({ setActiveTab }) {
  const { user } = useAuth();

  return (
    <div className="space-y-20 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#123B2A] via-[#0B2A1D] to-[#123B2A] text-white p-8 sm:p-12 lg:p-16 shadow-xl border border-[#16A66A]/30">
        
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#F4C95D] text-xs sm:text-sm font-extrabold shadow-sm">
            <Sparkles className="w-4 h-4 text-[#F4C95D]" />
            <span>AI-POWERED IPCC EMISSION MODELING & PREDICTIONS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
            Know Your Carbon. <br className="hidden sm:inline" />
            <span className="text-[#F4C95D]">Predict Your Future.</span> <br className="hidden sm:inline" />
            Reduce Your Impact.
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
            EcoAI leverages Machine Learning algorithms to analyze your lifestyle, forecast next month's carbon footprint, and deliver personalized action plans to reduce your environmental impact.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {/* Primary Button: Always Sign In to Calculate Footprint -> goes directly to auth page */}
            <button
              onClick={() => setActiveTab('auth')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-extrabold bg-[#16A66A] hover:bg-[#128856] text-white shadow-lg shadow-[#16A66A]/30 flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              Sign In to Calculate Footprint
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('auth')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition cursor-pointer"
            >
              Sign In / Register
            </button>
          </div>

          {/* Quick Metrics Bar (High Contrast Cards) */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <p className="text-3xl font-black text-[#F4C95D]">94%</p>
              <p className="text-xs text-slate-200 font-bold mt-1">Prediction Accuracy</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <p className="text-3xl font-black text-white">5 Modules</p>
              <p className="text-xs text-slate-200 font-bold mt-1">IPCC Standard Factors</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <p className="text-3xl font-black text-[#14B8A6]">-22% CO₂</p>
              <p className="text-xs text-slate-200 font-bold mt-1">Avg Monthly Reduction</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <p className="text-3xl font-black text-[#F4C95D]">Real-Time</p>
              <p className="text-xs text-slate-200 font-bold mt-1">AI Recommendation Engine</p>
            </div>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="space-y-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-block px-3 py-1 rounded-full bg-[#16A66A]/10 text-[#16A66A] dark:text-[#34D399] text-xs font-black uppercase tracking-wider mb-2">
            Seamless 4-Step Process
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            How EcoAI Intelligence Works
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 font-medium">
            From raw lifestyle inputs to predictive ML recommendations in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Input Daily Habits",
              desc: "Enter details for transportation, electricity, food diet, waste output, and household lifestyle.",
              icon: Zap
            },
            {
              step: "02",
              title: "IPCC Calculation",
              desc: "Our engine computes exact monthly carbon footprint in kg CO₂e using global IPCC emission standards.",
              icon: BarChart3
            },
            {
              step: "03",
              title: "AI Forecast",
              desc: "Scikit-learn ML models forecast next month's emissions and pinpoint top emission sources.",
              icon: Cpu
            },
            {
              step: "04",
              title: "Smart Reduction",
              desc: "Receive tailored action cards, monitor progress metrics, and export professional PDF reports.",
              icon: Award
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative hover-lift">
                <div className="text-3xl font-black text-slate-300 dark:text-slate-600 absolute top-4 right-5">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#16A66A] dark:text-[#34D399] flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-800">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI MACHINE LEARNING SECTION (HIGH CONTRAST DARK FOREST CONTAINER) */}
      <section>
        <div className="rounded-3xl bg-[#123B2A] text-white p-8 sm:p-12 border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* Left Content */}
            <div className="space-y-6">
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-[#16A66A]/20 text-[#34D399] text-xs font-black border border-[#16A66A]/40">
                Powered by Scikit-learn Machine Learning
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Predictive Intelligence for Sustainable Living
              </h3>
              <p className="text-slate-200 text-sm leading-relaxed font-medium">
                Traditional calculators only tell you where you stood in the past. EcoAI trained regression ensembles project your future trajectory, alerting you before your carbon score degrades.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "RandomForestRegressor time-series prediction modeling",
                  "Automated identification of dominant emission drivers",
                  "Dynamic score scaling (0-100 Carbon Score Index)",
                  "Customized recommendation prioritization matrix"
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-white font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Cards (High Contrast Dark Slate/Emerald Elements) */}
            <div className="space-y-4">
              
              {/* Forecast Card */}
              <div className="p-6 rounded-2xl bg-[#0B2A1D] border border-[#16A66A]/40 shadow-lg space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-200 font-bold uppercase tracking-wider">AI Model Forecast</span>
                  <span className="text-[#F4C95D] font-extrabold bg-[#F4C95D]/10 px-2.5 py-1 rounded-md border border-[#F4C95D]/30">High Confidence (94%)</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-base font-extrabold text-white">
                    <span>Predicted Next Month</span>
                    <span className="text-[#34D399]">248.5 kg CO₂e</span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
                    <div className="h-full bg-gradient-to-r from-[#16A66A] to-[#34D399] rounded-full w-[65%]" />
                  </div>
                </div>
                <p className="text-xs text-slate-300 italic font-medium">
                  Identified Primary Driver: Electricity (120 kWh grid draw + 3.5 hrs AC)
                </p>
              </div>

              {/* Action Recommendation Card */}
              <div className="p-6 rounded-2xl bg-[#16A66A]/25 border border-[#16A66A] space-y-2 shadow-lg">
                <h4 className="text-xs font-black text-[#F4C95D] uppercase tracking-wider">Top Recommended AI Action</h4>
                <p className="text-base font-extrabold text-white">Upgrade to Inverter AC & Set Thermostat to 24°C</p>
                <p className="text-xs font-bold text-[#DDF7E9]">Potential Reduction: -60.0 kg CO₂ / month</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="space-y-10">
        <div className="text-center max-w-3xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Why Choose EcoAI Platform?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 font-medium">
            Built for non-technical users seeking actionable clarity and precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 hover-lift">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#16A66A] dark:text-[#34D399] flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <TrendingDown className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">Data-Driven Precision</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              No generic estimates. Calculations mirror official IPCC standards for fuel, grid energy, and dietary factors.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 hover-lift">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#16A66A] dark:text-[#34D399] flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">AI-Powered Insights</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Advanced machine learning forecast models predict emission trajectories and deliver prioritized reduction cards.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 hover-lift">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#16A66A] dark:text-[#34D399] flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">Exportable PDF Reports</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Generate comprehensive PDF summary reports containing user profiles, metrics, predictions, and recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] dark:from-[#0B2A1D] dark:to-[#123B2A] border border-[#16A66A]/30 space-y-6 shadow-md">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-[#123B2A] dark:text-white tracking-tight">
            Ready to Take Control of Your Environmental Impact?
          </h3>
          <p className="text-slate-700 dark:text-slate-200 text-base max-w-xl mx-auto font-medium">
            It takes less than 2 minutes to complete your carbon footprint profile and unlock AI predictions.
          </p>
          <div>
            <button
              onClick={() => setActiveTab('auth')}
              className="px-8 py-4 rounded-2xl text-base font-extrabold bg-[#123B2A] hover:bg-[#0B2A1D] text-white shadow-xl transition cursor-pointer"
            >
              Sign In to Calculate Footprint
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
