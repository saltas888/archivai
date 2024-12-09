"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { startOfMonth, subMonths, format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { getDocuments } from "@/lib/api";

export function ClientInvoices({ clientId }: { clientId: string }) {
  const { data: documents = [], isError } = useQuery({
    queryKey: ["documents", clientId],
    queryFn: () => getDocuments({ clientId }),
  });
  const currentMonth = startOfMonth(new Date());
  const previousMonth = startOfMonth(subMonths(currentMonth, 1));

  const currentMonthTotal = documents
    .filter(doc => new Date(doc.date) >= currentMonth)
    .reduce((sum, doc) => sum + Number(doc.totalAmount), 0);

  const previousMonthTotal = documents
    .filter(doc => {
      const docDate = new Date(doc.date);
      return docDate >= previousMonth && docDate < currentMonth;
    })
    .reduce((sum, doc) => sum + Number(doc.totalAmount), 0);

  const data = [
    {
      name: format(previousMonth, "MMMM"),
      amount: previousMonthTotal,
    },
    {
      name: format(currentMonth, "MMMM"),
      amount: currentMonthTotal,
    },
  ];

  const percentageChange = previousMonthTotal === 0 
    ? 100 
    : ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar 
                dataKey="amount" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {Math.abs(percentageChange).toFixed(1)}% {percentageChange >= 0 ? "increase" : "decrease"} from previous month
          </p>
        </div>
      </CardContent>
    </Card>
  );
}