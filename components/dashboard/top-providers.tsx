"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Doc } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";

interface TopProvidersProps {
  data: Doc[];
}

export function TopProviders({ data }: TopProvidersProps) {
  const providerTotals = data.reduce((acc, doc) => {
    const provider = doc.serviceProviderName || "Unknown";
    acc[provider] = (acc[provider] || 0) + Number(doc.totalAmount);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(providerTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
            label={({ name, value }) => `${name} (${formatCurrency(value)})`}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}