"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { toSafeNumber } from "@/lib/format";
import type { LeadsBySource } from "@/types/dashboard";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { WidgetState } from "@/components/dashboard/WidgetState";

interface LeadsBySourceChartProps {
  data: LeadsBySource[];
  error?: string;
  onRetry: () => void;
}

const sourceColors = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#6366F1"];

export const LeadsBySourceChart = ({ data, error, onRetry }: LeadsBySourceChartProps) => {
  if (error) {
    return (
      <WidgetCard title="Leads by Source">
        <WidgetState mode="error" message="Failed to load lead sources" onRetry={onRetry} />
      </WidgetCard>
    );
  }

  if (data.length === 0) {
    return (
      <WidgetCard title="Leads by Source">
        <WidgetState mode="empty" message="No lead source data available" />
      </WidgetCard>
    );
  }

  const chartData = data.map((item) => ({
    source: item.source,
    count: toSafeNumber(item.count),
  }));

  return (
    <WidgetCard title="Leads by Source">
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height={220} minWidth={1}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="source"
                innerRadius={52}
                outerRadius={82}
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`${entry.source}-${index}`} fill={sourceColors[index % sourceColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="space-y-2">
          {chartData.map((item, index) => (
            <li key={item.source} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span className="inline-flex items-center gap-2 text-slate-700">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: sourceColors[index % sourceColors.length] }}
                />
                {item.source}
              </span>
              <span className="font-semibold text-slate-900">{item.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </WidgetCard>
  );
};
