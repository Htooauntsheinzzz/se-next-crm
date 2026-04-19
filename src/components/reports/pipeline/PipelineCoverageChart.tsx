"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatShortCurrency } from "@/lib/reportFormat";
import type { MonthlyCoverage } from "@/types/report";

interface PipelineCoverageChartProps {
  data: MonthlyCoverage[];
}

export const PipelineCoverageChart = ({ data }: PipelineCoverageChartProps) => {
  return (
    <div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="monthName" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(value) => formatShortCurrency(Number(value))} tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(value) => formatShortCurrency(Number(value ?? 0))} />
            <Legend />
            <Bar dataKey="pipelineValue" name="Pipeline" fill="#8B6DD0" radius={[4, 4, 0, 0]} />
            <Bar dataKey="quota" name="Quota" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {data.map((row) => (
          <span key={`${row.year}-${row.month}`} className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
            {row.monthName}: {row.coverageRatio.toFixed(1)}x
          </span>
        ))}
      </div>
    </div>
  );
};
