"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, toSafeNumber } from "@/lib/format";
import type { MonthlyRevenue } from "@/types/dashboard";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { WidgetState } from "@/components/dashboard/WidgetState";

interface MonthlyRevenueChartProps {
  data: MonthlyRevenue[];
  error?: string;
  onRetry: () => void;
}

export const MonthlyRevenueChart = ({ data, error, onRetry }: MonthlyRevenueChartProps) => {
  if (error) {
    return (
      <WidgetCard title="Monthly Revenue">
        <WidgetState mode="error" message="Failed to load monthly revenue" onRetry={onRetry} />
      </WidgetCard>
    );
  }

  if (data.length === 0) {
    return (
      <WidgetCard title="Monthly Revenue">
        <WidgetState mode="empty" message="No revenue data available" />
      </WidgetCard>
    );
  }

  const chartData = data.map((item) => ({
    month: item.month,
    revenue: toSafeNumber(item.revenue),
  }));

  return (
    <WidgetCard title="Monthly Revenue">
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="monthlyRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "#64748B", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value ?? 0))}
              contentStyle={{ borderRadius: "10px", borderColor: "#E2E8F0" }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              strokeWidth={2.5}
              fill="url(#monthlyRevenueGradient)"
              dot={{ r: 3, fill: "#3B82F6" }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
};
