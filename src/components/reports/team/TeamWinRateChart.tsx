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

interface TeamWinRateChartProps {
  data: TeamPerformance[];
}

export const TeamWinRateChart = ({ data }: TeamWinRateChartProps) => {
  if (!data.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No team win rate data available.
      </p>
    );
  }

  const chartData = data.map((t) => ({
    name: t.teamName,
    won: t.wonOpportunities ?? 0,
    lost: (t.totalOpportunities ?? 0) - (t.wonOpportunities ?? 0),
    winRate: t.winRate ?? 0,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height={300} minWidth={1}>
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
            dataKey="won"
            name="Won"
            stackId="deals"
            fill="#10B981"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="lost"
            name="Lost / Open"
            stackId="deals"
            fill="#E2E8F0"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
