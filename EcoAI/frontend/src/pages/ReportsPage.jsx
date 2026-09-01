import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Printer, Sparkles, CheckCircle2, ShieldCheck, User, Calendar, BarChart2, Target, Sliders, Info, Award } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportsPage() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef(null);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (user) {
        const data = await api.getReportData();
        setReportData(data);
      } else {
        setReportData({
          report_id: "ECO-RPT-DEMO-2026",
          generated_at: "August 17, 2026 - 10:30 UTC",
          user_profile: {
            name: "Alex Morgan",
            email: "alex@ecoai.org",
            city: "San Francisco",
            occupation: "Software Developer",
            eco_level: 3,
            eco_points: 280
          },
          current_emissions: {
            total_co2_kg: 186.0,
            carbon_score: 82,
            largest_source_message: "Your biggest emission source is Transportation.",
            record_date: "August 17, 2026"
          },
          category_breakdown: { Transportation: 96.0, Electricity: 45.0, Food: 30.0, Waste: 15.0, Lifestyle: 0.0 },
          explainable_analysis: {
            highest_source: "Transportation",
            percentages: { Transportation: 52.0, Electricity: 24.0, Food: 16.0, Waste: 8.0, Lifestyle: 0.0 },
            detailed_explanation: "Transportation is your largest emission source because your daily private vehicle usage is higher than your other activities."
          },
          historical_trend: [
            { date: "May 01, 2026", total_co2_kg: 220.0, transportation: 110.0, electricity: 60.0 },
            { date: "Jun 01, 2026", total_co2_kg: 205.0, transportation: 102.0, electricity: 55.0 },
            { date: "Jul 01, 2026", total_co2_kg: 186.0, transportation: 96.0, electricity: 45.0 }
          ],
          ai_prediction: {
            predicted_emission_kg: 194.0,
            highest_emission_source: "Transportation",
            confidence_score: 0.94,
            trend: "↑ Increasing",
            is_estimate: true
          },
          five_day_plan: {
            plan: [
              { day: 1, title: "Reduce unnecessary car travel", category: "Transportation", estimated_carbon_reduction_kg: 4.2, difficulty: "Easy" },
              { day: 2, title: "Reduce AC usage", category: "Electricity", estimated_carbon_reduction_kg: 3.1, difficulty: "Easy" },
              { day: 3, title: "Use public transport", category: "Transportation", estimated_carbon_reduction_kg: 5.0, difficulty: "Medium" },
              { day: 4, title: "Reduce food waste", category: "Food", estimated_carbon_reduction_kg: 2.8, difficulty: "Easy" },
              { day: 5, title: "Increase recycling", category: "Waste", estimated_carbon_reduction_kg: 2.5, difficulty: "Easy" }
            ]
          },
          top_3_actions: [
            { rank: 1, title: "Reduce car usage", estimated_reduction_kg: 18.0, effort: "Low", priority: "HIGH" },
            { rank: 2, title: "Reduce AC usage", estimated_reduction_kg: 9.0, effort: "Medium", priority: "HIGH" },
            { rank: 3, title: "Reduce food waste", estimated_reduction_kg: 5.0, effort: "Easy", priority: "MEDIUM" }
          ],
          simulation_results: {
            available: true,
            original_emission: 186.0,
            simulated_emission: 151.0,
            potential_reduction_kg: 35.0,
            label: "Estimated potential reduction"
          },
          goal_progress: {
            target_reduction_pct: 15.0,
            baseline_co2: 186.0,
            target_co2: 158.0,
            current_co2: 186.0,
            reduction_achieved_kg: 0.0,
            status: "In Progress 🚀"
          },
          ai_summary: {
            headline: "Comprehensive Carbon Audit for Alex Morgan",
            primary_driver: "Transportation is your largest emission source because your daily private vehicle usage is higher than your other activities.",
            insights: [
              "Your primary carbon footprint contributor is Transportation (52% of total).",
              "Implementing your Top 3 Actions can lower your emissions by up to 32 kg CO₂e monthly.",
              "Your current carbon efficiency score is 82/100."
            ]
          }
        });
      }
    } catch (err) {
      console.warn("Failed loading report data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [user]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const reportName = `EcoAI_Carbon_Report_${reportData ? reportData.report_id : 'Export'}.pdf`;

    try {
      if (reportRef.current) {
        const element = reportRef.current;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 1000
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(reportName);
        setDownloading(false);
        return;
      }
    } catch (err) {
      console.warn("Canvas capture exception, fallback:", err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-24 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#16A66A] border-t-transparent animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-8">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-[#123B2A] to-[#16A66A] p-6 rounded-3xl text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black text-[#F4C95D] bg-white/10 px-3 py-1 rounded-full mb-1">
            <FileText className="w-3.5 h-3.5" /> PDF Export Module (11 Sections)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Downloadable Carbon Report
          </h1>
          <p className="text-xs text-[#DDF7E9]/80 font-medium">Suitable for college project demonstration & academic evaluation.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 cursor-pointer"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-6 py-2.5 rounded-xl bg-[#F4C95D] text-[#123B2A] font-black text-xs shadow-lg hover:bg-yellow-400 flex items-center gap-2 cursor-pointer transition"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Exporting PDF...' : 'Download Complete PDF Report'}
          </button>
        </div>
      </div>

      {/* STYLED 11-SECTION REPORT PREVIEW CONTAINER */}
      <div ref={reportRef} className="bg-white text-slate-900 p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-200 space-y-8 font-sans">
        
        {/* Header Branding */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div>
            <span className="text-3xl font-black tracking-tight text-[#123B2A]">
              Eco<span className="text-[#16A66A]">AI</span>
            </span>
            <p className="text-xs text-slate-500 font-bold mt-1">Comprehensive Carbon Audit & Predictive Assessment Report</p>
          </div>
          <div className="text-right text-xs text-slate-500 space-y-0.5">
            <p className="font-extrabold text-[#123B2A]">{reportData.report_id}</p>
            <p>{reportData.generated_at}</p>
          </div>
        </div>

        {/* SECTION 1: User Information */}
        <div className="space-y-2">
          <h3 className="text-sm font-black text-[#123B2A] uppercase tracking-wider">1. User Information</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block">User Name</span>
              <span className="font-bold text-slate-800">{reportData.user_profile?.name}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Email</span>
              <span className="font-bold text-slate-800">{reportData.user_profile?.email}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">City & Occupation</span>
              <span className="font-bold text-slate-800">{reportData.user_profile?.city} • {reportData.user_profile?.occupation}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Eco Level & Points</span>
              <span className="font-bold text-[#16A66A]">Level {reportData.user_profile?.eco_level} ({reportData.user_profile?.eco_points} pts)</span>
            </div>
          </div>
        </div>

        {/* SECTION 2 & 3: Current Carbon Footprint & Carbon Score */}
        <div className="space-y-2">
          <h3 className="text-sm font-black text-[#123B2A] uppercase tracking-wider">2 & 3. Current Carbon Footprint & Carbon Score</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#DDF7E9]/50 border border-[#16A66A]/30 text-center">
              <p className="text-xs text-[#123B2A] font-bold uppercase">Total Carbon Footprint</p>
              <p className="text-3xl font-black text-[#16A66A]">{reportData.current_emissions?.total_co2_kg} kg CO₂e</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">{reportData.current_emissions?.largest_source_message}</p>
            </div>
            <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 text-center">
              <p className="text-xs text-cyan-800 font-bold uppercase">Carbon Score</p>
              <p className="text-3xl font-black text-cyan-600">{reportData.current_emissions?.carbon_score} / 100</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">High Efficiency Benchmark</p>
            </div>
          </div>
        </div>

        {/* SECTION 4: Category-Wise Emissions & Explainable AI */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-[#123B2A] uppercase tracking-wider">4. Category-Wise Emissions & AI Explanation</h3>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-bold text-center">
              {reportData.explainable_analysis?.percentages && Object.entries(reportData.explainable_analysis.percentages).map(([sec, pct]) => (
                <div key={sec} className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">{sec}</span>
                  <span className="text-[#16A66A] text-sm font-black">{pct}%</span>
                </div>
              ))}
            </div>
            <p className="text-slate-700 italic border-t pt-2">
              <strong>Explainable AI Rationale:</strong> "{reportData.explainable_analysis?.detailed_explanation}"
            </p>
          </div>
        </div>

        {/* SECTION 5: Historical Trend */}
        <div className="space-y-2">
          <h3 className="text-sm font-black text-[#123B2A] uppercase tracking-wider">5. Historical Trend</h3>
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-[#123B2A] text-white font-bold">
              <tr>
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Total CO₂e</th>
                <th className="p-2.5">Transportation</th>
                <th className="p-2.5">Electricity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {reportData.historical_trend?.map((h, idx) => (
                <tr key={idx}>
                  <td className="p-2.5 font-bold">{h.date}</td>
                  <td className="p-2.5 text-[#16A66A] font-extrabold">{h.total_co2_kg} kg</td>
                  <td className="p-2.5">{h.transportation} kg</td>
                  <td className="p-2.5">{h.electricity} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECTION 6: AI Prediction */}
        <div className="p-6 rounded-2xl bg-[#123B2A] text-white space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-extrabold text-[#F4C95D] flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> 6. AI Carbon Prediction
            </span>
            <span className="text-[#DDF7E9]/70 text-[10px] uppercase font-bold">Estimated Values</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-3">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Current Emissions</p>
              <p className="text-xl font-black">{reportData.current_emissions?.total_co2_kg} kg CO₂e</p>
            </div>
            <div>
              <p className="text-[10px] text-[#F4C95D] uppercase font-bold">Predicted Next Month</p>
              <p className="text-xl font-black text-[#F4C95D]">{reportData.ai_prediction?.predicted_emission_kg} kg CO₂e</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Trend</p>
              <p className="text-sm font-extrabold text-[#16A66A]">{reportData.ai_prediction?.trend}</p>
            </div>
          </div>
        </div>

        {/* SECTION 7: 5-Day Reduction Plan */}
        <div className="space-y-2">
          <h3 className="text-sm font-black text-[#123B2A] uppercase tracking-wider">7. 5-Day Reduction Plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            {reportData.five_day_plan?.plan?.map((dayItem) => (
              <div key={dayItem.day} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="px-2 py-0.5 rounded bg-[#123B2A] text-[#F4C95D] text-[9px] font-black uppercase">DAY {dayItem.day}</span>
                <p className="font-bold text-slate-800 mt-1 leading-tight">{dayItem.title}</p>
                <p className="text-[10px] text-[#16A66A] font-black mt-2">-{dayItem.estimated_carbon_reduction_kg || dayItem.target_reduction_kg} kg CO₂e</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 8: Top 3 Recommended Actions */}
        <div className="space-y-2">
          <h3 className="text-sm font-black text-[#123B2A] uppercase tracking-wider">8. Top 3 Recommended Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {reportData.top_3_actions?.map((act) => (
              <div key={act.rank} className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex justify-between font-black text-[#123B2A]">
                  <span>#{act.rank} {act.title}</span>
                  <span className="text-[#16A66A]">Priority: {act.priority || 'HIGH'}</span>
                </div>
                <p className="text-[#16A66A] font-bold mt-2">Potential Reduction: -{act.estimated_reduction_kg} kg CO₂e</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 9: What-If Simulation Results */}
        <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 space-y-2 text-xs">
          <h3 className="text-sm font-black text-cyan-900 uppercase tracking-wider">9. What-If Simulation Results</h3>
          <div className="flex justify-between items-baseline font-bold">
            <span>Original: {reportData.simulation_results?.original_emission} kg → Simulated: {reportData.simulation_results?.simulated_emission} kg</span>
            <span className="text-cyan-700 font-extrabold">{reportData.simulation_results?.label}: -{reportData.simulation_results?.potential_reduction_kg} kg CO₂e</span>
          </div>
        </div>

        {/* SECTION 10: Carbon Reduction Progress */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-xs">
          <h3 className="text-sm font-black text-amber-900 uppercase tracking-wider">10. 30-Day Goal Carbon Reduction Progress</h3>
          <div className="flex justify-between items-center font-bold">
            <span>Target: -{reportData.goal_progress?.target_reduction_pct}% ({reportData.goal_progress?.target_co2} kg CO₂e)</span>
            <span className="text-amber-700">{reportData.goal_progress?.status}</span>
          </div>
        </div>

        {/* SECTION 11: Final AI Summary & AI-Generated Insights */}
        <div className="p-6 rounded-2xl bg-slate-100 border border-slate-300 space-y-3">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">11. Final AI Summary & Insights</h3>
          <p className="text-xs font-bold text-[#123B2A]">{reportData.ai_summary?.headline}</p>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {reportData.ai_summary?.insights?.map((ins, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span>•</span>
                <span>{ins}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Report Footer */}
        <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
          <p>Generated automatically by EcoAI – Intelligent Carbon Footprint & Analytics Engine.</p>
          <p>Adheres strictly to standard IPCC greenhouse gas emission factor benchmarks.</p>
        </div>

      </div>

    </div>
  );
}
