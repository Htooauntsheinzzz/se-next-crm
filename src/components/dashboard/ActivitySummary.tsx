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
import { toSafeNumber } from "@/lib/format";
import type { ActivitySummaryItem } from "@/types/dashboard";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { WidgetState } from "@/components/dashboard/WidgetState";

interface ActivitySummaryProps {
  data: ActivitySummaryItem[];
  error?: string;
  onRetry: () => void;
}

export const ActivitySummary = ({ data, error, onRetry }: ActivitySummaryProps) => {
  if (error) {
    return (
      <WidgetCard title="Activity Summary">
        <WidgetState mode="error" message="Failed to load activity summary" onRetry={onRetry} />
      </WidgetCard>
    );
  }

  if (data.length === 0) {
    return (
      <WidgetCard title="Activity Summary">
        <WidgetState mode="empty" message="No activity data available" />
      </WidgetCard>
    );
  }

  const chartData = data.map((item) => ({
    type: item.type,
    count: toSafeNumber(item.count),
  }));

  return (
    <WidgetCard title="Activity Summary">
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="type" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: "10px", borderColor: "#E2E8F0" }} />
            <Bar dataKey="count" fill="#F59E0B" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
};
