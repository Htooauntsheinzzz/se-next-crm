"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TeamPerformance } from "@/types/report";

interface TeamRevenueChartProps {
  data: TeamPerformance[];
}

export const TeamRevenueChart = ({ data }: TeamRevenueChartProps) => {
  if (!data.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No team revenue data available.
      </p>
    );
  }

  const chartData = data.map((t) => ({
    name: t.teamName,
    revenue: t.totalRevenue ?? 0,
    won: t.wonOpportunities ?? 0,
    total: t.totalOpportunities ?? 0,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="name"
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
          <Bar
            dataKey="revenue"
            name="Revenue"
            fill="#8B6DD0"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
