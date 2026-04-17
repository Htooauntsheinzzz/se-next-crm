"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/reportFormat";
import type { MonthForecast } from "@/types/report";

interface ForecastConfidenceChartProps {
  data: MonthForecast[];
}

const COLORS = [
  "#6366F1",
  "#8B5CF6",
  "#A78BFA",
  "#C4B5FD",
  "#DDD6FE",
  "#EDE9FE",
];

export const ForecastConfidenceChart = ({ data }: ForecastConfidenceChartProps) => {
  if (!data.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No forecast data available.
      </p>
    );
  }

  const chartData = data.map((m, i) => ({
    name: `${m.monthName.slice(0, 3)} ${m.year}`,
    value: m.expectedRevenue ?? 0,
    fill: COLORS[i % COLORS.length],
  }));

  const totalExpected = data.reduce((s, m) => s + (m.expectedRevenue ?? 0), 0);
  const totalWon = data.reduce((s, m) => s + (m.wonRevenue ?? 0), 0);
  const overallConfidence =
    totalExpected > 0 ? Math.round((totalWon / totalExpected) * 100) : 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 12px rgba(0,0,0,.08)",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-slate-900">
          {formatCurrency(totalExpected)}
        </p>
        <p className="text-xs text-slate-500">
          Total forecast ·{" "}
          <span
            className={
              overallConfidence >= 50 ? "text-green-600" : "text-amber-600"
            }
          >
            {overallConfidence}% secured
          </span>
        </p>
      </div>
    </div>
  );
};
