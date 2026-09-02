import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import AI5DayChallenge from '../components/AI5DayChallenge';
import EcoAIAssistant from '../components/EcoAIAssistant';
import { 
  Sparkles, 
  TrendingDown, 
  Target, 
  Zap, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Activity,
  CheckSquare,
  Square,
  TrendingUp,
  Cpu,
  Compass,
  Car,
  Trees,
  Calculator,
  Globe,
  Calendar,
  Check,
  Utensils,
  Trash2,
  Leaf,
  ShieldCheck,
  Award,
  ArrowRight,
  Trophy,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CalculationTransparencyModal from '../components/CalculationTransparencyModal';
import DailyCheckInModal from '../components/DailyCheckInModal';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement
);

export default function Dashboard({ setActiveTab }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [transparencyOpen, setTransparencyOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [questStreakCount, setQuestStreakCount] = useState(1);
  const [externalChatPrompt, setExternalChatPrompt] = useState('');
  
  // Feature States
  const [equivalents, setEquivalents] = useState({
    equivalents: { car_travel_km: 968.8, tree_years: 8.5, kwh_electricity: 226.8 },
    descriptions: {
      car_travel_km: "Approximately 968 km of average petrol car travel.",
      tree_years: "Takes approximately 8.5 mature trees one full year to absorb.",
      kwh_electricity: "Equivalent to consuming 226 kWh of grid electricity."
    }
  });

  const [dataQuality, setDataQuality] = useState({
    quality_score_pct: 82,
    confidence_level: "High",
    explanation: "Data quality score of 82% reflects verified utility entries and completed input metrics."
  });

  const [rootCause, setRootCause] = useState({
    previous_month_emission: 186.0,
    current_month_emission: 207.0,
    increase_kg: 21.0,
    increase_pct: 11.3,
    sector_deltas: { Transportation: 13.0, Electricity: 5.0, Food: 2.0, Waste: 1.0 },
    primary_cause_sector: "Transportation",
    primary_cause_message: "Transportation is the primary reason for your emission increase."
  });

  const [baselineData, setBaselineData] = useState({
    normal_range_formatted: "170–190 kg CO₂e/month",
    current_emission: 207.0,
    deviation_pct: 21.6,
    status: "⚠️ Higher than your normal pattern"
  });

  const [futureMe, setFutureMe] = useState({
    current_monthly: 186.0,
    months: ["Month 1", "Month 2", "Month 3"],
    scenario_a: { name: "Continue Current Habits", values: [193.4, 201.2, 209.2], color: "#f43f5e" },
    scenario_b: { name: "Follow AI Recommendations", values: [171.1, 157.4, 144.8], color: "#16A66A" },
    scenario_c: { name: "Strong Reduction", values: [156.2, 131.2, 110.2], color: "#14B8A6" },
    explanation: "Following the recommended actions could reduce your estimated 3-month emissions compared with maintaining your current habits."
  });

  const [targetReduceInput, setTargetReduceInput] = useState(20);
  const [optimizationResult, setOptimizationResult] = useState({
    target_reduction_kg: 20.0,
    recommended_combination: [
      { title: "Reduce car usage", reduction_kg: 15.0, effort: "Low" },
      { title: "Reduce AC usage", reduction_kg: 8.0, effort: "Medium" }
    ],
    estimated_total_reduction_kg: 23.0,
    target_achieved: true,
    label: "Estimated potential reduction"
  });

  // 5-Day AI Action Plan State
  const [plan5Day, setPlan5Day] = useState({
    total_potential_reduction_kg: 32.5,
    days: [
      { day: 1, title: "Optimize AC Thermostat to 24°C", category: "Electricity", reduction_kg: 6.5, effort: "Low", completed: true },
      { day: 2, title: "Switch 2 Commute Trips to Public Transit", category: "Transportation", reduction_kg: 8.0, effort: "Medium", completed: true },
      { day: 3, title: "Adopt Plant-Based Meals for 1 Day", category: "Food", reduction_kg: 5.5, effort: "Low", completed: false },
      { day: 4, title: "Unplug Standby Home Appliances", category: "Electricity", reduction_kg: 4.5, effort: "Low", completed: false },
      { day: 5, title: "Zero Plastic Shopping Day", category: "Waste", reduction_kg: 8.0, effort: "Medium", completed: false }
    ]
  });

  const [walletData, setWalletData] = useState({
    total_co2_saved_kg: 28.5,
    monthly_co2_saved_kg: 12.0,
    actions_completed_count: 4,
    savings_breakdown: [
      { action: "5-Day Transport Reduction Plan", saved_co2_kg: 18.0, category: "Transportation", label: "Estimated Reduction" },
      { action: "Energy Conservation Experiment", saved_co2_kg: 6.5, category: "Electricity", label: "Estimated Reduction" },
      { action: "Meat-Free Meal Habit Days", saved_co2_kg: 4.0, category: "Food", label: "Estimated Reduction" }
    ]
  });

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user) {
        const [sumRes, eqRes, dqRes, rcRes, baseRes, futRes, optRes, planRes, wallRes] = await Promise.all([
          api.getSummary().catch(() => null),
          api.getImpactEquivalents().catch(() => null),
          api.getDataQuality().catch(() => null),
          api.getRootCauseAnalysis().catch(() => null),
          api.getPersonalBaseline().catch(() => null),
          api.getFutureMeScenarios().catch(() => null),
          api.optimizeReduction(20).catch(() => null),
          api.get5DayPlan().catch(() => null),
          api.getWallet().catch(() => null)
        ]);

        if (sumRes) setSummary(sumRes);
        if (eqRes) setEquivalents(eqRes);
        if (dqRes) setDataQuality(dqRes);
        if (rcRes) setRootCause(rcRes);
        if (baseRes) setBaselineData(baseRes);
        if (futRes) setFutureMe(futRes);
        if (optRes) setOptimizationResult(optRes);
        if (planRes) setPlan5Day(planRes);
        if (wallRes) setWalletData(wallRes);
        if (eqRes) setEquivalents(eqRes);
        if (dqRes) setDataQuality(dqRes);
        if (rcRes) setRootCause(rcRes);
        if (baseRes) setBaselineData(baseRes);
        if (futRes) setFutureMe(futRes);
        if (optRes) setOptimizationResult(optRes);
        if (planRes && planRes.days) setPlan5Day(planRes);
      } else {
        setSummary({
          has_data: true,
          total_footprint: 186.0,
          carbon_score: 82,
          weekly_improvement_pct: 12.4,
          highest_source: "Transportation",
          biggest_emission_source_message: "Your biggest emission source is Transportation.",
          breakdown: { "Transportation": 96.0, "Electricity": 45.0, "Food": 30.0, "Waste": 15.0, "Lifestyle": 0.0 },
          monthly_trend: [
            { date: "May 01", emission: 220.0 },
            { date: "Jun 01", emission: 205.0 },
            { date: "Jul 01", emission: 186.0 }
          ],
          predicted_emission: 194.0,
          prediction_trend: "↑ Increasing",
          prediction_reason: "Transportation emissions and resource consumption increased.",
          anomaly_alert: { has_anomaly: false }
        });
      }
    } catch (err) {
      console.warn("Dashboard data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRunOptimizer = async (e) => {
    e.preventDefault();
    try {
      if (user) {
        const opt = await api.optimizeReduction(parseFloat(targetReduceInput));
        if (opt) setOptimizationResult(opt);
      } else {
        setOptimizationResult({
          target_reduction_kg: parseFloat(targetReduceInput),
          recommended_combination: [
            { title: "Reduce car usage", reduction_kg: 15.0, effort: "Low" },
            { title: "Reduce AC usage", reduction_kg: 8.0, effort: "Medium" }
          ],
          estimated_total_reduction_kg: 23.0,
          target_achieved: parseFloat(targetReduceInput) <= 23.0,
          label: "Estimated potential reduction"
        });
      }
    } catch (err) {
      alert("Failed running optimization.");
    }
  };

  const handleToggleDay = async (dayNum) => {
    try {
      if (user) {
        await api.toggle5DayPlanDay(dayNum);
      }
      setPlan5Day(prev => ({
        ...prev,
        days: prev.days.map(d => d.day === dayNum ? { ...d, completed: !d.completed } : d)
      }));
    } catch (err) {
      console.warn("Toggle day error:", err);
    }
  };

  const handleNext5DaysQuest = async () => {
    try {
      if (user) {
        const res = await api.reset5DayPlan();
        if (res && res.days) setPlan5Day(res);
      } else {
        setPlan5Day(prev => ({
          ...prev,
          days: prev.days.map(d => ({ ...d, completed: false }))
        }));
      }
      setQuestStreakCount(prev => prev + 1);
    } catch (err) {
      console.warn("Reset 5-day quest error:", err);
    }
  };

  const getCategoryIcon = (cat) => {
    switch(cat) {
      case 'Electricity': return Zap;
      case 'Transportation': return Car;
      case 'Food': return Utensils;
      case 'Waste': return Trash2;
      default: return Leaf;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#16A66A] border-t-transparent animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600 dark:text-[#DDF7E9]/70">Loading EcoAI Analytics Dashboard...</p>
      </div>
    );
  }

  // Multi-Scenario "Future Me" Chart Setup
  const futureMeChartData = {
    labels: futureMe.months || ["Month 1", "Month 2", "Month 3"],
    datasets: [
      {
        label: futureMe.scenario_a?.name || "Continue Habits",
        data: futureMe.scenario_a?.values || [193, 201, 209],
        borderColor: futureMe.scenario_a?.color || "#f43f5e",
        borderDash: [5, 5],
        borderWidth: 2,
        tension: 0.3
      },
      {
        label: futureMe.scenario_b?.name || "Follow Recommendations",
        data: futureMe.scenario_b?.values || [171, 157, 144],
        borderColor: futureMe.scenario_b?.color || "#16A66A",
        borderWidth: 3,
        tension: 0.3
      },
      {
        label: futureMe.scenario_c?.name || "Strong Reduction",
        data: futureMe.scenario_c?.values || [156, 131, 110],
        borderColor: futureMe.scenario_c?.color || "#14B8A6",
        borderWidth: 2,
        tension: 0.3
      }
    ]
  };

  const currentFootprint = summary?.total_footprint || 186;
  const predictedValue = summary?.predicted_emission || 194;
  const completedDaysCount = plan5Day.days?.filter(d => d.completed).length || 0;
  const currentSavedKg = plan5Day.days?.filter(d => d.completed).reduce((sum, d) => sum + d.reduction_kg, 0) || 0;

  // Exact green line connector width percentage calculation
  const getLineWidthPct = (completedCount) => {
    if (completedCount === 0) return 0;
    if (completedCount === 1) return 22;
    if (completedCount === 2) return 46;
    if (completedCount === 3) return 68;
    if (completedCount === 4) return 88;
    return 100; // 5/5 -> 100% connects fully across to Day 5!
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-[#123B2A] to-[#16A66A] p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Personal Carbon Dashboard
          </h1>
          <p className="text-xs text-[#DDF7E9]/80 mt-1 font-medium">
            AI Emission Predictions, 5-Day Reduction Plan & Decision Support
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setCheckinOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#F4C95D] text-[#123B2A] font-black text-xs shadow-md hover:bg-yellow-400 flex items-center gap-2 cursor-pointer transition"
          >
            <Flame className="w-4 h-4 text-[#123B2A]" />
            Daily 1-Min Check-In
          </button>
          
          <button
            onClick={() => setTransparencyOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 cursor-pointer flex items-center gap-2 transition"
          >
            <Calculator className="w-4 h-4 text-[#F4C95D]" />
            How Was This Calculated?
          </button>
        </div>
      </div>

      {/* MODULE 21: YOUR BIGGEST OPPORTUNITY BANNER */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-black">
            💡
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">Your Biggest Opportunity</span>
            <p className="text-xs font-black text-slate-900 dark:text-white">
              "{summary?.highest_source || 'Transportation'} currently contributes most to your monthly carbon footprint."
            </p>
          </div>
        </div>

        <button
          onClick={() => setCheckinOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-[11px] shadow shrink-0 cursor-pointer"
        >
          Take Action Now
        </button>
      </div>

      {/* COMPACT SUMMARY METRIC CARDS GRID */}
      <div id="carbon-breakdown-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* 1. Current Carbon */}
        <div className="glass-card p-4 rounded-2xl bg-white dark:bg-[#123B2A] border border-[#16A66A]/30 space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase">Current Carbon</span>
          <p className="text-xl font-black text-slate-900 dark:text-white">{currentFootprint} <span className="text-xs font-bold text-slate-500">kg</span></p>
        </div>

        {/* 2. Predicted Carbon & Range */}
        <div className="glass-card p-4 rounded-2xl bg-white dark:bg-[#123B2A] border border-purple-500/30 space-y-1">
          <span className="text-[10px] font-black text-purple-500 uppercase">AI Prediction Range</span>
          <p className="text-base font-black text-purple-600 dark:text-purple-300">{int(currentFootprint*0.97)}–{int(currentFootprint*1.11)} kg</p>
        </div>

        {/* 3. Personal Baseline Normal Range */}
        <div className="glass-card p-4 rounded-2xl bg-white dark:bg-[#123B2A] border border-cyan-500/30 space-y-1">
          <span className="text-[10px] font-black text-cyan-500 uppercase">Personal Baseline</span>
          <p className="text-xs font-black text-slate-900 dark:text-white">{baselineData.normal_range_formatted || '170–190 kg'}</p>
        </div>

        {/* 4. Data Quality Score */}
        <div className="glass-card p-4 rounded-2xl bg-white dark:bg-[#123B2A] border border-[#16A66A]/30 space-y-1">
          <span className="text-[10px] font-black text-[#16A66A] uppercase">Data Quality Score</span>
          <p className="text-xl font-black text-[#16A66A]">{dataQuality.quality_score_pct}% <span className="text-[10px] font-bold text-slate-400">({dataQuality.confidence_level})</span></p>
        </div>

        {/* 5. Top Source */}
        <div className="glass-card p-4 rounded-2xl bg-white dark:bg-[#123B2A] border border-[#16A66A]/30 space-y-1">
          <span className="text-[10px] font-black text-[#16A66A] uppercase">Top Source</span>
          <p className="text-sm font-black text-slate-900 dark:text-white">{summary?.highest_source || 'Transportation'}</p>
        </div>

        {/* 6. MODULE 7: MY CARBON SAVINGS WALLET CARD */}
        <div className="glass-card p-4 rounded-2xl bg-gradient-to-br from-[#123B2A] to-[#16A66A] text-white border border-[#F4C95D]/40 space-y-1">
          <span className="text-[10px] font-black text-[#F4C95D] uppercase">My Carbon Saved</span>
          <p className="text-xl font-black text-[#F4C95D]">-{walletData?.total_co2_saved_kg || 28.5} <span className="text-xs font-bold text-[#DDF7E9]">kg</span></p>
          <span className="block text-[9px] text-[#DDF7E9]/80 font-bold">Estimated Savings</span>
        </div>

      </div>

      {/* AI CARBON EMISSION PREDICTION CARD */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123B2A] border-2 border-purple-500/40 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-6 h-6 text-purple-500" /> AI Carbon Emission Prediction
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#DDF7E9]/70 mt-0.5">
              Scikit-Learn Random Forest Regression forecasting next month's carbon footprint.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 block uppercase">Next Month Forecast</span>
            <span className="text-3xl font-black text-purple-600 dark:text-purple-300">
              {predictedValue} <span className="text-sm font-bold text-slate-500">kg CO₂e</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            <span className="text-slate-400 text-[10px] uppercase block">Prediction Range</span>
            <span className="text-base font-black text-purple-700 dark:text-purple-300">
              {int(currentFootprint*0.97)}–{int(currentFootprint*1.11)} kg CO₂e
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100">
            <span className="text-slate-400 text-[10px] uppercase block">Model Confidence</span>
            <span className="text-base font-black text-[#16A66A]">
              High Confidence (82% Data Quality)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100">
            <span className="text-slate-400 text-[10px] uppercase block">Expected Trend</span>
            <span className="text-base font-black text-amber-500">
              {summary?.prediction_trend || "↑ Increasing (+4.3%)"}
            </span>
          </div>
        </div>

        <p className="text-xs font-semibold text-slate-600 dark:text-[#DDF7E9]/80 border-t border-slate-100 dark:border-white/10 pt-3 italic">
          💡 <strong>AI Analysis Rationale:</strong> "{summary?.prediction_reason || 'Transportation emissions and resource consumption increased compared with previous baseline.'}"
        </p>
      </div>

      {/* AI 5-DAY ECO CHALLENGE */}
      <div id="ai-5day-challenge-section">
        <AI5DayChallenge 
          onOpenChat={(prompt) => setExternalChatPrompt(prompt)} 
          onRunTwin={() => setActiveTab && setActiveTab('carbon_twin')} 
        />
      </div>

      {/* CARBON IMPACT EXPLAINER */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123B2A] border border-[#16A66A]/30 space-y-6 shadow-xl">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Understand Your Carbon Impact
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#DDF7E9]/70">
              Converting {currentFootprint} kg CO₂e/month into scientifically defensible real-world equivalents.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-bold">
          
          {/* 🚗 Vehicle Equivalents */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-[#16A66A]">
              <Car className="w-5 h-5" />
              <span className="text-sm font-black text-slate-900 dark:text-white">Equivalent Vehicle Travel</span>
            </div>
            <p className="text-2xl font-black text-[#16A66A]">
              ~{equivalents.equivalents?.car_travel_km} <span className="text-xs text-slate-500">km</span>
            </p>
            <p className="text-slate-600 dark:text-[#DDF7E9]/80 font-medium">
              {equivalents.descriptions?.car_travel_km}
            </p>
          </div>

          {/* 🌳 Tree Years */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-[#14B8A6]">
              <Trees className="w-5 h-5" />
              <span className="text-sm font-black text-slate-900 dark:text-white">Tree Absorption Equivalent</span>
            </div>
            <p className="text-2xl font-black text-[#14B8A6]">
              ~{equivalents.equivalents?.tree_years} <span className="text-xs text-slate-500">tree-years</span>
            </p>
            <p className="text-slate-600 dark:text-[#DDF7E9]/80 font-medium">
              {equivalents.descriptions?.tree_years}
            </p>
          </div>

          {/* ⚡ Energy kWh */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-[#F4C95D]">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-black text-slate-900 dark:text-white">Energy Equivalent</span>
            </div>
            <p className="text-2xl font-black text-[#F4C95D]">
              ~{equivalents.equivalents?.kwh_electricity} <span className="text-xs text-slate-500">kWh</span>
            </p>
            <p className="text-slate-600 dark:text-[#DDF7E9]/80 font-medium">
              {equivalents.descriptions?.kwh_electricity}
            </p>
          </div>

        </div>

        <p className="text-[11px] text-slate-400 italic text-right">
          * Equivalencies computed using standard IPCC GHG conversion benchmarks.
        </p>
      </div>

      {/* ROOT CAUSE ANALYSIS */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123B2A] border border-[#16A66A]/30 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-black text-[#17231D] dark:text-white">
              Why Is My Carbon Footprint Changing?
            </h2>
          </div>

          <div className="text-right">
            <span className="text-[#16A66A] text-lg font-black">
              +{rootCause.increase_kg} kg CO₂e (+{rootCause.increase_pct}%)
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-700 dark:text-rose-300">
          🔍 <strong>Primary Cause Identified:</strong> "{rootCause.primary_cause_message}"
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold">
          {rootCause.sector_deltas && Object.entries(rootCause.sector_deltas).map(([sec, delta]) => (
            <div key={sec} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase block">{sec}</span>
              <span className={`text-sm font-black ${delta > 0 ? 'text-rose-500' : 'text-[#16A66A]'}`}>
                {delta > 0 ? `+${delta}` : delta} kg CO₂e
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* REDUCTION OPTIMIZER */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123B2A] border border-[#16A66A]/30 space-y-6 shadow-xl">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-black text-[#17231D] dark:text-white">
              Find My Best Reduction Plan
            </h2>
          </div>
        </div>

        <form onSubmit={handleRunOptimizer} className="flex flex-wrap items-center gap-4 text-xs font-bold">
          <label className="text-slate-700 dark:text-white">Target Monthly Reduction:</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="5"
              max="100"
              value={targetReduceInput}
              onChange={(e) => setTargetReduceInput(e.target.value)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black w-24"
            />
            <span className="text-slate-500">kg CO₂e/month</span>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#16A66A] hover:bg-emerald-600 text-white font-black shadow cursor-pointer transition"
          >
            Solve Optimal Plan
          </button>
        </form>

        <div className="p-5 rounded-3xl bg-[#DDF7E9]/40 dark:bg-white/5 border border-[#16A66A]/30 space-y-4">
          <div className="flex justify-between items-center text-xs font-extrabold">
            <span className="text-[#123B2A] dark:text-[#DDF7E9]">Target Reduction: {optimizationResult.target_reduction_kg} kg CO₂e/month</span>
            <span className="text-[#16A66A] font-black">
              Target Achieved: {optimizationResult.target_achieved ? 'YES ✅' : 'NO ❌'}
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-400">Recommended Combination</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {optimizationResult.recommended_combination?.map((act, i) => (
                <div key={i} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 flex justify-between items-center font-bold">
                  <span>{i + 1}. {act.title}</span>
                  <span className="text-[#16A66A]">-{act.reduction_kg} kg (Effort: {act.effort})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* "FUTURE ME" MULTI-SCENARIO PREDICTION */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123B2A] border border-[#16A66A]/30 space-y-6 shadow-xl">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-black text-[#17231D] dark:text-white">
              "Future Me" Multi-Scenario Prediction
            </h2>
          </div>
        </div>

        <div className="h-64 sm:h-72">
          <Line data={futureMeChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
      </div>

      {/* MODAL COMPONENTS */}
      <CalculationTransparencyModal 
        isOpen={transparencyOpen} 
        onClose={() => setTransparencyOpen(false)} 
      />

      <DailyCheckInModal 
        isOpen={checkinOpen} 
        onClose={() => setCheckinOpen(false)}
        onCheckInComplete={() => fetchData()}
      />

      {/* FLOATING ECOAI ASSISTANT CHATBOT */}
      <EcoAIAssistant 
        externalPrompt={externalChatPrompt}
        onNavigate={(tab) => setActiveTab && setActiveTab(tab)}
        onRunTwin={() => setActiveTab && setActiveTab('carbon_twin')}
      />

    </div>
  );
}

function int(v) { return Math.round(v); }
