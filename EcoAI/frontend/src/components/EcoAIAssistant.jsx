import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Sparkles, HelpCircle, ArrowRight, User, Play, BarChart2, ShieldCheck, Target, Zap } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const QUICK_QUESTIONS = [
  { label: "💡 Why is my footprint high?", prompt: "Why is my carbon footprint high?" },
  { label: "🎯 What should I do today?", prompt: "What should I do today?" },
  { label: "🚗 Transport reduction plan", prompt: "How can I reduce transport emissions?" },
  { label: "⚡ Electricity reduction plan", prompt: "How can I reduce electricity emissions?" },
  { label: "🚗 What if I reduce car travel 30%?", prompt: "What happens if I reduce my car usage by 30%?" },
  { label: "🌱 Explain my prediction", prompt: "Explain my carbon prediction" },
  { label: "💰 Show my carbon budget", prompt: "Am I within my carbon budget?" }
];

export default function EcoAIAssistant({ externalPrompt, onNavigate, onRunTwin }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: `Hello ${user?.name || 'there'}! 👋 I am your personalized **EcoAI Assistant**. Ask me anything about your carbon footprint, 5-Day Challenge, predictions, or Carbon Twin!`,
      action_type: null,
      action_label: null
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Handle external prompt triggered from Day Cards
  useEffect(() => {
    if (externalPrompt) {
      setIsOpen(true);
      handleSendMessage(externalPrompt);
    }
  }, [externalPrompt]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMsg.trim();
    if (!query) return;

    const userMsgObj = { id: Date.now(), sender: "user", text: query };
    setMessages(prev => [...prev, userMsgObj]);
    if (!textToSend) setInputMsg('');
    setTyping(true);

    try {
      const res = await api.chatEcoAIAssistant(query);
      if (res && res.reply) {
        const aiMsgObj = {
          id: Date.now() + 1,
          sender: "ai",
          text: res.reply,
          action_type: res.action_type,
          action_label: res.action_label
        };
        setMessages(prev => [...prev, aiMsgObj]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: "I am having trouble connecting right now, but you can check your 5-Day Eco Challenge on your main dashboard!",
          action_type: "open_challenge",
          action_label: "View Challenge Plan"
        }
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleActionClick = (actionType) => {
    if ((actionType === "run_twin" || actionType === "carbon_twin" || actionType === "twin") && onRunTwin) {
      onRunTwin();
      setIsOpen(false);
    } else if (onNavigate) {
      let targetTab = 'dashboard';
      if (actionType === 'run_twin' || actionType === 'carbon_twin' || actionType === 'twin') {
        targetTab = 'twin';
      }
      onNavigate(targetTab);
      setIsOpen(false);

      setTimeout(() => {
        if (actionType === 'view_breakdown') {
          const el = document.getElementById('carbon-breakdown-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else if (actionType === 'open_challenge') {
          const el = document.getElementById('ai-5day-challenge-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else if (actionType === 'view_prediction') {
          const el = document.getElementById('prediction-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else if (actionType === 'view_budget') {
          const el = document.getElementById('carbon-budget-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-full bg-gradient-to-r from-[#16A66A] to-[#123B2A] text-white font-black text-xs shadow-2xl hover:scale-105 transition-all flex items-center gap-2 border border-[#16A66A]/40 cursor-pointer animate-bounce-short"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-emerald-300" />
          </div>
          <span>🌱 EcoAI Assistant</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        </button>
      )}

      {/* CHAT MODAL PANEL */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#16A66A]/40 shadow-2xl flex flex-col overflow-hidden animate-scale-in">
          
          {/* HEADER */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-[#123B2A] to-[#16A66A] text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-black text-sm flex items-center gap-1.5">
                  EcoAI Assistant <Sparkles className="w-3.5 h-3.5 text-[#F4C95D]" />
                </h3>
                <span className="text-[10px] text-emerald-200 font-semibold block">Personalized Carbon & Sustainability AI</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* CHAT FEED */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-medium">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-[#16A66A] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[80%] p-3.5 rounded-2xl space-y-2.5 ${
                  m.sender === 'user'
                    ? 'bg-[#16A66A] text-white font-bold rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                  {/* Interactive Action Button inside AI response */}
                  {m.sender === 'ai' && m.action_type && (
                    <button
                      onClick={() => handleActionClick(m.action_type)}
                      className="w-full py-2 px-3 rounded-xl bg-[#16A66A] hover:bg-[#128856] text-white font-black text-[11px] shadow flex items-center justify-center gap-1.5 cursor-pointer transition"
                    >
                      <Play className="w-3 h-3" /> {m.action_label || 'Take Action'}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold italic">
                <div className="w-6 h-6 rounded-xl bg-[#16A66A]/20 text-[#16A66A] flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <span>EcoAI is analyzing your carbon data...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* QUICK QUESTION BUTTONS HORIZONTAL CAROUSEL */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q.prompt)}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] whitespace-nowrap hover:border-[#16A66A] cursor-pointer transition"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* INPUT BAR */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask EcoAI about your footprint..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#16A66A]"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="p-2.5 rounded-xl bg-[#16A66A] hover:bg-[#128856] disabled:opacity-40 text-white cursor-pointer transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
