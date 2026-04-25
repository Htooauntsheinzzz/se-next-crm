"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/format";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { WidgetState } from "@/components/dashboard/WidgetState";
import type { MonthlyRevenue } from "@/types/report";

interface MonthlyRevenueChartProps {
  data: MonthlyRevenue[];
  loading: boolean;
  error?: string;
  onRetry: () => void;
}

export const MonthlyRevenueChart = ({ data, loading, error, onRetry }: MonthlyRevenueChartProps) => {
  if (error) {
    return (
      <WidgetCard title="Revenue by Month">
        <WidgetState mode="error" message="Failed to load monthly revenue" onRetry={onRetry} />
      </WidgetCard>
    );
  }

  if (loading) {
    return (
      <WidgetCard title="Revenue by Month">
        <div className="h-[300px] animate-pulse rounded-lg bg-slate-200" />
      </WidgetCard>
    );
  }

  if (!data.length) {
    return (
      <WidgetCard title="Revenue by Month">
        <WidgetState mode="empty" message="No monthly revenue data available" />
      </WidgetCard>
    );
  }

  const chartData = data.map((item) => ({
    month: item.monthName || `${item.month}/${item.year}`,
    wonRevenue: item.wonRevenue ?? 0,
    lostRevenue: item.lostRevenue ?? 0,
    wonCount: item.wonCount ?? 0,
    lostCount: item.lostCount ?? 0,
  }));

  return (
    <WidgetCard title="Revenue by Month">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height={300} minWidth={1}>
          <BarChart data={chartData} margin={{ top: 12, right: 16, left: 6, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(Number(value))}
            />
            <Tooltip
              contentStyle={{ borderRadius: "10px", borderColor: "#E2E8F0" }}
              formatter={(value, name) => {
                const label = name === "wonRevenue" ? "Won Revenue" : "Lost Revenue";
                return [formatCurrency(Number(value ?? 0)), label];
              }}
            />
            <Legend formatter={(value) => (value === "wonRevenue" ? "Won Revenue" : "Lost Revenue")} />
            <Bar dataKey="wonRevenue" fill="#10B981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="lostRevenue" fill="#EF4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
};
