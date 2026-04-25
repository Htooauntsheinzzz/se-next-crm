"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthlyVelocity } from "@/types/report";

interface SalesVelocityChartProps {
  data: MonthlyVelocity[];
}

export const SalesVelocityChart = ({ data }: SalesVelocityChartProps) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height={300} minWidth={1}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="monthName" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value) => `${Number(value ?? 0).toFixed(1)} days`} />
          <Line type="monotone" dataKey="avgDaysToClose" stroke="#8B6DD0" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
