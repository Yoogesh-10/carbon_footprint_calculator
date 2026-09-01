import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Briefcase, Calendar, Save, CheckCircle2, Sparkles, AlertTriangle, ArrowRight, History, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage({ setActiveTab }) {
  const { user, updateUserData } = useAuth();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [city, setCity] = useState('');
  const [occupation, setOccupation] = useState('');
  const [carbonGoal, setCarbonGoal] = useState(250);

  const [completeness, setCompleteness] = useState(null);
  const [versions, setVersions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      if (user) {
        const [compRes, verRes] = await Promise.all([
          api.getProfileCompleteness().catch(() => null),
          api.getProfileVersions().catch(() => null)
        ]);

        if (compRes) setCompleteness(compRes);
        if (verRes) setVersions(verRes);
      }
    } catch (err) {
      console.warn("Profile fetch error:", err);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAge(user.age || '');
      setGender(user.gender || 'Male');
      setCity(user.city || '');
      setOccupation(user.occupation || '');
      setCarbonGoal(user.carbon_goal || 250);
      fetchData();
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setError('');

    try {
      if (user) {
        const updated = await api.updateProfile({
          name,
          phone,
          age: age ? parseInt(age) : null,
          gender,
          city,
          occupation,
          carbon_goal: parseFloat(carbonGoal) || 250
        });
        updateUserData(updated);
        setMsg("Profile updated & versioned successfully!");
        fetchData();
      } else {
        setMsg("Profile updated (Demo Mode).");
      }
    } catch (err) {
      setError(err.message || "Failed updating profile.");
    } finally {
      setSaving(false);
    }
  };

  const compPct = completeness?.completion_pct || user?.profile_completion_pct || 72;
  const sections = completeness?.sections || { basic: true, transportation: true, energy: false, food: false, waste: true };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      
      {/* PROFILE COMPLETENESS SYSTEM CARD */}
      <div className="bg-gradient-to-r from-[#123B2A] to-[#16A66A] p-6 sm:p-8 rounded-3xl text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-black uppercase text-[#F4C95D] tracking-wider">Profile Completeness System</span>
            <h2 className="text-2xl font-black mt-0.5">Eco Profile Completion: {compPct}%</h2>
          </div>

          {setActiveTab && compPct < 100 && (
            <button
              onClick={() => setActiveTab('onboarding')}
              className="px-5 py-2.5 rounded-xl bg-[#F4C95D] hover:bg-yellow-400 text-[#123B2A] font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition"
            >
              Complete Profile <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dynamic Section Checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-black pt-1">
          <div className={`p-2.5 rounded-xl border flex items-center gap-1.5 ${sections.basic ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40' : 'bg-rose-500/20 text-rose-200 border-rose-500/40'}`}>
            {sections.basic ? <CheckCircle2 className="w-4 h-4 text-emerald-4-[#16A66A]" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />} Basic Profile
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-1.5 ${sections.transportation ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40' : 'bg-rose-500/20 text-rose-200 border-rose-500/40'}`}>
            {sections.transportation ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />} Transport
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-1.5 ${sections.energy ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40' : 'bg-rose-500/20 text-rose-200 border-rose-500/40'}`}>
            {sections.energy ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />} Electricity
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-1.5 ${sections.food ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40' : 'bg-rose-500/20 text-rose-200 border-rose-500/40'}`}>
            {sections.food ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />} Food
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-1.5 ${sections.waste ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40' : 'bg-rose-500/20 text-rose-200 border-rose-500/40'}`}>
            {sections.waste ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />} Waste
          </div>
        </div>
      </div>

      {/* EDIT PROFILE FORM */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md space-y-6">
        
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#123B2A] to-[#16A66A] text-[#F4C95D] flex items-center justify-center font-black text-2xl shadow-md">
            {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">{user ? user.name : 'EcoAI User'}</h1>
            <p className="text-xs text-slate-500">{user ? user.email : 'user@ecoai.org'}</p>
            <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[#16A66A] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full uppercase">
              <Sparkles className="w-3 h-3" /> {user ? user.role : 'USER'} ACCOUNT
            </span>
          </div>
        </div>

        {msg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[#16A66A] dark:text-[#34D399] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {msg}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">City / Location</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Occupation</label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Monthly Carbon Reduction Target (kg CO₂e)</label>
            <input
              type="number"
              value={carbonGoal}
              onChange={(e) => setCarbonGoal(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl text-xs font-black bg-[#16A66A] hover:bg-[#128856] text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving & Versioning...' : 'Save Profile Changes (Create New Data Version)'}
            </button>
          </div>

        </form>
      </div>

      {/* PROFILE VERSION HISTORY TAB */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md space-y-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-500" /> Data Versioning & History Snapshots
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          Historical carbon calculations remain linked to the profile version active at that time to ensure mathematical accuracy.
        </p>

        <div className="space-y-3 pt-2">
          {versions && versions.length > 0 ? (
            versions.map((v) => (
              <div key={v.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs font-bold">
                <div>
                  <span className="text-[#16A66A] font-black">Profile Snapshot Version {v.version_number}</span>
                  <span className="text-slate-400 block text-[10px]">{new Date(v.created_at).toLocaleString()}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-extrabold text-slate-700 dark:text-slate-300">
                  Versioned Snapshot
                </span>
              </div>
            ))
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500">
              Profile Version 1 (Initial Setup)
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
