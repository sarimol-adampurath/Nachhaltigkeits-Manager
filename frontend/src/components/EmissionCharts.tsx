import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { ActivityLog, EmissionFactor } from "../types/emission";
import { getCategoryColor } from "../utils/colorUtils";
import { useQuery } from "@tanstack/react-query";
import { emissionService } from "../api/emissionServices";

export const EmissionCharts = ({ logs }: { logs: ActivityLog[] }) => {
  const { data: allCategories = [] } = useQuery<EmissionFactor[]>({
    queryKey: ['factors'],
    queryFn: emissionService.getFactors,
    staleTime: 1000 * 60 * 5, // Cache 5 minutes
  });

  const chartData = allCategories.map((category: EmissionFactor) => {
    const logValue = logs
      .filter(log => log.category_name === category.category)
      .reduce((sum, log) => sum + Number(log.co2_total), 0);
    
    return {
      name: category.category,
      value: logValue
    };
  });

  const categoryNames = allCategories.map((cat: EmissionFactor) => cat.category);

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
            {chartData.map((entry: { name: string; value: number }, index: number) => (
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