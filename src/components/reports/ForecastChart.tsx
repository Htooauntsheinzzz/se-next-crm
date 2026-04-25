"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { WidgetState } from "@/components/dashboard/WidgetState";
import type { Forecast } from "@/types/report";

interface ForecastChartProps {
  data: Forecast | null;
  loading: boolean;
  error?: string;
  onRetry: () => void;
}

export const ForecastChart = ({ data, loading, error, onRetry }: ForecastChartProps) => {
  if (error) {
    return (
      <WidgetCard title="Revenue Forecast">
        <WidgetState mode="error" message="Failed to load forecast data" onRetry={onRetry} />
      </WidgetCard>
    );
  }

  if (loading) {
    return (
      <WidgetCard title="Revenue Forecast">
        <div className="h-[300px] animate-pulse rounded-lg bg-slate-200" />
      </WidgetCard>
    );
  }

  if (!data || !data.months?.length) {
    return (
      <WidgetCard title="Revenue Forecast">
        <WidgetState mode="empty" message="No forecast data available" />
      </WidgetCard>
    );
  }

  const chartData = data.months.map((item) => ({
    month: item.monthName || `${item.month}/${item.year}`,
    expectedRevenue: item.expectedRevenue ?? 0,
    wonRevenue: item.wonRevenue ?? 0,
  }));

  return (
    <WidgetCard title="Revenue Forecast">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height={300} minWidth={1}>
          <ComposedChart data={chartData} margin={{ top: 12, right: 16, left: 6, bottom: 0 }}>
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
              formatter={(value) => formatCurrency(Number(value ?? 0))}
            />
            <Legend formatter={(value) => (value === "expectedRevenue" ? "Expected" : "Won")} />
            <Bar dataKey="expectedRevenue" fill="#8B6DD0" radius={[6, 6, 0, 0]} />
            <Line
              type="monotone"
              dataKey="wonRevenue"
              stroke="#10B981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#10B981" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-700">
        Total Forecast: <span className="text-slate-900">{formatCurrency(data.totalForecast ?? 0)}</span>
      </p>
    </WidgetCard>
  );
};
