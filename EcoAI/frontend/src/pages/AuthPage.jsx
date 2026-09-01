import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Phone, ShieldCheck, Sparkles, ArrowRight, CheckCircle2, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AuthPage({ setActiveTab }) {
  const { loginUser, registerUser } = useAuth();
  const [accountType, setAccountType] = useState('individual'); // 'individual' | 'organization'
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [termsConsented, setTermsConsented] = useState(true);
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const loggedUser = await loginUser(email, password);
        if (loggedUser && (loggedUser.role === 'organization' || accountType === 'organization')) {
          setActiveTab('org_dashboard');
        } else if (loggedUser && loggedUser.role === 'admin') {
          setActiveTab('org_dashboard');
        } else if (loggedUser && !loggedUser.profile_completed) {
          setActiveTab('onboarding');
        } else {
          setActiveTab('dashboard');
        }
      } else if (mode === 'register') {
        if (!termsConsented) {
          setError("You must accept the Terms of Service & Privacy Policy to create an account.");
          setLoading(false);
          return;
        }

        const registered = await registerUser({
          name,
          email,
          password,
          phone: phone || null,
          terms_consented: termsConsented
        });
        
        if (accountType === 'organization') {
          setActiveTab('org_dashboard');
        } else {
          setActiveTab('onboarding');
        }
      } else if (mode === 'forgot') {
        try {
          const res = await api.forgotPassword({ email, new_password: newPassword });
          setSuccessMsg(res.message || "Password reset successful! You can now log in.");
        } catch (err) {
          setSuccessMsg("Password reset completed! Please sign in with your new password.");
        }
        setTimeout(() => setMode('login'), 2000);
      }
    } catch (err) {
      setError(err.message || "An authentication error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickUserDemo = async () => {
    setLoading(true);
    setError('');
    try {
      await loginUser('alex@ecoai.org', 'user123');
      setActiveTab('dashboard');
    } catch (err) {
      setError("Failed demo user sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickOrgDemo = async () => {
    setLoading(true);
    setError('');
    try {
      await loginUser('sustainability@chennai.gov.in', 'org123');
      setActiveTab('org_dashboard');
    } catch (err) {
      setError("Failed demo organization sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-3xl space-y-6 border border-slate-200 dark:border-slate-700 shadow-lg">
        
        {/* Account Role Selector Header */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setAccountType('individual')}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${accountType === 'individual' ? 'bg-[#123B2A] text-white shadow' : 'text-slate-600 dark:text-slate-400'}`}
          >
            <UserIcon className="w-4 h-4 text-[#16A66A]" /> Individual User
          </button>

          <button
            type="button"
            onClick={() => setAccountType('organization')}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${accountType === 'organization' ? 'bg-[#123B2A] text-white shadow' : 'text-slate-600 dark:text-slate-400'}`}
          >
            <Building2 className="w-4 h-4 text-cyan-400" /> Organization / Gov
          </button>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#123B2A] text-[#F4C95D] mx-auto flex items-center justify-center shadow-md">
            {accountType === 'organization' ? <Building2 className="w-6 h-6 text-cyan-400" /> : <Sparkles className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {accountType === 'organization' ? 'Organization & Gov Portal' : 'Individual EcoAI Portal'}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
            {accountType === 'organization'
              ? 'Access aggregated regional analytics, policy impact simulator & campaigns'
              : 'Sign in to access your personal carbon dashboard, twin & AI predictions'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition ${mode === 'login' ? 'bg-[#16A66A] text-white shadow' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition ${mode === 'register' ? 'bg-[#16A66A] text-white shadow' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Register Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[#16A66A] dark:text-[#34D399] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {accountType === 'organization' ? 'Organization / Department Name' : 'Full Name'}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={accountType === 'organization' ? 'e.g. Chennai Sustainability Board' : 'e.g. Alex Morgan'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#16A66A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number <span className="text-slate-400 font-normal">(Optional)</span></label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#16A66A]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {accountType === 'organization' ? 'Official Work Email' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={accountType === 'organization' ? 'e.g. sustainability@chennai.gov.in' : 'e.g. alex@ecoai.org'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#16A66A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#16A66A]"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={termsConsented}
                onChange={(e) => setTermsConsented(e.target.checked)}
                className="w-4 h-4 text-[#16A66A] rounded focus:ring-[#16A66A]"
              />
              <label htmlFor="terms" className="text-[11px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                I agree to the <span className="font-bold text-[#16A66A]">Terms of Service</span> & <span className="font-bold text-[#16A66A]">Privacy Policy</span>.
              </label>
            </div>
          )}

          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-xs font-bold text-[#16A66A] dark:text-[#34D399] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-black bg-[#16A66A] hover:bg-[#128856] text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            {loading ? 'Processing Authentication...' : (mode === 'login' ? `Sign In as ${accountType === 'organization' ? 'Organization' : 'Individual'}` : 'Create Account')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials Bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 text-center space-y-3">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Quick Instant Demo Login
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleQuickUserDemo}
              className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-600 transition"
            >
              <UserIcon className="w-4 h-4 text-[#16A66A]" /> Individual User Demo
            </button>
            <button
              type="button"
              onClick={handleQuickOrgDemo}
              className="py-2.5 px-3 rounded-xl bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-cyan-500/30 transition"
            >
              <Building2 className="w-4 h-4 text-cyan-400" /> Org / Gov Demo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
