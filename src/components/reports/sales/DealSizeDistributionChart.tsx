"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DealSizeRange } from "@/types/report";

interface DealSizeDistributionChartProps {
  data: DealSizeRange[];
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B6DD0"];

export const DealSizeDistributionChart = ({ data }: DealSizeDistributionChartProps) => {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height={300} minWidth={1}>
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="range" innerRadius={64} outerRadius={100}>
              {data.map((item, index) => (
                <Cell key={`${item.range}-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => Number(value ?? 0).toLocaleString()} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={`${item.range}-${index}`} className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span>{item.range}</span>
            </div>
            <p className="mt-1 text-slate-500">{item.count} deals</p>
          </div>
        ))}
      </div>
    </div>
  );
};
