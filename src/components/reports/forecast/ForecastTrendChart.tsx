"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthForecast } from "@/types/report";

interface ForecastTrendChartProps {
  data: MonthForecast[];
}

export const ForecastTrendChart = ({ data }: ForecastTrendChartProps) => {
  if (!data.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No forecast data available.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: `${d.monthName.slice(0, 3)} ${d.year}`,
  }));

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height={320} minWidth={1}>
        <ComposedChart
          data={chartData}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradExpected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748B", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748B", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) =>
              v >= 1000000
                ? `$${(v / 1000000).toFixed(1)}M`
                : v >= 1000
                  ? `$${(v / 1000).toFixed(0)}K`
                  : `$${v}`
            }
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 12px rgba(0,0,0,.08)",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="expectedRevenue"
            name="Expected Revenue"
            stroke="#6366F1"
            strokeWidth={2}
            fill="url(#gradExpected)"
          />
          <Bar
            dataKey="wonRevenue"
            name="Won Revenue"
            fill="#10B981"
            radius={[4, 4, 0, 0]}
            barSize={32}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
