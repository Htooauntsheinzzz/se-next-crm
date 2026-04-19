"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ActivityTypeCount } from "@/types/report";

interface ActivityByTypeChartProps {
  data: ActivityTypeCount[];
}

const TYPE_COLORS: Record<string, string> = {
  CALL: "#8B6DD0",
  EMAIL: "#3B82F6",
  MEETING: "#10B981",
  TODO: "#F59E0B",
  DOCUMENT: "#6366F1",
};

const formatLabel = (type: string) =>
  type.charAt(0) + type.slice(1).toLowerCase();

export const ActivityByTypeChart = ({ data }: ActivityByTypeChartProps) => {
  if (!data.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No activity type data available.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: formatLabel(d.type),
    fill: TYPE_COLORS[d.type] ?? "#94A3B8",
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E2E8F0"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fill: "#64748B", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={90}
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
          <Bar dataKey="count" name="count" radius={[0, 6, 6, 0]} barSize={28}>
            {chartData.map((entry) => (
              <Cell key={entry.type} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
