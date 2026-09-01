import React, { useState } from 'react';
import { Car, Zap, Utensils, Trash2, Plane, Sparkles, ArrowRight, CheckCircle2, Calculator } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CarbonForm({ setActiveTab }) {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    // Transportation
    transport_type: "Petrol Car",
    daily_distance: 20,
    fuel_type: "Petrol",

    // Electricity
    monthly_electricity: 180,
    ac_usage_hours: 3.5,
    appliance_usage: "Medium",

    // Food
    diet_type: "Non-vegetarian",
    meals_per_day: 3,

    // Waste
    plastic_waste_kg: 2.0,
    recycling_habit: "Sometimes",
    waste_generated_level: "Moderate",

    // Lifestyle
    flight_frequency: 2,
    water_usage_liters: 120,
    shopping_frequency: "Moderate"
  });

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const steps = [
    { num: 1, label: "Transportation", icon: Car },
    { num: 2, label: "Electricity & Energy", icon: Zap },
    { num: 3, label: "Food & Diet", icon: Utensils },
    { num: 4, label: "Waste & Recycling", icon: Trash2 },
    { num: 5, label: "Lifestyle & Travel", icon: Plane }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) {
        // If non-logged in, navigate to auth or calculate locally
        setActiveTab('auth');
        return;
      }
      await api.calculateCarbon(formData);
      setActiveTab('dashboard');
    } catch (err) {
      setError(err.message || "Error submitting carbon footprint data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <Calculator className="w-4 h-4 text-emerald-500" />
          IPCC Standard Questionnaire
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Carbon Footprint Calculator
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Enter your daily activities across 5 core categories to generate your exact footprint, Scikit-learn AI predictions, and custom recommendations.
        </p>
      </div>

      {/* Step Progress Header */}
      <div className="glass-card p-4 rounded-3xl">
        <div className="flex justify-between items-center overflow-x-auto pb-2 sm:pb-0 gap-2">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.num;
            const isCompleted = activeStep > step.num;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setActiveStep(step.num)}
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : isCompleted
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.num}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Box */}
      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-10 rounded-3xl space-y-8 relative">
        
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* STEP 1: TRANSPORTATION */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Transportation Habits</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Daily commuting and vehicle choice factors.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Transport Type</label>
                <select
                  value={formData.transport_type}
                  onChange={(e) => handleChange('transport_type', e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Petrol Car">Petrol Car (Sedan / SUV)</option>
                  <option value="Diesel Car">Diesel Car</option>
                  <option value="EV">Electric Vehicle (EV)</option>
                  <option value="Public Transit">Public Transit (Metro / Bus)</option>
                  <option value="Motorcycle">Motorcycle / Scooter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Daily Distance Travelled (km)</label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={formData.daily_distance}
                  onChange={(e) => handleChange('daily_distance', parseFloat(e.target.value) || 0)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Fuel Type</label>
                <select
                  value={formData.fuel_type}
                  onChange={(e) => handleChange('fuel_type', e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric Grid">Electricity Grid (Clean/Mix)</option>
                  <option value="CNG">CNG / Hybrid</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ELECTRICITY */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-500">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Electricity & Home Energy</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Monthly utility metrics and cooling habits.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Monthly Electricity Units (kWh)</label>
                <input
                  type="number"
                  min="0"
                  max="2000"
                  value={formData.monthly_electricity}
                  onChange={(e) => handleChange('monthly_electricity', parseFloat(e.target.value) || 0)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Air Conditioning Usage (hours/day)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={formData.ac_usage_hours}
                  onChange={(e) => handleChange('ac_usage_hours', parseFloat(e.target.value) || 0)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Major Appliance Usage Level</label>
                <select
                  value={formData.appliance_usage}
                  onChange={(e) => handleChange('appliance_usage', e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Low">Low (Basic lighting & fridge)</option>
                  <option value="Medium">Medium (TV, Microwave, Washer)</option>
                  <option value="High">High (Dryer, Heavy appliances, Pool pump)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: FOOD */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Food & Diet Profile</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Dietary carbon impact coefficients.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Dietary Preference</label>
                <select
                  value={formData.diet_type}
                  onChange={(e) => handleChange('diet_type', e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Non-vegetarian">Non-vegetarian (Meat 4+ times/week)</option>
                  <option value="Vegetarian">Vegetarian (Dairy & Plant based)</option>
                  <option value="Vegan">Vegan (100% Plant based)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Meals per Day</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={formData.meals_per_day}
                  onChange={(e) => handleChange('meals_per_day', parseInt(e.target.value) || 3)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: WASTE */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Waste & Recycling Habits</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Plastic waste and disposal practices.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Plastic Waste Generated (kg/week)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  value={formData.plastic_waste_kg}
                  onChange={(e) => handleChange('plastic_waste_kg', parseFloat(e.target.value) || 0)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Recycling Habit</label>
                <select
                  value={formData.recycling_habit}
                  onChange={(e) => handleChange('recycling_habit', e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Never">Never / Rarely</option>
                  <option value="Sometimes">Sometimes (Plastics & Bottles)</option>
                  <option value="Always">Always (Composting & 100% Segregation)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Overall Waste Volume</label>
                <select
                  value={formData.waste_generated_level}
                  onChange={(e) => handleChange('waste_generated_level', e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Low">Low (Minimal packaging)</option>
                  <option value="Moderate">Moderate (Average household trash)</option>
                  <option value="High">High (Frequent takeout & non-reusables)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: LIFESTYLE */}
        {activeStep === 5 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
                <Plane className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Lifestyle & Travel</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Air travel, water usage, and consumer shopping.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Flight Travel Frequency (per year)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.flight_frequency}
                  onChange={(e) => handleChange('flight_frequency', parseInt(e.target.value) || 0)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Water Usage (liters/day)</label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={formData.water_usage_liters}
                  onChange={(e) => handleChange('water_usage_liters', parseFloat(e.target.value) || 100)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Shopping Frequency</label>
                <select
                  value={formData.shopping_frequency}
                  onChange={(e) => handleChange('shopping_frequency', e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Low">Low (Essential goods only)</option>
                  <option value="Moderate">Moderate (Monthly clothing & items)</option>
                  <option value="High">High (Frequent online orders & luxury)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-800">
          {activeStep > 1 ? (
            <button
              type="button"
              onClick={() => setActiveStep(prev => prev - 1)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Previous Step
            </button>
          ) : <div />}

          {activeStep < 5 ? (
            <button
              type="button"
              onClick={() => setActiveStep(prev => prev + 1)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-xl shadow-emerald-500/30 hover:scale-105 transition flex items-center gap-2 cursor-pointer"
            >
              {loading ? 'Analyzing with AI...' : 'Calculate Carbon Footprint'}
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>

      </form>
    </div>
  );
}
