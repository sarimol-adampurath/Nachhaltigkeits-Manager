import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { ActivityLog } from "../types/emission";
import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { getCategoryColor } from "../utils/colorUtils";

export const EmissionCharts = ({ logs }: { logs: ActivityLog[] }) => {
  const [allCategories, setAllCategories] = useState<{id: number, category: string, unit: string}[]>([]);

  useEffect(() => {
    apiClient.get('factors/')
      .then(res => setAllCategories(res.data))
      .catch(err => console.error("Could not load categories", err));
  }, []);

  const chartData = allCategories.map(category => {
    const logValue = logs
      .filter(log => log.category_name === category.category)
      .reduce((sum, log) => sum + Number(log.co2_total), 0);
    
    return {
      name: category.category,
      value: logValue
    };
  });

  const categoryNames = allCategories.map(cat => cat.category);

   return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name, categoryNames)} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${Number(value).toFixed(2)} kg`} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};