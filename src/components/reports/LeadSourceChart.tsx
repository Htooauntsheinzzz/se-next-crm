"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatPercentage } from "@/lib/format";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { WidgetState } from "@/components/dashboard/WidgetState";
import type { SourceCount } from "@/types/report";

interface LeadSourceChartProps {
  data: SourceCount[];
  loading: boolean;
  error?: string;
  onRetry: () => void;
}

const PIE_COLORS = ["#8B6DD0", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#EC4899"];

export const LeadSourceChart = ({ data, loading, error, onRetry }: LeadSourceChartProps) => {
  if (error) {
    return (
      <WidgetCard title="Leads by Source">
        <WidgetState mode="error" message="Failed to load lead sources" onRetry={onRetry} />
      </WidgetCard>
    );
  }

  if (loading) {
    return (
      <WidgetCard title="Leads by Source">
        <div className="h-[300px] animate-pulse rounded-lg bg-slate-200" />
      </WidgetCard>
    );
  }

  if (!data.length) {
    return (
      <WidgetCard title="Leads by Source">
        <WidgetState mode="empty" message="No lead source data available" />
      </WidgetCard>
    );
  }

  const total = data.reduce((sum, item) => sum + (item.count ?? 0), 0);

  return (
    <WidgetCard title="Leads by Source">
      <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height={280} minWidth={1}>
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="source"
                innerRadius={64}
                outerRadius={98}
                paddingAngle={2}
              >
                {data.map((item, index) => (
                  <Cell key={`${item.source}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => Number(value ?? 0).toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-800">Total Leads: {total.toLocaleString()}</p>
          {data.map((item, index) => {
            const ratio = total > 0 ? (item.count / total) * 100 : 0;
            return (
              <div key={`${item.source}-${index}`} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="font-medium text-slate-700">{item.source || "Unknown"}</span>
                  </div>
                  <span className="text-slate-500">{item.count}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{ratio.toFixed(1)}%</span>
                  <span className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-indigo-600">
                    {formatPercentage(item.conversionRate ?? 0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </WidgetCard>
  );
};
