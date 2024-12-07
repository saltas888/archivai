"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Doc } from "@/lib/db/schema";

interface DocTypeDistributionProps {
  data: Doc[];
}

export function DocTypeDistribution({ data }: DocTypeDistributionProps) {
  const typeCounts = data.reduce((acc, doc) => {
    const type = doc.recordType;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(typeCounts)
    .map(([name, value]) => ({ name, value }));

  const COLORS = ['#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            label={({ name, value }) => `${name} (${value})`}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}