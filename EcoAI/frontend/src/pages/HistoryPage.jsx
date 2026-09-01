import React, { useState, useEffect } from 'react';
import { History, Calendar, Trash2, Download, Search, Filter, RefreshCw, Car, Zap, Utensils } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [timeFrame, setTimeFrame] = useState('all'); // 'daily' | 'monthly' | 'yearly' | 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      if (user) {
        const data = await api.getHistory(timeFrame);
        setHistory(data);
      } else {
        // Fallback demo records
        setHistory([
          {
            id: 1,
            date: "2026-08-01T10:00:00Z",
            transport_type: "Public Transit",
            daily_distance: 25,
            fuel_type: "Electric Metro",
            monthly_electricity: 180,
            ac_usage_hours: 2.5,
            appliance_usage: "Medium",
            diet_type: "Vegetarian",
            meals_per_day: 3,
            plastic_waste_kg: 1.5,
            recycling_habit: "Sometimes",
            waste_generated_level: "Moderate",
            flight_frequency: 1,
            water_usage_liters: 90,
            shopping_frequency: "Moderate",
            total_carbon_footprint: 268.0,
            breakdown_json: { Transportation: 82.0, Electricity: 90.0, Food: 60.0, Waste: 18.0, Lifestyle: 18.0 }
          },
          {
            id: 2,
            date: "2026-07-01T10:00:00Z",
            transport_type: "Petrol Car",
            daily_distance: 30,
            fuel_type: "Petrol",
            monthly_electricity: 210,
            ac_usage_hours: 4.0,
            appliance_usage: "High",
            diet_type: "Non-vegetarian",
            meals_per_day: 3,
            plastic_waste_kg: 2.5,
            recycling_habit: "Never",
            waste_generated_level: "High",
            flight_frequency: 2,
            water_usage_liters: 130,
            shopping_frequency: "High",
            total_carbon_footprint: 340.5,
            breakdown_json: { Transportation: 120.0, Electricity: 110.0, Food: 70.5, Waste: 25.0, Lifestyle: 15.0 }
          }
        ]);
      }
    } catch (err) {
      console.warn("Failed fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user, timeFrame]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this carbon record?")) return;
    try {
      if (user) {
        await api.deleteRecord(id);
      }
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert("Failed to delete record.");
    }
  };

  const filteredHistory = history.filter(item => {
    const searchStr = `${item.transport_type} ${item.diet_type} ${item.fuel_type}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-card p-6 rounded-3xl">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full mb-1">
            <History className="w-3.5 h-3.5" /> Environmental Audit Trail
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Carbon Footprint History
          </h1>
        </div>

        {/* Timeframe selector tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          {['all', 'daily', 'monthly', 'yearly'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFrame(tf)}
              className={`px-3 py-1.5 rounded-xl capitalize transition cursor-pointer ${
                timeFrame === tf
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-500'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search mode, diet, or fuel..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          onClick={fetchHistory}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Log
        </button>
      </div>

      {/* Records Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-500">Loading history records...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-500">No historical carbon entries found for this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Total Footprint</th>
                  <th className="p-4">Transport</th>
                  <th className="p-4">Electricity</th>
                  <th className="p-4">Diet</th>
                  <th className="p-4">Waste</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4 text-slate-900 dark:text-white font-bold">
                      {new Date(rec.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold">
                        {rec.total_carbon_footprint} kg CO2
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {rec.transport_type} ({rec.daily_distance} km)
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {rec.monthly_electricity} kWh ({rec.ac_usage_hours} hrs AC)
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {rec.diet_type}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {rec.plastic_waste_kg} kg plastic ({rec.recycling_habit})
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(rec.id)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
