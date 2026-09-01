import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, TrendingDown, Sparkles, Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
  const { notifications, markNotificationRead } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <TrendingDown className="w-4 h-4 text-emerald-500" />;
      case 'info':
        return <Sparkles className="w-4 h-4 text-cyan-500" />;
      default:
        return <Lightbulb className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-850">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-4 transition cursor-pointer flex gap-3 ${
                  n.read 
                    ? 'opacity-70 bg-white dark:bg-slate-900' 
                    : 'bg-emerald-50/30 dark:bg-emerald-950/20 font-medium'
                } hover:bg-slate-50 dark:hover:bg-slate-800/60`}
              >
                <div className="mt-0.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{n.title}</p>
                    <span className="text-[10px] text-slate-400 shrink-0">{n.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 text-center border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              EcoAI Live Carbon Alerts Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
