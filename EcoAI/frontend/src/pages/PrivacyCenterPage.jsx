import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Download, Trash2, CheckCircle2, AlertTriangle, Sparkles, FileText } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PrivacyCenterPage() {
  const { user, logoutUser } = useAuth();
  const [consent, setConsent] = useState({
    analytics_consent: false,
    ai_consent: false,
    org_consent: false
  });
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchConsent = async () => {
      try {
        if (user) {
          const res = await api.getConsent();
          if (res) setConsent(res);
        }
      } catch (err) {
        console.warn("Fetch consent error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConsent();
  }, [user]);

  const handleToggle = async (key) => {
    const updated = { ...consent, [key]: !consent[key] };
    setConsent(updated);
    setSaveSuccess('');
    try {
      if (user) {
        await api.updateConsent({
          analytics_consent: updated.analytics_consent,
          ai_consent: updated.ai_consent,
          org_consent: updated.org_consent
        });
        setSaveSuccess("Privacy preferences updated successfully.");
        setTimeout(() => setSaveSuccess(''), 3000);
      }
    } catch (err) {
      console.warn("Consent update error:", err);
    }
  };

  const handleDownloadData = async () => {
    try {
      if (user) {
        const data = await api.exportUserData();
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ecoai_user_data_${user.id || 'export'}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert("Demo mode: Data export downloaded successfully.");
      }
    } catch (err) {
      alert("Failed exporting user data.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (user) {
        await api.deleteAccount();
        logoutUser();
      } else {
        logoutUser();
      }
    } catch (err) {
      alert("Account deletion error.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-[#16A66A] border-t-transparent animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500">Loading Privacy & Consent Center...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#123B2A] to-[#16A66A] p-6 sm:p-8 rounded-3xl text-white shadow-xl flex justify-between items-center">
        <div>
          <span className="text-xs font-black uppercase text-[#F4C95D] tracking-wider flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> Privacy & Consent Center
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mt-1">Data Control & Transparency</h1>
          <p className="text-xs text-[#DDF7E9]/80 mt-1">Inspect stored information, manage data-sharing permissions, or export records.</p>
        </div>
        <div className="hidden sm:block">
          <ShieldCheck className="w-12 h-12 text-[#F4C95D]" />
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[#16A66A] dark:text-[#34D399] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {saveSuccess}
        </div>
      )}

      {/* 1. DATA TRANSPARENCY CARD */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#16A66A]" /> What Information We Store & Why
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400">Account Credentials</span>
            <p className="text-slate-900 dark:text-white font-extrabold">Name & Email</p>
            <p className="text-[11px] font-medium text-slate-500">Required strictly for account authentication & security.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400">Carbon & Activity Metrics</span>
            <p className="text-slate-900 dark:text-white font-extrabold">Transport, Energy, Food, Waste</p>
            <p className="text-[11px] font-medium text-slate-500">Used to compute IPCC carbon footprints and Random Forest predictions.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400">Privacy Guarantee</span>
            <p className="text-[#16A66A] font-extrabold">No PII Sold or Exposed</p>
            <p className="text-[11px] font-medium text-slate-500">All data-sharing permissions default to OFF unless explicitly agreed.</p>
          </div>
        </div>
      </div>

      {/* 2. CONSENT TOGGLES */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md space-y-6">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#F4C95D]" /> Manage Data-Sharing Permissions
        </h2>

        <div className="space-y-4">
          
          {/* Toggle 1: Analytics */}
          <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">Platform Analytics Consent</h4>
              <p className="text-[11px] text-slate-500 font-medium">Allow anonymized usage analytics to help improve app navigation.</p>
            </div>
            <button
              onClick={() => handleToggle('analytics_consent')}
              className={`w-12 h-6 rounded-full transition p-1 cursor-pointer flex items-center ${consent.analytics_consent ? 'bg-[#16A66A] justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow" />
            </button>
          </div>

          {/* Toggle 2: AI Training */}
          <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">AI Model Improvement Consent</h4>
              <p className="text-[11px] text-slate-500 font-medium">Allow de-identified carbon data to train and improve the Random Forest prediction model.</p>
            </div>
            <button
              onClick={() => handleToggle('ai_consent')}
              className={`w-12 h-6 rounded-full transition p-1 cursor-pointer flex items-center ${consent.ai_consent ? 'bg-[#16A66A] justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow" />
            </button>
          </div>

          {/* Toggle 3: Org Aggregation */}
          <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">Organization / Regional Aggregation Consent</h4>
              <p className="text-[11px] text-slate-500 font-medium">Include de-identified carbon totals in regional sustainability reports (k-anonymity enforced).</p>
            </div>
            <button
              onClick={() => handleToggle('org_consent')}
              className={`w-12 h-6 rounded-full transition p-1 cursor-pointer flex items-center ${consent.org_consent ? 'bg-[#16A66A] justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow" />
            </button>
          </div>

        </div>
      </div>

      {/* 3. EXPORT & DELETE SECTION */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md space-y-6">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-cyan-500" /> Download & Data Erasure
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white">Export Personal Data</h4>
            <p className="text-[11px] text-slate-500 font-medium">Download a complete JSON file of your profile, carbon calculations, and AI predictions.</p>
            <button
              onClick={handleDownloadData}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs shadow flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Download className="w-4 h-4" /> Download My Data
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3">
            <h4 className="text-xs font-black text-rose-700 dark:text-rose-300">Delete Account & Erase Records</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Permanently remove your user account and erase all associated carbon history.</p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Trash2 className="w-4 h-4" /> Delete My Account
            </button>
          </div>
        </div>
      </div>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 max-w-md w-full p-6 sm:p-8 rounded-3xl border border-rose-500/30 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white">Confirm Account Deletion</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Are you sure you want to permanently delete your EcoAI account? This action will immediately remove your profile, predictions, and carbon history according to our data retention policy.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow cursor-pointer transition"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
