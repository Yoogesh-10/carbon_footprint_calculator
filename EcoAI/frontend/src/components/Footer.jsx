import React from 'react';
import { Leaf, Heart, Globe, Cpu, ShieldCheck, Sparkles } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="mt-20 border-t border-[#16A66A]/20 bg-gradient-to-b from-[#123B2A] to-[#0B2A1D] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1 */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#16A66A] to-[#14B8A6] flex items-center justify-center p-0.5 shadow-md">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black text-white">
                Eco<span className="text-[#16A66A]">AI</span>
              </span>
            </div>
            <p className="text-xs text-[#DDF7E9]/80 leading-relaxed mb-4">
              AI-driven platform empowering individuals to monitor, predict, and reduce carbon emissions with scientific precision.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-extrabold text-[#DDF7E9] bg-white/10 px-3 py-1 rounded-full border border-white/15 w-fit">
              <Cpu className="w-3.5 h-3.5 text-[#F4C95D]" /> Scikit-learn AI Engine Active
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#F4C95D] mb-3">
              Core Modules
            </h4>
            <ul className="space-y-2 text-xs text-[#DDF7E9]/80 font-semibold">
              <li><button onClick={() => setActiveTab('calculator')} className="hover:text-[#16A66A] transition cursor-pointer">Carbon Calculator</button></li>
              <li><button onClick={() => setActiveTab('dashboard')} className="hover:text-[#16A66A] transition cursor-pointer">Interactive Analytics</button></li>
              <li><button onClick={() => setActiveTab('twin')} className="hover:text-[#16A66A] transition cursor-pointer">Carbon Digital Twin</button></li>
              <li><button onClick={() => setActiveTab('history')} className="hover:text-[#16A66A] transition cursor-pointer">Emissions History</button></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#F4C95D] mb-3">
              AI & Technology
            </h4>
            <ul className="space-y-2 text-xs text-[#DDF7E9]/80 font-medium">
              <li className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#16A66A]" /> IPCC Benchmark Factors</li>
              <li className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-[#14B8A6]" /> RandomForest Regression</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#16A66A]" /> JWT Authentication</li>
              <li>MySQL & FastAPI REST</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#F4C95D] mb-3">
              Sustainability Mission
            </h4>
            <p className="text-xs italic text-[#DDF7E9] mb-2 font-semibold">
              "Know Your Carbon. Predict Your Future. Reduce Your Impact."
            </p>
            <p className="text-[11px] text-[#DDF7E9]/60 leading-relaxed">
              Designed as a modern SaaS platform for carbon monitoring & AI emission reduction prediction.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-[#DDF7E9]/60 gap-3">
          <p>© {new Date().getFullYear()} EcoAI Platform. All rights reserved.</p>
          <p className="flex items-center gap-1 font-semibold">
            Built with <Heart className="w-3.5 h-3.5 text-[#16A66A] fill-[#16A66A]" /> for Sustainable AI Innovation
          </p>
        </div>
      </div>
    </footer>
  );
}
