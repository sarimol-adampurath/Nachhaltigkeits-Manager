import { useEmission } from "./hooks/useEmission";
import { DashboardStats } from "./components/DashboardStats";
import { EmissionCharts } from "./components/EmissionCharts";

function App() {
  const { logs, loading, error } = useEmission();
  if (loading) return <div>Loading emission data...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div style={{padding:'40px' , maxWidth:'1200px', margin:'0 auto'}}>
      <header>
        <h1>Sustainability Manager</h1>
        <p>Real-time Carbon Tracking Dashboard</p>
      </header>
      <main>
        <DashboardStats logs={logs} />
        <EmissionCharts logs={logs} />
        <br/>
        <br/>
        <section>
          <h2>Recent Activity</h2>
          <ul>
            {logs.map((log) => (
              <li key={log.id}>
                <strong>{log.category_name}</strong> - {log.co2_total}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;