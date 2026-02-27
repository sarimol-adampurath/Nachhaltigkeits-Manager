import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip,Legend } from "recharts";
import type { ActivityLog } from "../types/emission";

type ChartDataItem = {
  name: string;
  value: number;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const EmissionCharts = ({ logs }: { logs: ActivityLog[] }) => {
  const chartData = logs.reduce<ChartDataItem[]>((acc, log) => {
        const existing = acc.find(item => item.name === log.category_name);
        if(existing){
            existing.value += Number(log.co2_total);
        } else {
            acc.push({ name: log.category_name, value: Number(log.co2_total) });
        }
        return acc;
    }, []);

   return (
    <div style={{ width: '100%', height: 300, background: '#fff', padding: '20px', borderRadius: '12px' }}>
      <h3>Emissions by Category</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${Number(value).toFixed(2)} kg`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};