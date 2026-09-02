import React, { useState, useRef, useEffect } from 'react';
import { 
  Leaf, 
  LayoutDashboard, 
  Calculator, 
  History, 
  FileText, 
  ShieldAlert, 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X, 
  Sparkles, 
  Sliders,
  Cpu,
  Upload,
  Activity,
  Trophy,
  ChevronDown,
  FolderKanban
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logoutUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  const aiRef = useRef(null);
  const toolsRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (aiRef.current && !aiRef.current.contains(e.target)) setAiDropdownOpen(false);
      if (toolsRef.current && !toolsRef.current.contains(e.target)) setToolsDropdownOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (activeTab === 'landing') return null;

  const isAdminView = activeTab === 'admin';

  const isAiActive = ['twin', 'habit', 'experiment', 'tradeoff'].includes(activeTab);
  const isToolsActive = ['scanner', 'history', 'reports'].includes(activeTab);

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setAiDropdownOpen(false);
    setToolsDropdownOpen(false);
  };

  // DEDICATED ADMIN PORTAL NAVBAR MODE
  if (isAdminView) {
    return (
      <header className="sticky top-0 z-40 w-full bg-[#123B2A] text-white border-b border-[#16A66A]/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#16A66A] to-[#14B8A6] flex items-center justify-center p-0.5 shadow">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  Eco<span className="text-[#16A66A]">AI</span> <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-[#F4C95D] text-[#123B2A]">ADMIN PORTAL</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition cursor-pointer shadow-sm"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-white leading-tight">{user?.name || "Administrator"}</p>
                    <p className="text-[10px] text-[#F4C95D] font-black uppercase">System Admin</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#16A66A] text-white flex items-center justify-center font-black text-sm shadow">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#123B2A] border border-[#16A66A]/40 shadow-2xl py-2 z-50 text-white">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-[#DDF7E9]/70 truncate">{user?.email}</p>
                    </div>

                    <button
                      onClick={() => { logoutUser(); setUserDropdownOpen(false); handleNavClick('auth'); }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out Admin
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-[#123B2A]/90 border-b border-[#16A66A]/20 transition-colors shadow-sm overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <div 
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#123B2A] via-[#16A66A] to-[#14B8A6] flex items-center justify-center shadow-md shadow-[#16A66A]/20 group-hover:scale-105 transition-transform p-0.5">
              <div className="w-full h-full rounded-[14px] bg-[#123B2A] flex items-center justify-center">
                <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-[#DDF7E9]" />
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#17231D] dark:text-white">
              Eco<span className="text-[#16A66A]">AI</span>
            </span>
          </div>

          {/* Creative Compact Grouped Navbar (Fits any desktop resolution cleanly) */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-white/10 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold">
            
            {/* 1. Home */}
            <button
              onClick={() => handleNavClick('landing')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'landing' ? 'bg-[#123B2A] text-white shadow' : 'text-[#17231D] dark:text-[#DDF7E9] hover:bg-white dark:hover:bg-white/10'
              }`}
            >
              <Leaf className="w-4 h-4 text-[#16A66A]" /> Home
            </button>

            {/* 2. Calculator */}
            <button
              onClick={() => handleNavClick('calculator')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'calculator' ? 'bg-[#123B2A] text-white shadow' : 'text-[#17231D] dark:text-[#DDF7E9] hover:bg-white dark:hover:bg-white/10'
              }`}
            >
              <Calculator className="w-4 h-4 text-[#16A66A]" /> Calculator
            </button>

            {/* 3. Dashboard */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-[#123B2A] text-white shadow' : 'text-[#17231D] dark:text-[#DDF7E9] hover:bg-white dark:hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#16A66A]" /> Dashboard
            </button>

            {/* 4. AI Features Dropdown */}
            <div className="relative" ref={aiRef}>
              <button
                onClick={() => { setAiDropdownOpen(!aiDropdownOpen); setToolsDropdownOpen(false); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
                  isAiActive ? 'bg-[#123B2A] text-white shadow' : 'text-[#17231D] dark:text-[#DDF7E9] hover:bg-white dark:hover:bg-white/10'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#F4C95D]" /> AI Features <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {aiDropdownOpen && (
                <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-white dark:bg-[#123B2A] border border-slate-200 dark:border-[#16A66A]/30 shadow-xl py-2 z-50 animate-fade-in space-y-0.5">
                  <button
                    onClick={() => handleNavClick('twin')}
                    className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2.5 transition ${activeTab === 'twin' ? 'text-[#16A66A] font-black' : 'text-slate-700 dark:text-slate-200'}`}
                  >
                    <Cpu className="w-4 h-4 text-[#16A66A]" /> Carbon Twin
                  </button>

                  <button
                    onClick={() => handleNavClick('habit')}
                    className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2.5 transition ${activeTab === 'habit' ? 'text-[#16A66A] font-black' : 'text-slate-700 dark:text-slate-200'}`}
                  >
                    <Activity className="w-4 h-4 text-[#14B8A6]" /> Habit Impact
                  </button>

                  <button
                    onClick={() => handleNavClick('experiment')}
                    className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2.5 transition ${activeTab === 'experiment' ? 'text-[#16A66A] font-black' : 'text-slate-700 dark:text-slate-200'}`}
                  >
                    <Trophy className="w-4 h-4 text-[#F4C95D]" /> Experiments
                  </button>

                  <button
                    onClick={() => handleNavClick('tradeoff')}
                    className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2.5 transition ${activeTab === 'tradeoff' ? 'text-[#16A66A] font-black' : 'text-slate-700 dark:text-slate-200'}`}
                  >
                    <Sliders className="w-4 h-4 text-[#16A66A]" /> Tradeoff Analyzer
                  </button>
                </div>
              )}
            </div>

            {/* 5. Tools & Records Dropdown */}
            <div className="relative" ref={toolsRef}>
              <button
                onClick={() => { setToolsDropdownOpen(!toolsDropdownOpen); setAiDropdownOpen(false); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
                  isToolsActive ? 'bg-[#123B2A] text-white shadow' : 'text-[#17231D] dark:text-[#DDF7E9] hover:bg-white dark:hover:bg-white/10'
                }`}
              >
                <FolderKanban className="w-4 h-4 text-[#16A66A]" /> Records <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {toolsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-[#123B2A] border border-slate-200 dark:border-[#16A66A]/30 shadow-xl py-2 z-50 animate-fade-in space-y-0.5">
                  <button
                    onClick={() => handleNavClick('scanner')}
                    className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2.5 transition ${activeTab === 'scanner' ? 'text-[#16A66A] font-black' : 'text-slate-700 dark:text-slate-200'}`}
                  >
                    <Upload className="w-4 h-4 text-[#16A66A]" /> Scan Bill
                  </button>

                  <button
                    onClick={() => handleNavClick('history')}
                    className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2.5 transition ${activeTab === 'history' ? 'text-[#16A66A] font-black' : 'text-slate-700 dark:text-slate-200'}`}
                  >
                    <History className="w-4 h-4 text-[#14B8A6]" /> Emissions History
                  </button>

                  <button
                    onClick={() => handleNavClick('reports')}
                    className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2.5 transition ${activeTab === 'reports' ? 'text-[#16A66A] font-black' : 'text-slate-700 dark:text-slate-200'}`}
                  >
                    <FileText className="w-4 h-4 text-[#F4C95D]" /> Download Reports
                  </button>
                </div>
              )}
            </div>

          </nav>

          {/* Controls & Auth User Pill */}
          <div className="flex items-center gap-2.5 shrink-0">
            <ThemeToggle />
            {user && <NotificationBell />}

            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 hover:bg-slate-50 transition cursor-pointer shadow-sm"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-[#17231D] dark:text-white leading-tight">{user.name}</p>
                    <p className="text-[10px] text-[#16A66A] font-extrabold uppercase">
                      {user.role}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#123B2A] to-[#16A66A] text-[#F4C95D] flex items-center justify-center font-black text-sm shadow">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#123B2A] border border-slate-200 dark:border-[#16A66A]/30 shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-white/10">
                      <p className="text-xs font-bold text-[#17231D] dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-[#DDF7E9]/70 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => { handleNavClick('profile'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-[#17231D] dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-[#16A66A]" /> View Profile
                    </button>

                    <button
                      onClick={() => { handleNavClick('privacy'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-[#17231D] dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-[#F4C95D]" /> Privacy & Consent
                    </button>

                    {(user.role === 'organization' || user.role === 'admin') && (
                      <button
                        onClick={() => { handleNavClick('org_dashboard'); setUserDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-cyan-600 dark:text-cyan-300 hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2 border-t border-slate-100 dark:border-white/10"
                      >
                        <FolderKanban className="w-4 h-4 text-cyan-500" /> Org & Gov Portal
                      </button>
                    )}

                    <button
                      onClick={() => { logoutUser(); setUserDropdownOpen(false); handleNavClick('auth'); }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 border-t border-slate-100 dark:border-white/10"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('auth')}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#123B2A] hover:bg-[#0B2A1D] text-white shadow-md transition-all cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#123B2A] dark:text-[#DDF7E9] hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#123B2A] px-4 pt-2 pb-4 space-y-1">
          <p className="text-[10px] font-black uppercase text-slate-400 px-3 pt-2">Navigation</p>
          <button onClick={() => handleNavClick('landing')} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl flex items-center gap-2">
            <Leaf className="w-4 h-4 text-[#16A66A]" /> Home
          </button>
          <button onClick={() => handleNavClick('calculator')} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#16A66A]" /> Calculator
          </button>
          <button onClick={() => handleNavClick('dashboard')} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-[#16A66A]" /> Dashboard
          </button>

          <p className="text-[10px] font-black uppercase text-[#F4C95D] px-3 pt-3">AI Features</p>
          <button onClick={() => handleNavClick('twin')} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#16A66A]" /> Carbon Twin
          </button>
          <button onClick={() => handleNavClick('habit')} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#14B8A6]" /> Habit Impact
          </button>
          <button onClick={() => handleNavClick('experiment')} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#F4C95D]" /> Carbon Experiments
          </button>
          <button onClick={() => handleNavClick('tradeoff')} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#16A66A]" /> Tradeoff Analyzer
          </button>

          <p className="text-[10px] font-black uppercase text-[#16A66A] px-3 pt-3">Records & Tools</p>
          <button onClick={() => handleNavClick('scanner')} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#16A66A]" /> Scan Bill
          </button>
          <button onClick={() => handleNavClick('history')} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl flex items-center gap-2">
            <History className="w-4 h-4 text-[#14B8A6]" /> History
          </button>
          <button onClick={() => handleNavClick('reports')} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#F4C95D]" /> Download Reports
          </button>
        </div>
      )}
    </header>
  );
}
