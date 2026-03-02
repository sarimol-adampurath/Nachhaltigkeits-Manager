import { useEmission } from "./hooks/useEmission";
import { DashboardStats } from "./components/DashboardStats";
import { EmissionCharts } from "./components/EmissionCharts";
import { EmissionForm } from "./components/EmissionForm";

function App() {
  const { logs, loading, error, fetchData } = useEmission();
  if (loading) return <div>Loading emission data...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

 return (
  <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
    {/* Navigation Header */}
    <nav className="bg-white border-b border-slate-200 py-4 mb-8">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-emerald-600 tracking-tight">
          Eco<span className="text-slate-800">Track</span>
        </h1>
        <div className="text-sm font-medium text-slate-500">
          Professional Sustainability Dashboard
        </div>
      </div>
    </nav>

    <main className="max-w-7xl mx-auto px-6 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* TOP ROW: Stats Overview */}
        <div className="lg:col-span-12">
          <DashboardStats logs={logs} />
        </div>

        {/* LEFT COLUMN: Input Section */}
        <aside className="lg:col-span-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-700 p-1 rounded">＋</span>
              Log Emission
            </h2>
            <EmissionForm onSuccess={fetchData} />
          </div>
        </aside>

        {/* RIGHT COLUMN: Visuals & History */}
        <section className="lg:col-span-8 space-y-8">
          {/* Chart Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4">Carbon Trends</h2>
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
               <EmissionCharts logs={logs} />
            </div>
          </div>

          {/* Activity List Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold">Recent Activities</h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {logs.map((log) => (
                <li key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800">{log.category_name}</p>
                    <p className="text-xs text-slate-400">{log.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-600 font-mono font-bold">{log.co2_total} kg</p>
                    <p className="text-[10px] uppercase text-slate-400">CO2</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  </div>
);
}

export default App;