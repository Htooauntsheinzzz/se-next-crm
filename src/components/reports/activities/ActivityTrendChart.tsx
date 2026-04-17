"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyActivityTrend } from "@/types/report";

interface ActivityTrendChartProps {
  data: MonthlyActivityTrend[];
}

export const ActivityTrendChart = ({ data }: ActivityTrendChartProps) => {
  if (!data.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No trend data available for this period.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: `${d.monthName} ${d.year}`,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B6DD0" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#8B6DD0" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
            dataKey="created"
            name="Created"
            stroke="#8B6DD0"
            strokeWidth={2}
            fill="url(#gradCreated)"
          />
          <Area
            type="monotone"
            dataKey="completed"
            name="Completed"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#gradCompleted)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
