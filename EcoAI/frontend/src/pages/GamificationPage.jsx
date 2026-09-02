import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Trophy, 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Share2, 
  Sparkles, 
  Leaf, 
  Award, 
  Zap, 
  ArrowRight,
  TrendingUp,
  HeartHandshake,
  Bell,
  User as UserIcon,
  ChevronRight,
  Menu
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';

export default function GamificationPage({ setMobileSidebarOpen }) {
  const { user, updateUserData } = useAuth();
  
  const [gamification, setGamification] = useState(null);
  const [streakData, setStreakData] = useState({
    current_streak: 1,
    longest_streak: 7,
    eco_points: 390,
    weekly_progress: 2,
    total_weekly_challenges: 4,
    unlocked_badges: ["beginner", "green_starter"]
  });
  const [summary, setSummary] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [justClaimed, setJustClaimed] = useState(null);
  const [shareToast, setShareToast] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);

  // Level Names Configuration
  const getLevelInfo = (points) => {
    const pts = points || 0;
    if (pts < 100) return { level: 1, title: "Green Beginner", nextPts: 100, remaining: 100 - pts, pct: (pts / 100) * 100, nextTitle: "Eco Starter" };
    if (pts < 200) return { level: 2, title: "Eco Starter", nextPts: 200, remaining: 200 - pts, pct: ((pts - 100) / 100) * 100, nextTitle: "Green Explorer" };
    if (pts < 300) return { level: 3, title: "Green Explorer", nextPts: 300, remaining: 300 - pts, pct: ((pts - 200) / 100) * 100, nextTitle: "Eco Explorer" };
    if (pts < 500) return { level: 4, title: "Eco Explorer", nextPts: 500, remaining: 500 - pts, pct: ((pts - 300) / 200) * 100, nextTitle: "Eco Warrior" };
    if (pts < 800) return { level: 5, title: "Eco Warrior", nextPts: 800, remaining: 800 - pts, pct: ((pts - 500) / 300) * 100, nextTitle: "Climate Champion" };
    return { level: 6, title: "Climate Champion", nextPts: 1000, remaining: 0, pct: 100, nextTitle: "Max Level" };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user) {
        const [gRes, strkRes, chRes, sumRes] = await Promise.all([
          api.getGamification().catch(() => null),
          api.getStreak().catch(() => null),
          api.getChallenges().catch(() => null),
          api.getSummary().catch(() => null)
        ]);

        if (gRes) setGamification(gRes);
        if (strkRes) setStreakData(strkRes);
        if (chRes) setChallenges(chRes);
        if (sumRes) setSummary(sumRes);
      } else {
        // Fallback demo data
        setGamification({
          user_id: 1,
          eco_points: 390,
          streak_days: 1,
          level: 4,
          badges: ["beginner", "green_starter", "eco_warrior"]
        });
        setStreakData({
          current_streak: 1,
          longest_streak: 7,
          eco_points: 390,
          weekly_progress: 2,
          total_weekly_challenges: 4,
          unlocked_badges: ["beginner", "green_starter", "eco_warrior"]
        });
        setChallenges([
          { 
            id: "ch_public_transit", 
            title: "Use Public Transport", 
            icon: "🚌", 
            points: 50, 
            description: "Commute via public transit or electric bus twice this week to cut solo car trip emissions.", 
            completed: true, 
            progress: 100,
            bgColor: "bg-gradient-to-br from-blue-50/90 to-emerald-50/90 dark:from-blue-950/40 dark:to-emerald-950/40 border-blue-200/60 dark:border-blue-800/40"
          },
          { 
            id: "ch_reduce_electricity", 
            title: "Energy Saving", 
            icon: "💡", 
            points: 40, 
            description: "Unplug standby electronics and keep thermostat at 24°C all week.", 
            completed: true, 
            progress: 100,
            bgColor: "bg-gradient-to-br from-amber-50/90 to-yellow-50/90 dark:from-amber-950/40 dark:to-yellow-950/40 border-amber-200/60 dark:border-amber-800/40"
          },
          { 
            id: "ch_recycle_waste", 
            title: "Household Recycling", 
            icon: "♻️", 
            points: 35, 
            description: "Separate 100% of dry plastic, glass, and cardboard recyclables for local processing.", 
            completed: false, 
            progress: 80,
            bgColor: "bg-gradient-to-br from-emerald-50/90 to-teal-50/90 dark:from-emerald-950/40 dark:to-teal-950/40 border-emerald-200/60 dark:border-emerald-800/40"
          },
          { 
            id: "ch_walk_cycle", 
            title: "Walking & Cycling", 
            icon: "🚴", 
            points: 45, 
            description: "Choose active walking or cycling for short-distance trips under 3 km.", 
            completed: false, 
            progress: 50,
            bgColor: "bg-gradient-to-br from-teal-50/90 to-cyan-50/90 dark:from-teal-950/40 dark:to-cyan-950/40 border-teal-200/60 dark:border-teal-800/40"
          }
        ]);
        setSummary({
          carbon_score: 72,
          total_footprint: 186.0
        });
      }
    } catch (err) {
      console.warn("Failed fetching gamification data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleClaim = async (challengeId, pts) => {
    setClaiming(challengeId);
    try {
      if (user) {
        const res = await api.claimChallenge(challengeId);
        if (res) {
          setJustClaimed({ id: challengeId, pts: pts || 50 });
          if (res.new_points) {
            updateUserData({ eco_points: res.new_points, level: res.level, streak_days: res.current_streak });
          }
          fetchData();
        }
      } else {
        setJustClaimed({ id: challengeId, pts: pts || 50 });
        setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, completed: true, progress: 100 } : c));
      }
    } catch (err) {
      alert(err.message || "Failed completing challenge.");
    } finally {
      setClaiming(null);
      setTimeout(() => setJustClaimed(null), 3000);
    }
  };

  const handleShare = () => {
    const text = `🌿 EcoAI Journey: I'm on a ${streakData.current_streak}-Day Green Streak with ${streakData.eco_points} Eco Points! Join me in building a sustainable future! 🌍`;
    navigator.clipboard.writeText(text);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen eco-bg-pattern flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-14 h-14 rounded-full border-4 border-[#16A66A] border-t-transparent animate-spin" />
        <p className="text-sm font-bold text-[#123B2A] dark:text-[#DDF7E9]">Loading Green Streak Experience...</p>
      </div>
    );
  }

  // Real parameters extraction
  const ecoPoints = streakData.eco_points || (gamification ? gamification.eco_points : 390);
  const currentStreak = streakData.current_streak || 1;
  const longestStreak = streakData.longest_streak || 7;
  const carbonScore = summary && summary.carbon_score ? summary.carbon_score : 72;
  const levelInfo = getLevelInfo(ecoPoints);

  // Badge Definitions with tailored visual styles
  const allBadgesList = [
    {
      id: "beginner",
      title: "Beginner",
      icon: "🌱",
      reqText: "Calculated your first carbon footprint profile.",
      requirement: "Calculate 1 carbon footprint",
      themeBg: "bg-gradient-to-br from-[#DDF7E9] to-[#C2F0D5] dark:from-[#123B2A] dark:to-[#0D2E20]",
      accentBorder: "border-[#16A66A]/40",
      badgeColor: "bg-[#16A66A] text-white"
    },
    {
      id: "green_starter",
      title: "Green Starter",
      icon: "🌿",
      reqText: "Maintained a 3-day green reduction streak.",
      requirement: "Reach a 3-day Green Streak",
      themeBg: "bg-gradient-to-br from-[#16A66A]/20 to-[#14B8A6]/20 dark:from-[#16A66A]/30 dark:to-[#14B8A6]/30",
      accentBorder: "border-[#16A66A]",
      badgeColor: "bg-[#16A66A] text-white"
    },
    {
      id: "eco_warrior",
      title: "Eco Warrior",
      icon: "🌳",
      reqText: "Reached a 7-day green streak & 250+ Eco Points.",
      requirement: "Reach a 7-day streak & 250+ Pts",
      themeBg: "bg-gradient-to-br from-[#123B2A]/30 via-[#16A66A]/20 to-[#F4C95D]/20",
      accentBorder: "border-[#F4C95D]",
      badgeColor: "bg-gradient-to-r from-[#123B2A] to-[#F4C95D] text-white"
    },
    {
      id: "climate_champion",
      title: "Climate Champion",
      icon: "🌍",
      reqText: "Mastered a 14-day streak & top reduction goals.",
      requirement: "Reach a 14-day streak & top goal",
      themeBg: "bg-gradient-to-br from-[#14B8A6]/20 via-[#16A66A]/20 to-[#F4C95D]/30",
      accentBorder: "border-[#14B8A6]",
      badgeColor: "bg-gradient-to-r from-[#14B8A6] to-[#F4C95D] text-[#123B2A]"
    }
  ];

  const unlockedBadgeIds = gamification && gamification.badges 
    ? gamification.badges 
    : (streakData.unlocked_badges || ["beginner", "green_starter"]);

  const completedChallengesCount = challenges.filter(c => c.completed).length;
  const totalChallengesCount = challenges.length || 4;
  const allWeeklyCompleted = completedChallengesCount === totalChallengesCount;

  return (
    <div className="min-h-screen eco-bg-pattern py-8 px-4 sm:px-8 lg:px-12 space-y-10 selection:bg-[#16A66A] selection:text-white">
      
      {/* 4. TOP HEADER BAR */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#16A66A]/15">
        
        {/* Mobile Menu Trigger & Title */}
        <div className="flex items-center gap-3">
          {setMobileSidebarOpen && (
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2.5 rounded-2xl bg-white dark:bg-[#123B2A] border border-[#16A66A]/30 text-[#123B2A] dark:text-[#DDF7E9] shadow-sm cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDF7E9] dark:bg-[#123B2A] text-[#16A66A] text-[11px] font-extrabold mb-1">
              <Sparkles className="w-3.5 h-3.5" /> GAMIFIED SUSTAINABILITY
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#17231D] dark:text-white tracking-tight flex items-center gap-2.5">
              🌿 Green Streak & Challenges
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#4B6354] dark:text-[#94B3A1]">
              Build green habits. Earn rewards. Make a bigger impact.
            </p>
          </div>
        </div>

        {/* Right Header Badges */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          
          {/* ⭐ 390 EcoPts Gold Pill */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#F4C95D] to-[#E8A838] text-[#123B2A] font-black text-xs sm:text-sm shadow-md shadow-[#F4C95D]/30 border border-amber-200/50 transform hover:scale-105 transition-transform">
            <span className="text-base animate-bounce">⭐</span>
            <span>{ecoPoints} EcoPts</span>
          </div>

          {/* Notification Bell */}
          <div className="p-2.5 rounded-full bg-white dark:bg-[#123B2A] border border-[#16A66A]/20 shadow-sm">
            <NotificationBell />
          </div>

          {/* User Avatar Pill */}
          <div className="flex items-center gap-2.5 p-1.5 pr-4 rounded-full bg-white dark:bg-[#123B2A] border border-[#16A66A]/20 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#123B2A] to-[#16A66A] text-white flex items-center justify-center font-extrabold text-xs shadow">
              {user?.name ? user.name.charAt(0) : 'Y'}
            </div>
            <span className="text-xs font-bold text-[#17231D] dark:text-white hidden md:inline">
              {user?.name || "Yoogesh S"}
            </span>
          </div>

        </div>
      </header>

      {/* 5. GREEN STREAK HERO SECTION */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#123B2A] via-[#0D2E20] to-[#16A66A] p-6 sm:p-10 lg:p-12 text-white shadow-2xl">
        
        {/* Floating background leaf particles */}
        <div className="absolute top-6 right-12 opacity-15 pointer-events-none animate-float-leaf">
          <Leaf className="w-32 h-32 text-[#DDF7E9]" />
        </div>
        <div className="absolute bottom-4 left-1/3 opacity-10 pointer-events-none animate-float-leaf" style={{ animationDelay: '2s' }}>
          <Leaf className="w-20 h-20 text-[#14B8A6]" />
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
          
          {/* Hero Left Content */}
          <div className="space-y-4 text-center lg:text-left flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#DDF7E9] text-xs font-extrabold">
              🔥 Keep your streak alive!
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              🔥 {currentStreak}-Day Green Streak
            </h2>

            <p className="text-base font-semibold text-[#DDF7E9]/90 italic">
              "Consistency today, a greener tomorrow."
            </p>

            <p className="text-xs text-[#DDF7E9]/70 max-w-md leading-relaxed">
              Log daily zero-carbon actions to earn bonus points, level up your Sustainability Tier, and unlock rare environmental badges.
            </p>
          </div>

          {/* Large Circular Animated Streak Indicator */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-[#16A66A] via-[#F4C95D] to-[#14B8A6] p-1.5 shadow-2xl animate-flame-pulse flex items-center justify-center">
              
              {/* Outer decorative ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/30 animate-spin-slow pointer-events-none" />

              <div className="w-full h-full rounded-full bg-[#123B2A] flex flex-col items-center justify-center p-4 text-center border-4 border-[#0B2A1D]">
                <Flame className="w-12 h-12 text-[#F4C95D] fill-[#F4C95D] mb-1 animate-pulse" />
                <span className="text-4xl font-black text-white leading-none tracking-tight">{currentStreak}</span>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#F4C95D] mt-1">DAY STREAK</span>
              </div>
            </div>
          </div>

        </div>

        {/* 4 Glassmorphism Statistic Cards Grid Over Hero */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10 pt-8 border-t border-white/10 relative z-10">
          
          {/* Current Streak */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center hover-lift">
            <div className="text-[#F4C95D] text-xl font-black flex items-center justify-center gap-1.5">
              <span>🔥</span> {currentStreak} Day
            </div>
            <span className="text-[11px] font-extrabold text-[#DDF7E9]/70 uppercase tracking-wider block mt-1">Current Streak</span>
          </div>

          {/* Longest Streak */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center hover-lift">
            <div className="text-[#16A66A] text-xl font-black flex items-center justify-center gap-1.5">
              <span>🏆</span> {longestStreak} Days
            </div>
            <span className="text-[11px] font-extrabold text-[#DDF7E9]/70 uppercase tracking-wider block mt-1">Longest Streak</span>
          </div>

          {/* Eco Points */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center hover-lift">
            <div className="text-[#F4C95D] text-xl font-black flex items-center justify-center gap-1.5">
              <span>⭐</span> {ecoPoints}
            </div>
            <span className="text-[11px] font-extrabold text-[#DDF7E9]/70 uppercase tracking-wider block mt-1">Eco Points</span>
          </div>

          {/* Level */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center hover-lift">
            <div className="text-[#14B8A6] text-xl font-black flex items-center justify-center gap-1.5">
              <span>🛡</span> Level {levelInfo.level}
            </div>
            <span className="text-[11px] font-extrabold text-[#DDF7E9]/70 uppercase tracking-wider block mt-1">Sustainability Rank</span>
          </div>

        </div>
      </section>

      {/* TWO COLUMN ROW: CARBON SCORE (LEFT) & ECO POINTS LEVEL SYSTEM (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 10. CARBON SCORE CARD (5 cols) */}
        <div className="lg:col-span-5 glass-card p-6 sm:p-8 rounded-[28px] space-y-6 flex flex-col justify-between hover-lift">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#4B6354] dark:text-[#94B3A1] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#16A66A]" /> Carbon Score Assessment
            </h3>
            <span className="text-xs font-black text-[#16A66A] bg-[#DDF7E9] dark:bg-[#123B2A] px-3 py-1 rounded-full border border-[#16A66A]/20">
              ↓ 8% from last month
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
            
            {/* SVG Circular Progress Ring */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#16A66A] transition-all duration-1000 ease-out"
                  strokeDasharray={`${carbonScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-[#17231D] dark:text-white leading-none">{carbonScore}</span>
                <span className="text-xs font-bold text-[#4B6354]">/ 100</span>
              </div>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <p className="text-lg font-black text-[#17231D] dark:text-white leading-snug">
                Great job!
              </p>
              <p className="text-xs font-semibold text-[#16A66A]">
                Your footprint is improving.
              </p>
              <p className="text-xs text-[#4B6354] dark:text-[#94B3A1] leading-relaxed">
                Calculated from your monthly emission record of <strong>{summary?.total_footprint || 186} kg CO₂e</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* 9. ECO POINTS LEVEL SYSTEM (7 cols) */}
        <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-[28px] space-y-6 flex flex-col justify-between hover-lift">
          
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="text-[11px] font-extrabold text-[#F4C95D] uppercase tracking-wider block mb-1">
                Level System
              </span>
              <h3 className="text-2xl font-black text-[#17231D] dark:text-white flex items-center gap-2">
                LEVEL {levelInfo.level} — {levelInfo.title.toUpperCase()}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 text-[#123B2A] dark:text-[#F4C95D] font-black text-lg bg-[#F4C95D] px-4 py-2 rounded-2xl shadow-sm">
              <span>⭐</span> {ecoPoints} <span className="text-xs font-bold">Pts</span>
            </div>
          </div>

          {/* Level Progress Bar & Info */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-extrabold text-[#17231D] dark:text-white">
              <span>{ecoPoints} / {levelInfo.nextPts} Eco Points</span>
              <span className="text-[#16A66A]">{levelInfo.remaining} points to Level {levelInfo.level + 1}</span>
            </div>

            {/* Custom Gold + Emerald Gradient Bar */}
            <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-[#F4C95D] via-[#16A66A] to-[#14B8A6] rounded-full transition-all duration-700" 
                style={{ width: `${Math.min(100, Math.max(8, levelInfo.pct))}%` }}
              />
            </div>

            <p className="text-xs font-medium text-[#4B6354] dark:text-[#94B3A1] italic pt-1">
              "Keep going — you're almost an {levelInfo.nextTitle}!"
            </p>
          </div>

          {/* Level Ranks Visual Indicator */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 text-center text-[10px] font-extrabold">
            {["Beginner", "Eco Starter", "Explorer", "Eco Explorer", "Eco Warrior", "Champion"].map((rankTitle, idx) => {
              const rLvl = idx + 1;
              const isAchieved = levelInfo.level >= rLvl;
              return (
                <div 
                  key={rankTitle}
                  className={`p-2 rounded-xl border transition-all ${
                    isAchieved 
                      ? 'bg-[#16A66A]/15 border-[#16A66A] text-[#16A66A] dark:text-[#DDF7E9]' 
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                  }`}
                >
                  Lvl {rLvl} {rankTitle}
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* 6. ACHIEVEMENT BADGES SECTION */}
      <section className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#17231D] dark:text-white flex items-center gap-2.5">
              <Award className="w-6 h-6 text-[#16A66A]" />
              Achievement Badges
            </h2>
            <p className="text-xs font-medium text-[#4B6354] dark:text-[#94B3A1]">
              Earn badges automatically as your Green Streak and Eco Points milestone grow.
            </p>
          </div>

          <button
            onClick={() => setShowAllBadges(!showAllBadges)}
            className="px-4 py-2 rounded-2xl bg-white dark:bg-[#123B2A] border border-[#16A66A]/20 hover:bg-[#DDF7E9]/50 text-[#123B2A] dark:text-[#DDF7E9] font-extrabold text-xs cursor-pointer shadow-sm transition-all"
          >
            {showAllBadges ? 'Show Main Badges' : 'View All Badges'}
          </button>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allBadgesList.map((badge) => {
            const isUnlocked = unlockedBadgeIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`glass-card p-6 rounded-[28px] space-y-4 relative flex flex-col justify-between border-2 transition-all duration-300 ${
                  isUnlocked
                    ? `${badge.themeBg} ${badge.accentBorder} badge-unlocked-glow scale-[1.02]`
                    : 'opacity-60 grayscale bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    
                    {/* Badge Illustrated Icon */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-md ${isUnlocked ? 'bg-white/80 dark:bg-[#123B2A]/80' : 'bg-slate-200 dark:bg-slate-800'}`}>
                      {badge.icon}
                    </div>

                    {isUnlocked ? (
                      <span className="px-3 py-1 rounded-full bg-[#16A66A] text-white text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" /> UNLOCKED
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> LOCKED
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-xl text-[#17231D] dark:text-white">{badge.title}</h3>
                  <p className="text-xs font-medium text-[#4B6354] dark:text-[#94B3A1] mt-1 leading-relaxed">
                    {badge.reqText}
                  </p>
                </div>

                <div className="pt-4 border-t border-black/10 dark:border-white/10 text-xs font-bold">
                  {isUnlocked ? (
                    <span className="text-[#16A66A] dark:text-[#DDF7E9] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#16A66A]" /> Badge Unlocked & Active
                    </span>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400 font-semibold block">
                      🔒 Requirement: {badge.requirement}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7 & 8. WEEKLY CHALLENGES & PROGRESS SECTION */}
      <section className="space-y-6 pt-2">
        
        {/* Challenge Progress Header */}
        <div className="glass-card p-6 sm:p-8 rounded-[28px] space-y-4 border-[#16A66A]/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#16A66A] uppercase tracking-wider mb-1">
                <Zap className="w-4 h-4 text-[#F4C95D]" /> ⚡ Weekly Challenges
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#17231D] dark:text-white">
                Complete challenges, earn Eco Points and extend your Green Streak.
              </h2>
            </div>
            
            <div className="px-4 py-2 rounded-2xl bg-[#16A66A]/15 text-[#16A66A] font-black text-sm shrink-0 border border-[#16A66A]/30">
              {completedChallengesCount} / {totalChallengesCount} COMPLETED
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-[#16A66A] to-[#14B8A6] rounded-full transition-all duration-700" 
              style={{ width: `${(completedChallengesCount / totalChallengesCount) * 100}%` }}
            />
          </div>

          {/* Celebration Animation Banner when completed */}
          {allWeeklyCompleted && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#DDF7E9] to-[#16A66A]/20 border border-[#16A66A] text-[#123B2A] dark:text-[#DDF7E9] text-xs font-bold flex items-center gap-4 animate-bounce">
              <span className="text-3xl">🎉</span>
              <div>
                <p className="text-base font-black">🎉 Weekly Goal Completed!</p>
                <p className="font-semibold text-[#16A66A]">Fantastic! You have completed all sustainability challenges for this week.</p>
              </div>
            </div>
          )}
        </div>

        {/* 2x2 Challenge Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((ch) => (
            <div 
              key={ch.id} 
              className={`glass-card p-6 sm:p-8 rounded-[28px] space-y-5 flex flex-col justify-between border ${ch.bgColor || 'bg-white'} hover-lift relative overflow-hidden`}
            >
              <div>
                <div className="flex justify-between items-start mb-3 gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 shadow-sm shrink-0">
                      {ch.icon || "🚌"}
                    </span>
                    <h3 className="font-black text-lg text-[#17231D] dark:text-white leading-snug">
                      {ch.title}
                    </h3>
                  </div>

                  <span className="px-3.5 py-1.5 rounded-full bg-[#F4C95D] text-[#123B2A] font-black text-xs shrink-0 shadow-sm">
                    +{ch.points} Eco Points
                  </span>
                </div>

                <p className="text-xs font-medium text-[#4B6354] dark:text-[#94B3A1] leading-relaxed pt-1">
                  {ch.description}
                </p>
              </div>

              {/* Progress & Complete Button */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-extrabold text-[#4B6354] dark:text-[#94B3A1]">
                    <span>Challenge Progress</span>
                    <span>{ch.completed ? '100%' : `${ch.progress || 80}%`}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200/70 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#16A66A] to-[#14B8A6] rounded-full transition-all"
                      style={{ width: `${ch.completed ? 100 : (ch.progress || 80)}%` }}
                    />
                  </div>
                </div>

                {ch.completed ? (
                  <div className="w-full py-3 rounded-2xl bg-[#16A66A]/15 border border-[#16A66A]/40 text-[#16A66A] dark:text-[#DDF7E9] font-black text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A66A]" /> Completed (+{ch.points} Eco Points)
                  </div>
                ) : (
                  <button
                    onClick={() => handleClaim(ch.id, ch.points)}
                    disabled={claiming === ch.id}
                    className="w-full py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-[#16A66A] to-[#14B8A6] hover:from-[#123B2A] hover:to-[#16A66A] text-white shadow-lg shadow-[#16A66A]/25 transition-all cursor-pointer"
                  >
                    {claiming === ch.id ? 'Claiming Points...' : 'Complete Challenge'}
                  </button>
                )}
              </div>

              {/* Points Claim Toast Popup */}
              {justClaimed && justClaimed.id === ch.id && (
                <div className="absolute top-4 right-4 bg-[#F4C95D] text-[#123B2A] px-3.5 py-1.5 rounded-full text-xs font-black animate-bounce shadow-xl border border-amber-300">
                  +{justClaimed.pts} Eco Points!
                </div>
              )}

            </div>
          ))}
        </div>
      </section>

      {/* 11. MOTIVATIONAL FOOTER BANNER */}
      <footer className="rounded-[28px] bg-gradient-to-r from-[#DDF7E9] via-[#B6EED1] to-[#16A66A] p-8 sm:p-12 text-[#123B2A] space-y-6 relative overflow-hidden shadow-xl">
        <div className="absolute -right-8 -bottom-8 opacity-20 pointer-events-none animate-float-leaf">
          <Leaf className="w-56 h-56 text-[#123B2A]" />
        </div>

        <div className="max-w-2xl space-y-2 relative z-10">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            "Small steps today, a better planet tomorrow."
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-[#123B2A]/80">
            Keep your streak alive and inspire others to adopt zero-carbon lifestyle habits.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-4 relative z-10">
          <button
            onClick={handleShare}
            className="px-6 py-3.5 rounded-2xl bg-[#123B2A] hover:bg-[#0B2A1D] text-white font-black text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-2.5 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-[#F4C95D]" /> 🌱 Share My Progress
          </button>
          
          {shareToast && (
            <span className="text-xs font-extrabold text-[#123B2A] bg-white px-4 py-2 rounded-xl shadow-md animate-fade-in">
              ✨ Copied streak & score to clipboard! 🌿
            </span>
          )}
        </div>
      </footer>

    </div>
  );
}
