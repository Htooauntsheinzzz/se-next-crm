"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, toSafeNumber } from "@/lib/format";
import type { PipelineFunnelItem } from "@/types/dashboard";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { WidgetState } from "@/components/dashboard/WidgetState";

interface PipelineFunnelProps {
  data: PipelineFunnelItem[];
  error?: string;
  onRetry: () => void;
}

export const PipelineFunnel = ({ data, error, onRetry }: PipelineFunnelProps) => {
  if (error) {
    return (
      <WidgetCard title="Pipeline Funnel">
        <WidgetState mode="error" message="Failed to load pipeline funnel" onRetry={onRetry} />
      </WidgetCard>
    );
  }

  if (data.length === 0) {
    return (
      <WidgetCard title="Pipeline Funnel">
        <WidgetState mode="empty" message="No pipeline funnel data available" />
      </WidgetCard>
    );
  }

  const chartData = data.map((item) => ({
    stageName: item.stageName,
    count: toSafeNumber(item.count),
    totalValue: toSafeNumber(item.totalValue),
  }));

  return (
    <WidgetCard title="Pipeline Funnel">
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height={240} minWidth={1}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis type="number" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              dataKey="stageName"
              type="category"
              tick={{ fill: "#64748B", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={98}
            />
            <Tooltip
              formatter={(value, name, payload) => {
                if (String(name) === "count") {
                  return [Number(value ?? 0), "Deals"];
                }

                const entry = payload as { payload?: { totalValue?: number } } | undefined;
                return [formatCurrency(entry?.payload?.totalValue ?? 0), "Total Value"];
              }}
              contentStyle={{ borderRadius: "10px", borderColor: "#E2E8F0" }}
            />
            <Bar dataKey="count" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
};
