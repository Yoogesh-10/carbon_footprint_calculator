import React from 'react';
import { 
  Flame, 
  LayoutDashboard, 
  Calculator, 
  Sliders, 
  History, 
  FileText, 
  Award, 
  Leaf, 
  User, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const { user } = useAuth();

  const navItems = [
    { id: 'gamification', label: 'Green Streak', icon: Flame, badge: 'Active' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'twin', label: 'Carbon Twin', icon: Sliders },
    { id: 'history', label: 'History', icon: History },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const carbonScore = 72;
  const userName = user?.name || "Yoogesh S";
  const userRole = user?.level_title || "Eco Explorer";

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-72 
        bg-gradient-to-b from-[#123B2A] to-[#0B2A1D] 
        text-white flex flex-col justify-between p-6 shadow-2xl
        transition-transform duration-300 ease-in-out shrink-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Header & Logo */}
        <div className="space-y-8">
          <div 
            onClick={() => handleNavClick('landing')} 
            className="cursor-pointer group flex items-center gap-3.5 pt-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#16A66A] to-[#14B8A6] p-0.5 shadow-lg shadow-[#16A66A]/30 group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#123B2A] flex items-center justify-center">
                <span className="text-2xl animate-float-leaf">🌿</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                Eco<span className="text-[#16A66A]">AI</span>
              </h1>
              <p className="text-[11px] font-medium text-[#DDF7E9]/70 tracking-wide">
                Live Green. Inspire Change.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#DDF7E9]/50 px-3 pb-1">
              Menu
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold
                    transition-all duration-300 group cursor-pointer relative overflow-hidden
                    ${isActive 
                      ? 'bg-[#DDF7E9] text-[#123B2A] shadow-lg shadow-[#16A66A]/20 scale-[1.02]' 
                      : 'text-[#DDF7E9]/80 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  {/* Subtle Glow for Active Green Streak */}
                  {isActive && (
                    <div className="absolute inset-0 bg-[#16A66A]/20 blur-md pointer-events-none" />
                  )}

                  <div className="flex items-center gap-3.5 relative z-10">
                    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-[#16A66A]' : 'text-[#14B8A6]'}`} />
                    <span className="tracking-wide">{item.label}</span>
                  </div>

                  {item.badge && isActive && (
                    <span className="text-[9px] font-black uppercase bg-[#16A66A] text-white px-2 py-0.5 rounded-full relative z-10 shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Carbon Score & User Info */}
        <div className="space-y-5 pt-6 border-t border-white/10">
          
          {/* Carbon Score Widget */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-all">
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#16A66A] transition-all duration-1000"
                  strokeDasharray={`${carbonScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-black text-white leading-none">{carbonScore}</span>
                <span className="text-[8px] font-bold text-[#DDF7E9]/60">/100</span>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#DDF7E9]/70">
                Carbon Score
              </p>
              <p className="text-xs font-black text-white mt-0.5">
                {carbonScore} / 100
              </p>
              <p className="text-[10px] font-medium text-[#16A66A] flex items-center gap-1 mt-0.5">
                <span>↑</span> High Efficiency
              </p>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 truncate">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#16A66A] to-[#F4C95D] text-[#123B2A] flex items-center justify-center font-black text-sm shadow-md shrink-0">
                {userName.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate leading-tight">{userName}</p>
                <p className="text-[10px] font-semibold text-[#F4C95D] flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3 h-3" /> {userRole}
                </p>
              </div>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}
