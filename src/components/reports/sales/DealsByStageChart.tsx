"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DealsByStage } from "@/types/report";

interface DealsByStageChartProps {
  data: DealsByStage[];
}

export const DealsByStageChart = ({ data }: DealsByStageChartProps) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="stageName" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="wonCount" name="Won" fill="#10B981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="lostCount" name="Lost" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
