"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatShortCurrency } from "@/lib/reportFormat";
import type { MonthlyRevenueTrend } from "@/types/report";

interface RevenueTrendChartProps {
  data: MonthlyRevenueTrend[];
}

export const RevenueTrendChart = ({ data }: RevenueTrendChartProps) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="monthName" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(value) => formatShortCurrency(Number(value))} tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value) => formatShortCurrency(Number(value ?? 0))} />
          <Legend />
          <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#8B6DD0" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="target" name="Target" stroke="#6366F1" strokeDasharray="5 5" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
