"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPercentage, toSafeNumber } from "@/lib/format";
import type { ConversionFunnelItem } from "@/types/dashboard";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { WidgetState } from "@/components/dashboard/WidgetState";

interface ConversionFunnelProps {
  data: ConversionFunnelItem[];
  error?: string;
  onRetry: () => void;
}

export const ConversionFunnel = ({ data, error, onRetry }: ConversionFunnelProps) => {
  if (error) {
    return (
      <WidgetCard title="Conversion Funnel">
        <WidgetState mode="error" message="Failed to load conversion funnel" onRetry={onRetry} />
      </WidgetCard>
    );
  }

  if (data.length === 0) {
    return (
      <WidgetCard title="Conversion Funnel">
        <WidgetState mode="empty" message="No conversion data available" />
      </WidgetCard>
    );
  }

  const chartData = data.map((item) => ({
    stage: item.stage,
    count: toSafeNumber(item.count),
    percentage: toSafeNumber(item.percentage),
  }));

  return (
    <WidgetCard title="Conversion Funnel">
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height={240} minWidth={1}>
          <BarChart data={chartData} margin={{ top: 18, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="stage" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              formatter={(value, name, payload) => {
                if (String(name) === "count") {
                  return [Number(value ?? 0), "Count"];
                }

                const entry = payload as { payload?: { percentage?: number } } | undefined;
                return [formatPercentage(entry?.payload?.percentage ?? 0), "Conversion"];
              }}
              contentStyle={{ borderRadius: "10px", borderColor: "#E2E8F0" }}
            />
            <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]}>
              <LabelList
                dataKey="percentage"
                position="top"
                formatter={(value) => formatPercentage(Number(value ?? 0))}
                fill="#4338CA"
                fontSize={11}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
};
