import { useEmission } from "../hooks/useEmission";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { DashboardStats } from "../components/DashboardStats";
import { EmissionCharts } from "../components/EmissionCharts";
import { EmissionForm } from "../components/EmissionForm";
import { DeleteModal } from "../components/DeleteModal";
import { useState } from "react";
import { SkeletonLoader } from "../components/Skeletons";
import { ErrorState } from "../components/ErrorState";
import EmptyDashboard from "../components/EmptyDashboard";
import type { ActivityLog } from "../types/emission";

export const Dashboard = () => {
  const { logs, loading, error, deleteLog, refetch } = useEmission();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const hasNoData = !loading && logs.length === 0;
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const confirmDeletion = async () => {
    if (deleteTarget !== null) {
      await deleteLog(deleteTarget);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
    {/* Navigation Header */}
    <nav className="bg-white border-b border-slate-200 py-3 md:py-4 mb-6 md:mb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <h1 className="text-xl md:text-2xl font-extrabold text-emerald-600 tracking-tight">
            Eco<span className="text-slate-800">Track</span>
          </h1>
          <div className="flex items-center gap-2 md:gap-3 bg-slate-50 px-3 md:px-4 py-2 rounded-full border border-slate-100 shadow-inner whitespace-nowrap">
            <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-600 tracking-tighter">
              System Live
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 font-medium rounded-lg transition-all text-sm md:text-base border border-slate-200 hover:border-red-200"
        >
          Logout
        </button>
      </div>
    </nav>
    {/* Main Content */}
    <main className="max-w-7xl mx-auto px-4 md:px-6 pb-8 md:pb-12">
      {error ? (
        <div className="mt-10">
            <ErrorState 
              message="The EcoTrack API is currently unreachable." 
              onRetry={() => refetch()} 
            />
          </div>
      ): loading ? (
        <SkeletonLoader />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
        
        {/* TOP ROW: Stats Overview - Always show */}
        <div className="lg:col-span-12">
          <DashboardStats logs={logs} />
        </div>

        {/* LEFT COLUMN: Input Section - Always visible */}
        <aside className="lg:col-span-4">
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200">
            <h2 className="text-base md:text-lg font-bold mb-4 md:mb-6 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-700 p-1 rounded text-sm">＋</span>
              Log Emission
            </h2>
            <EmissionForm />
          </div>
        </aside>

        {/* RIGHT COLUMN: Visuals & History - Always visible */}
        <section className="lg:col-span-8 space-y-4 md:space-y-8">
          {/* Chart Card - Greyed out when no data */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200">
            <h2 className="text-base md:text-lg font-bold mb-3 md:mb-4">Carbon Trends</h2>
            <div className="h-48 md:h-64 w-full flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-300 overflow-hidden">
              <EmissionCharts logs={logs} />
            </div>
          </div>

          {/* Activity List Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-slate-100">
              <h2 className="text-base md:text-lg font-bold">Recent Activities</h2>
            </div>
            {hasNoData ? (
              <div className="p-4 md:p-6">
                <EmptyDashboard />
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {logs.map((log: ActivityLog) => (
                  <li key={log.id} className="group p-3 md:p-4 hover:bg-slate-50 transition-colors flex justify-between items-center gap-2 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate text-sm md:text-base">{log.category_name}</p>
                      <p className="text-xs text-slate-400">{log.date}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-emerald-600 font-mono font-bold text-xs md:text-sm">{log.co2_total} kg</p>
                      <p className="text-[10px] uppercase text-slate-400">CO2</p>
                    </div>
                    <button 
                      onClick={() => setDeleteTarget(log.id)}
                      className="flex-shrink-0 p-1.5 md:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                      aria-label="Delete activity"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
      )}
    </main>
    <DeleteModal 
      isOpen={deleteTarget !== null} 
      onClose={() => setDeleteTarget(null)} 
      onConfirm={confirmDeletion} 
    />
  </div>
  );
};