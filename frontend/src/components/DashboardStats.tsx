import type{ ActivityLog } from "../types/emission";

export const DashboardStats = ({ logs }: { logs: ActivityLog[] }) => {
  const total = logs.reduce((sum, log) => sum + Number(log.co2_total), 0);
  
  return (
    <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
      <h3 style={{ margin: 0, color: '#666' }}>Total Footprint</h3>
      <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>
        {total.toFixed(2)} <span style={{ fontSize: '16px' }}>kg CO2</span>
      </p>
    </div>
  );
};