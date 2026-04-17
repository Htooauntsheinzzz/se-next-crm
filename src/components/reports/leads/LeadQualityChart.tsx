"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { LeadQuality } from "@/types/report";

interface LeadQualityChartProps {
  data: LeadQuality[];
}

const COLORS = ["#EF4444", "#F59E0B", "#3B82F6"];

export const LeadQualityChart = ({ data }: LeadQualityChartProps) => {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="label" innerRadius={64} outerRadius={100}>
              {data.map((item, index) => (
                <Cell key={`${item.label}-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => Number(value ?? 0).toLocaleString()} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={`${item.label}-${index}`} className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span>{item.label}</span>
            </div>
            <p className="mt-1">{item.count} ({item.percentage.toFixed(1)}%)</p>
          </div>
        ))}
      </div>
    </div>
  );
};
