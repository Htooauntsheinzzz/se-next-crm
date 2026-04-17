"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { IndustryBreakdown } from "@/types/report";

interface IndustryBreakdownChartProps {
  data: IndustryBreakdown[];
}

export const IndustryBreakdownChart = ({ data }: IndustryBreakdownChartProps) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis type="number" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis dataKey="industry" type="category" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
          <Tooltip />
          <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
