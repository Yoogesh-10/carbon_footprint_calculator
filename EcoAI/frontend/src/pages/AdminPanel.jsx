import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { 
  ShieldAlert, 
  Users, 
  BarChart3, 
  Plus, 
  Trash2, 
  Download, 
  CheckCircle2, 
  Cpu, 
  Sparkles, 
  Eye, 
  X, 
  Activity, 
  Car, 
  Zap, 
  Utensils, 
  Trash, 
  Calendar,
  Filter,
  CheckSquare,
  RefreshCw,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement
);

export default function AdminPanel({ setActiveTab }) {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [modelPerf, setModelPerf] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [trainingMsg, setTrainingMsg] = useState('');
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Active Tab View: 'analytics' | 'audit'
  const [adminSubTab, setAdminSubTab] = useState('analytics');

  // Filters
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [daysFilter, setDaysFilter] = useState(365);

  // Selected User Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFootprintDetail, setUserFootprintDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user && user.role === 'admin') {
        const filters = { city: selectedCity, category: selectedCategory, days: daysFilter };
        const [uRes, sRes, rRes, mRes, aRes] = await Promise.all([
          api.getAdminUsers(selectedCity).catch(() => []),
          api.getAdminStats(filters).catch(() => null),
          api.getRecommendations().catch(() => []),
          api.getModelPerformance().catch(() => null),
          api.getAuditLogs().catch(() => [])
        ]);
        setUsersList(uRes);
        setStats(sRes);
        setRecommendations(rRes);
        if (mRes) setModelPerf(mRes);
        if (aRes) setAuditLogs(aRes);
      } else {
        setUsersList([
          { id: 1, name: "System Administrator", email: "admin@ecoai.org", role: "admin", city: "Chennai", eco_points: 450, level: 4 },
          { id: 2, name: "Alex Morgan", email: "alex@ecoai.org", role: "user", city: "Chennai", eco_points: 390, level: 4 }
        ]);
        setStats({
          total_users: 2,
          active_users: 2,
          total_records: 8,
          average_footprint_kg: 186.5,
          average_carbon_score: 82,
          most_common_emission_source: "Transportation",
          total_co2_tracked_kg: 1988.0,
          completed_reduction_plans: 12,
          simulator_sessions_count: 24,
          monthly_emission_trends: [
            { month: "Jan", avg_emission: 210, users: 1 },
            { month: "Feb", avg_emission: 198, users: 2 },
            { month: "Mar", avg_emission: 190, users: 2 }
          ],
          category_distribution: [
            { category: "Transportation", emission_kg: 350.0 },
            { category: "Electricity", emission_kg: 240.0 },
            { category: "Food", emission_kg: 160.0 },
            { category: "Waste", emission_kg: 90.0 }
          ],
          available_cities: ["Chennai"],
          system_status: "Operational"
        });
        setModelPerf({
          best_model: "Scikit-Learn Random Forest Regressor",
          models: [
            { model: "Random Forest Regressor", mae: 4.12, rmse: 5.84, r2_score: 0.948, status: "Best Performing" },
            { model: "Gradient Boosting Regressor", mae: 4.65, rmse: 6.21, r2_score: 0.932, status: "Secondary" }
          ],
          dataset_size: 1420,
          validation_size: 284,
          last_trained: new Date().toISOString(),
          sufficient_data: true
        });
      }
    } catch (err) {
      console.warn("Admin data fetch warning:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, selectedCity, selectedCategory, daysFilter]);

  const handleTrainModel = async () => {
    setTrainingLoading(true);
    setTrainingMsg('');
    try {
      if (user && user.role === 'admin') {
        const res = await api.trainModel();
        setTrainingMsg(res.message || "AI Model pipeline successfully trained!");
        fetchData();
      } else {
        setTrainingMsg("AI Model re-trained on consent-approved dataset (Demo Mode).");
      }
    } catch (err) {
      setTrainingMsg("Model training failed.");
    } finally {
      setTrainingLoading(false);
    }
  };

  const handleSelectUser = async (u) => {
    setSelectedUser(u);
    setLoadingDetail(true);
    try {
      if (user && user.role === 'admin') {
        const detail = await api.getUserFootprintDetail(u.id);
        setUserFootprintDetail(detail);
      }
    } catch (err) {
      console.warn("Failed fetching user detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-24 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#16A66A] border-t-transparent animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-4">Loading Admin Control Console...</p>
      </div>
    );
  }

  const userGrowthChartData = {
    labels: stats?.monthly_emission_trends?.map(m => m.month) || ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Platform Registered Users',
        data: stats?.monthly_emission_trends?.map(m => m.users) || [1, 2, 2],
        borderColor: '#16A66A',
        backgroundColor: 'rgba(22, 166, 106, 0.15)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const categoryDistributionChartData = {
    labels: stats?.category_distribution?.map(c => c.category) || ['Transportation', 'Electricity', 'Food', 'Waste'],
    datasets: [
      {
        data: stats?.category_distribution?.map(c => c.emission_kg) || [350, 240, 160, 90],
        backgroundColor: ['#123B2A', '#16A66A', '#14B8A6', '#F4C95D'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Control Bar Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#123B2A] text-white p-6 rounded-3xl border border-[#16A66A]/30 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-black text-[#F4C95D] bg-white/10 px-3 py-1 rounded-full border border-white/15">
            <ShieldAlert className="w-3.5 h-3.5" /> SYSTEM ADMIN PORTAL
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            EcoAI Admin Control Console
          </h1>
          <p className="text-xs text-[#DDF7E9]/80 font-medium">
            AI Model Training, Performance Evaluation, System Audit Logs & User Registry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white/10 p-1 rounded-2xl border border-white/20 text-xs font-black">
            <button
              onClick={() => setAdminSubTab('analytics')}
              className={`px-3 py-1.5 rounded-xl transition ${adminSubTab === 'analytics' ? 'bg-[#16A66A] text-white shadow' : 'text-[#DDF7E9]'}`}
            >
              Analytics & Models
            </button>
            <button
              onClick={() => setAdminSubTab('audit')}
              className={`px-3 py-1.5 rounded-xl transition ${adminSubTab === 'audit' ? 'bg-[#16A66A] text-white shadow' : 'text-[#DDF7E9]'}`}
            >
              Audit Logs ({auditLogs.length})
            </button>
          </div>

          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ stats, usersList, modelPerf, auditLogs }));
              const anchor = document.createElement('a');
              anchor.setAttribute("href", dataStr);
              anchor.setAttribute("download", "EcoAI_Admin_Export.json");
              anchor.click();
            }}
            className="px-4 py-2.5 rounded-xl bg-[#16A66A] hover:bg-emerald-600 text-xs font-black text-white flex items-center gap-2 shadow cursor-pointer transition"
          >
            <Download className="w-4 h-4 text-[#F4C95D]" /> Export System Data
          </button>
        </div>
      </div>

      {/* SUB TAB: SYSTEM AUDIT LOGS */}
      {adminSubTab === 'audit' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-500" /> System Administrative Audit Log
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase font-black">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Action Event</th>
                  <th className="p-3">User ID</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Event Details</th>
                  <th className="p-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-semibold">
                {auditLogs && auditLogs.length > 0 ? (
                  auditLogs.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="p-3 text-slate-400">#{l.id}</td>
                      <td className="p-3 font-extrabold text-[#16A66A]">{l.action}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{l.user_id ? `#${l.user_id}` : 'System'}</td>
                      <td className="p-3 text-slate-400">{l.ip_address}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{JSON.stringify(l.details_json)}</td>
                      <td className="p-3 text-right text-slate-400">{new Date(l.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-slate-400 font-bold">No system audit log events recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB: ANALYTICS & AI MODELS */}
      {adminSubTab === 'analytics' && (
        <>
          {/* STATS CARDS */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users / Active"
                value={`${stats.total_users} / ${stats.active_users}`}
                unit="Users"
                subtitle="Registered Platform Accounts"
                icon={Users}
                color="emerald"
              />
              <StatCard
                title="Average Footprint"
                value={stats.average_footprint_kg}
                unit="kg CO₂e"
                subtitle={`Score Avg: ${stats.average_carbon_score}/100`}
                icon={BarChart3}
                color="cyan"
              />
              <StatCard
                title="Most Common Source"
                value={stats.most_common_emission_source}
                unit=""
                subtitle="Highest Frequency Sector"
                icon={Car}
                color="amber"
              />
              <StatCard
                title="Completed Plans"
                value={stats.completed_reduction_plans}
                unit="Actions"
                subtitle="5-Day Plans Slating Reduction"
                icon={CheckSquare}
                color="purple"
              />
            </div>
          )}

          {/* AI MODEL PERFORMANCE & PIPELINE RE-TRAINING CARD */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123B2A] border-2 border-purple-500/40 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu className="w-6 h-6 text-purple-500" /> AI Model Performance & Improvement Pipeline
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#DDF7E9]/70 mt-0.5">
                  Preprocesses consent-approved, de-identified carbon metrics to train Scikit-learn Random Forest model.
                </p>
              </div>

              <button
                onClick={handleTrainModel}
                disabled={trainingLoading}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow flex items-center gap-2 cursor-pointer transition"
              >
                <RefreshCw className={`w-4 h-4 ${trainingLoading ? 'animate-spin' : ''}`} />
                {trainingLoading ? 'Running AI Pipeline...' : 'Trigger Model Re-Training'}
              </button>
            </div>

            {trainingMsg && (
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {trainingMsg}
              </div>
            )}

            {/* INSUFFICIENT DATA EVALUATION CHECK */}
            {modelPerf && modelPerf.sufficient_data === false ? (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-black text-sm">Insufficient Data Warning</h4>
                  <p className="text-[11px] font-medium">{modelPerf.error_message}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-bold">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                  <span className="text-slate-400 text-[10px] uppercase block">MAE (Mean Error)</span>
                  <span className="text-lg font-black text-purple-600 dark:text-purple-300">{modelPerf?.models?.[0]?.mae || 4.12} kg</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                  <span className="text-slate-400 text-[10px] uppercase block">RMSE Score</span>
                  <span className="text-lg font-black text-purple-600 dark:text-purple-300">{modelPerf?.models?.[0]?.rmse || 5.86}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                  <span className="text-slate-400 text-[10px] uppercase block">R² Accuracy Score</span>
                  <span className="text-lg font-black text-[#16A66A]">{modelPerf?.models?.[0]?.r2_score || 0.94}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                  <span className="text-slate-400 text-[10px] uppercase block">Consented Train Samples</span>
                  <span className="text-lg font-black text-cyan-500">{modelPerf?.dataset_size || 1420}</span>
                </div>
              </div>
            )}
          </div>

          {/* REGISTERED USERS REGISTRY TABLE */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#16A66A]" /> Registered Users Registry
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase font-black">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">User Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">City</th>
                    <th className="p-3">Role</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-semibold">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                      <td className="p-3 text-slate-400">#{u.id}</td>
                      <td className="p-3 font-extrabold text-slate-900 dark:text-white">{u.name}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{u.city || "Not specified"}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          u.role === 'admin' 
                            ? 'bg-[#123B2A] text-[#F4C95D]' 
                            : u.role === 'organization'
                              ? 'bg-cyan-900/30 text-cyan-300'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleSelectUser(u)}
                          className="px-3 py-1.5 rounded-xl bg-[#16A66A]/10 hover:bg-[#16A66A]/20 text-[#16A66A] text-xs font-bold ml-auto cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
