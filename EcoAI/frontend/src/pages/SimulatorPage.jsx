import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { 
  Sliders, 
  RotateCcw, 
  Sparkles, 
  TrendingDown, 
  Car, 
  Bus, 
  Zap, 
  Snowflake, 
  Utensils, 
  Recycle, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
);

export default function SimulatorPage({ setActiveTab }) {
  const [baseline, setBaseline] = useState({
    daily_distance: 25,
    transport_type: "Petrol Car",
    monthly_electricity: 200,
    ac_usage_hours: 4,
    diet_type: "Non-vegetarian",
    recycling_habit: "Sometimes",
    total_footprint: 186
  });

  const [simState, setSimState] = useState({
    daily_distance: 25,
    transport_type: "Petrol Car",
    monthly_electricity: 200,
    ac_usage_hours: 4,
    diet_type: "Non-vegetarian",
    recycling_habit: "Sometimes"
  });

  const [simulationResult, setSimulationResult] = useState({
    current_emission: 186.0,
    simulated_emission: 151.0,
    potential_reduction: 35.0,
    reduction_percentage: 18.8,
    current_breakdown: { "Transportation": 85.0, "Electricity": 60.0, "Food": 25.0, "Waste": 16.0 },
    simulated_breakdown: { "Transportation": 55.0, "Electricity": 50.0, "Food": 30.0, "Waste": 16.0 }
  });

  const [loading, setLoading] = useState(false);

  const loadBaseline = async () => {
    try {
      const data = await api.getSimulatorBaseline();
      if (data) {
        const baseValues = {
          daily_distance: data.daily_distance || 25,
          transport_type: data.transport_type || "Petrol Car",
          monthly_electricity: data.monthly_electricity || 200,
          ac_usage_hours: data.ac_usage_hours || 4,
          diet_type: data.diet_type || "Non-vegetarian",
          recycling_habit: data.recycling_habit || "Sometimes",
          total_footprint: data.total_footprint || 186
        };
        setBaseline(baseValues);
        setSimState(baseValues);
        runSim(baseValues);
      }
    } catch (err) {
      console.warn("Baseline load error:", err);
      runSim(simState);
    }
  };

  const runSim = async (stateToSim) => {
    setLoading(true);
    try {
      const res = await api.runSimulation(stateToSim);
      if (res) {
        setSimulationResult(res);
      }
    } catch (err) {
      // Client-side fallback calculation if offline
      const orig = baseline.total_footprint || 186;
      let diff = 0;
      if (stateToSim.daily_distance < baseline.daily_distance) diff += (baseline.daily_distance - stateToSim.daily_distance) * 1.2;
      if (stateToSim.ac_usage_hours < baseline.ac_usage_hours) diff += (baseline.ac_usage_hours - stateToSim.ac_usage_hours) * 8.5;
      if (stateToSim.monthly_electricity < baseline.monthly_electricity) diff += (baseline.monthly_electricity - stateToSim.monthly_electricity) * 0.4;
      if (stateToSim.diet_type === "Vegan") diff += 30;
      else if (stateToSim.diet_type === "Vegetarian" && baseline.diet_type === "Non-vegetarian") diff += 18;
      if (stateToSim.recycling_habit === "Always" && baseline.recycling_habit !== "Always") diff += 10;

      const simVal = Math.max(40, Math.round(orig - diff));
      const potRed = Math.max(0, orig - simVal);
      const pct = Math.round((potRed / orig) * 1000) / 10;

      setSimulationResult({
        current_emission: orig,
        simulated_emission: simVal,
        potential_reduction: potRed,
        reduction_percentage: pct,
        current_breakdown: { "Transportation": 85.0, "Electricity": 60.0, "Food": 25.0, "Waste": 16.0 },
        simulated_breakdown: { "Transportation": 55.0, "Electricity": 50.0, "Food": 30.0, "Waste": 16.0 }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaseline();
  }, []);

  const handleInputChange = (field, val) => {
    const nextState = { ...simState, [field]: val };
    setSimState(nextState);
    runSim(nextState);
  };

  const handleReset = () => {
    setSimState(baseline);
    runSim(baseline);
  };

  // Bar Chart Data for comparison
  const chartData = {
    labels: ['Current Footprint', 'Simulated Footprint'],
    datasets: [
      {
        label: 'Monthly Emission (kg CO2e)',
        data: [simulationResult.current_emission, simulationResult.simulated_emission],
        backgroundColor: ['#64748b', '#10b981'],
        borderRadius: 12,
        barThickness: 48
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        titleFont: { size: 12, weight: 'bold' }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 12, weight: 'bold' } } },
      y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8', font: { size: 11 } } }
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-card p-6 rounded-3xl">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full mb-1">
            <Sliders className="w-3.5 h-3.5" /> What-If Footprint Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            What-If Carbon Simulator
            <span className="text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
              Estimated Model
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Temporarily tweak your daily activities to simulate instant carbon footprint savings.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-emerald-500" /> Reset Simulation
        </button>
      </div>

      {/* ESTIMATE NOTICE BANNER */}
      <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs flex items-center gap-3">
        <Info className="w-5 h-5 flex-shrink-0 text-cyan-500" />
        <span>
          <strong>Note:</strong> All simulated values are real-time estimates based on standard IPCC emission factors. Simulating lifestyle changes will <strong>never alter your actual carbon footprint history</strong>.
        </span>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Current Footprint */}
        <div className="glass-card p-6 rounded-3xl space-y-2 border-slate-200 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Carbon Footprint</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{simulationResult.current_emission}</span>
            <span className="text-xs text-slate-500">kg CO₂e/month</span>
          </div>
          <p className="text-[11px] text-slate-400">Baseline Actual Footprint</p>
        </div>

        {/* Simulated Footprint */}
        <div className="glass-card p-6 rounded-3xl space-y-2 border-emerald-500/30 bg-emerald-500/5">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Simulated Carbon Footprint</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{simulationResult.simulated_emission}</span>
            <span className="text-xs text-emerald-600/70">kg CO₂e/month</span>
          </div>
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            Estimate Model
          </span>
        </div>

        {/* Potential Reduction */}
        <div className="glass-card p-6 rounded-3xl space-y-2 border-cyan-500/30">
          <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Potential Reduction</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-cyan-600 dark:text-cyan-400">{simulationResult.potential_reduction}</span>
            <span className="text-xs text-cyan-600/70">kg CO₂e/month</span>
          </div>
          <p className="text-[11px] text-cyan-600/80 font-medium">Estimated Monthly Savings</p>
        </div>

        {/* Reduction Percentage */}
        <div className="glass-card p-6 rounded-3xl space-y-2 border-amber-500/30">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Reduction Percentage</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{simulationResult.reduction_percentage}%</span>
          </div>
          <p className="text-[11px] text-amber-600/80 font-medium">Footprint Efficiency Gain</p>
        </div>

      </div>

      {/* SIMULATION CONTROLS & COMPARISON BAR CHART GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Sliders & Inputs (7 cols) */}
        <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-500" /> Adjust Lifestyle Parameters
            </h3>
            <span className="text-xs text-slate-500">Multiple simultaneous inputs</span>
          </div>

          <div className="space-y-6">
            
            {/* 1. Car Travel Distance */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-emerald-500" /> Daily Car Travel Distance
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">{simState.daily_distance} km / day</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="1"
                value={simState.daily_distance} 
                onChange={(e) => handleInputChange('daily_distance', parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 km (No Driving)</span>
                <span>50 km</span>
                <span>100 km</span>
              </div>
            </div>

            {/* 2. Public Transport Mode */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Bus className="w-4 h-4 text-cyan-500" /> Transportation Commute Mode
              </label>
              <select
                value={simState.transport_type}
                onChange={(e) => handleInputChange('transport_type', e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Petrol Car">Petrol Car (High Emissions)</option>
                <option value="Diesel Car">Diesel Car</option>
                <option value="EV">Electric Vehicle (Low Emissions)</option>
                <option value="Public Transit">Public Transit / Metro Bus (Minimal Emissions)</option>
                <option value="Motorcycle">Motorcycle</option>
              </select>
            </div>

            {/* 3. Monthly Electricity Consumption */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" /> Monthly Electricity Consumption
                </span>
                <span className="text-amber-600 dark:text-amber-400">{simState.monthly_electricity} kWh / month</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="600" 
                step="10"
                value={simState.monthly_electricity} 
                onChange={(e) => handleInputChange('monthly_electricity', parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>50 kWh (Minimal)</span>
                <span>300 kWh</span>
                <span>600 kWh (Heavy)</span>
              </div>
            </div>

            {/* 4. Air Conditioner (AC) Daily Usage */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-2">
                  <Snowflake className="w-4 h-4 text-blue-500" /> Daily AC Usage Hours
                </span>
                <span className="text-blue-600 dark:text-blue-400">{simState.ac_usage_hours} hours / day</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="16" 
                step="0.5"
                value={simState.ac_usage_hours} 
                onChange={(e) => handleInputChange('ac_usage_hours', parseFloat(e.target.value))}
                className="w-full accent-blue-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 hrs</span>
                <span>8 hrs</span>
                <span>16 hrs</span>
              </div>
            </div>

            {/* 5. Meat Consumption & Diet Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-purple-500" /> Diet Type & Meat Consumption
              </label>
              <select
                value={simState.diet_type}
                onChange={(e) => handleInputChange('diet_type', e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Non-vegetarian">Non-vegetarian (Daily meat/poultry)</option>
                <option value="Vegetarian">Vegetarian (Dairy & plant-based)</option>
                <option value="Vegan">Vegan (100% plant-based)</option>
              </select>
            </div>

            {/* 6. Recycling Habits */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Recycle className="w-4 h-4 text-emerald-500" /> Recycling Habits
              </label>
              <select
                value={simState.recycling_habit}
                onChange={(e) => handleInputChange('recycling_habit', e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Never">Never (Mixed trash disposal)</option>
                <option value="Sometimes">Sometimes (Occasional recycling)</option>
                <option value="Always">Always (100% plastic/paper recycling)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Right Column: Bar Chart Comparison & Impact Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Footprint Comparison Bar Chart</h3>
            <p className="text-xs text-slate-500">Current Actual vs. Simulated Footprint</p>
            <div className="h-64 sm:h-72 flex items-center justify-center">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent border-emerald-500/20">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" /> Simulator Takeaways
            </h4>

            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>
                  Reducing AC usage by 1.5 hrs daily saves approximately <strong>13 kg CO₂e/month</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>
                  Switching from Petrol Car to Public Transit cuts your commuter footprint by over <strong>70%</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>
                  Adopting 100% recycling habits prevents landfill methane emissions worth <strong>~10 kg CO₂e/month</strong>.
                </span>
              </li>
            </ul>

            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              Return to Personal Dashboard
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
