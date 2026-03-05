import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { emissionService } from "../api/emissionServices";
import { getCategoryColor } from "../utils/colorUtils";
import type { EmissionFactor } from "../types/emission";

export const DummyChart = () => {
  const { data: allCategories = [] } = useQuery<EmissionFactor[]>({
    queryKey: ['factors'],
    queryFn: emissionService.getFactors,
    staleTime: 1000 * 60 * 5, // Cache 5 minutes
  });

  // Create dummy data with all categories having equal small value so chart renders
  const chartData = allCategories.map((category: EmissionFactor) => ({
    name: category.category,
    value: 1  // Equal small value so all segments are visible
  }));

  const categoryNames = allCategories.map((cat: EmissionFactor) => cat.category);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
      <ResponsiveContainer width="100%" height="85%">
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
              <Cell key={`cell-${index}`} fill="#d1d5db" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Custom Legend with actual colors */}
      <div style={{ width: '100%', height: '15%', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '8px' }}>
        {allCategories.map((category) => (
          <div key={category.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <div 
              style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: getCategoryColor(category.category, categoryNames),
                borderRadius: '2px'
              }}
            ></div>
            <span style={{ color: '#4b5563', fontWeight: '500' }}>{category.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
