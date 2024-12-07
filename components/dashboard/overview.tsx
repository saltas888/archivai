"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { subMonths, format } from "date-fns";
import { Doc } from "@/lib/db/schema";

interface OverviewProps {
  data: Doc[];
}

export function Overview({ data }: OverviewProps) {
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return format(date, "MMM yyyy");
  }).reverse();

  const chartData = last12Months.map(month => {
    const amount = data
      .filter(doc => format(new Date(doc.date), "MMM yyyy") === month)
      .reduce((sum, doc) => sum + Number(doc.totalAmount), 0);

    return {
      name: month,
      total: amount,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={chartData}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#8884d8"
          fill="url(#colorTotal)"
          fillOpacity={0.2}
        />
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  );
}