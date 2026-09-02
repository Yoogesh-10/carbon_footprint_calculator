import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, User, Car, Zap, Utensils, Trash2, Target } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function OnboardingWizard({ setActiveTab }) {
  const { user, updateUserData } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State across 6 steps
  const [formData, setFormData] = useState({
    // Step 1: Basic Profile
    age: '28',
    gender: 'Male',
    city: 'Chennai',
    occupation: 'Software Engineer',
    household_size: '3',

    // Step 2: Transport
    transport_type: 'Petrol Car',
    vehicle_type: 'Sedan',
    daily_distance: '25',
    fuel_type: 'Petrol',

    // Step 3: Energy
    monthly_electricity: '220',
    ac_usage_hours: '4',
    renewable_pct: '10',
    appliance_usage: 'Medium',

    // Step 4: Food
    diet_type: 'Non-vegetarian',
    meals_per_day: '3',

    // Step 5: Waste
    waste_generated_level: 'Moderate',
    plastic_waste_kg: '2.5',
    recycling_habit: 'Sometimes',

    // Step 6: Preferences & Goals
    carbon_goal: '250',
    priority: 'Balanced'
  });

  const steps = [
    { number: 1, title: 'Basic Profile', icon: User, required: true },
    { number: 2, title: 'Transportation', icon: Car, required: true },
    { number: 3, title: 'Energy', icon: Zap, required: true },
    { number: 4, title: 'Food', icon: Utensils, required: false },
    { number: 5, title: 'Waste', icon: Trash2, required: false },
    { number: 6, title: 'Sustainability Goals', icon: Target, required: false }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = async () => {
    setLoading(true);
    try {
      if (user) {
        await api.submitOnboardingStep(currentStep, formData);
      }
      if (currentStep < 6) {
        setCurrentStep(prev => prev + 1);
      } else {
        if (user) updateUserData({ profile_completed: true, profile_completion_pct: 100 });
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.warn("Onboarding step error:", err);
      if (currentStep < 6) setCurrentStep(prev => prev + 1);
      else setActiveTab('dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipStep = () => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    } else {
      setActiveTab('dashboard');
    }
  };

  const currentStepObj = steps[currentStep - 1];

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#123B2A] to-[#16A66A] p-6 sm:p-8 rounded-3xl text-white shadow-xl flex justify-between items-center">
        <div>
          <span className="text-xs font-black uppercase text-[#F4C95D] tracking-wider">Progressive Profile Setup</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">Complete Your Eco Profile</h1>
          <p className="text-xs text-[#DDF7E9]/80 mt-1">Help EcoAI build your accurate carbon baseline & AI predictions.</p>
        </div>

        <div className="hidden sm:block text-right">
          <span className="text-3xl font-black text-[#F4C95D]">{int((currentStep / 6) * 100)}%</span>
          <span className="block text-[10px] uppercase font-bold text-[#DDF7E9]">Completeness</span>
        </div>
      </div>

      {/* Progress Bar & Stepper Indicator */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-xs font-black text-slate-700 dark:text-slate-200">
          <span>Step {currentStep} of 6: {currentStepObj.title}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase ${currentStepObj.required ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
            {currentStepObj.required ? 'Required' : 'Optional (Can Skip)'}
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#16A66A] to-[#14B8A6] transition-all duration-500"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>

        {/* Icons Row */}
        <div className="grid grid-cols-6 gap-2 pt-2 text-center">
          {steps.map(s => {
            const Icon = s.icon;
            const isDone = s.number < currentStep;
            const isCurrent = s.number === currentStep;
            return (
              <div 
                key={s.number}
                onClick={() => setCurrentStep(s.number)}
                className={`cursor-pointer p-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                  isCurrent 
                    ? 'bg-[#123B2A] text-white border-[#16A66A] shadow' 
                    : isDone 
                      ? 'bg-emerald-50 text-[#16A66A] dark:bg-emerald-950/40 border-emerald-300'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4 text-[#16A66A]" /> : <Icon className="w-4 h-4" />}
                <span className="text-[9px] font-black uppercase hidden sm:block">Step {s.number}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Form Container */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md space-y-6">
        
        {/* STEP 1: BASIC PROFILE */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#16A66A]" /> Basic Personal Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Age Range</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="e.g. 28"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">City / Region</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="e.g. Chennai, India"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Household Member Size</label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={formData.household_size}
                  onChange={(e) => handleInputChange('household_size', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: TRANSPORT PROFILE */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-[#16A66A]" /> Transportation Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Main Mode of Travel</label>
                <select
                  value={formData.transport_type}
                  onChange={(e) => handleInputChange('transport_type', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Petrol Car">Petrol Car</option>
                  <option value="Diesel Car">Diesel Car</option>
                  <option value="EV">Electric Vehicle (EV)</option>
                  <option value="Public Transit">Public Transit (Bus/Metro)</option>
                  <option value="Motorcycle">Motorcycle / Scooter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Average Daily Distance (km)</label>
                <input
                  type="number"
                  value={formData.daily_distance}
                  onChange={(e) => handleInputChange('daily_distance', e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ENERGY PROFILE */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#F4C95D]" /> Energy Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Monthly Electricity Usage (kWh)</label>
                <input
                  type="number"
                  value={formData.monthly_electricity}
                  onChange={(e) => handleInputChange('monthly_electricity', e.target.value)}
                  placeholder="e.g. 220"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">AC Usage (Hours / Day)</label>
                <input
                  type="number"
                  value={formData.ac_usage_hours}
                  onChange={(e) => handleInputChange('ac_usage_hours', e.target.value)}
                  placeholder="e.g. 4"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: FOOD PROFILE */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Utensils className="w-5 h-5 text-[#14B8A6]" /> Food & Diet Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dietary Pattern</label>
                <select
                  value={formData.diet_type}
                  onChange={(e) => handleInputChange('diet_type', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Non-vegetarian">Non-Vegetarian</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Meals Per Day</label>
                <input
                  type="number"
                  value={formData.meals_per_day}
                  onChange={(e) => handleInputChange('meals_per_day', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: WASTE PROFILE */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-[#16A66A]" /> Waste & Recycling Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Recycling Habit</label>
                <select
                  value={formData.recycling_habit}
                  onChange={(e) => handleInputChange('recycling_habit', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Always">Always Recycle</option>
                  <option value="Sometimes">Sometimes Recycle</option>
                  <option value="Never">Never Recycle</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Waste Generation Level</label>
                <select
                  value={formData.waste_generated_level}
                  onChange={(e) => handleInputChange('waste_generated_level', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Low">Low Waste</option>
                  <option value="Moderate">Moderate Waste</option>
                  <option value="High">High Waste</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: GOALS */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-[#F4C95D]" /> Preferences & Sustainability Goals
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Monthly Target Carbon Footprint (kg CO₂e)</label>
              <input
                type="number"
                value={formData.carbon_goal}
                onChange={(e) => handleInputChange('carbon_goal', e.target.value)}
                placeholder="e.g. 250"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            {!currentStepObj.required && (
              <button
                onClick={handleSkipStep}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Skip Question
              </button>
            )}

            <button
              onClick={handleNextStep}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#16A66A] hover:bg-[#128856] text-white font-black text-xs shadow flex items-center gap-2 cursor-pointer transition"
            >
              {loading ? 'Saving...' : currentStep === 6 ? 'Complete Profile & View Dashboard 🎉' : 'Save & Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

function int(v) { return Math.round(v); }
