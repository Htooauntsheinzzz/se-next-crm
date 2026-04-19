"use client";

import { formatCompactNumber, formatCurrency } from "@/lib/format";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { WidgetState } from "@/components/dashboard/WidgetState";
import type { StageRevenue } from "@/types/report";

interface PipelineFunnelChartProps {
  data: StageRevenue[];
  loading: boolean;
  error?: string;
  onRetry: () => void;
}

const FUNNEL_COLORS = ["#8B6DD0", "#3B82F6", "#6366F1", "#EC4899", "#10B981", "#F59E0B", "#EF4444"];

export const PipelineFunnelChart = ({ data, loading, error, onRetry }: PipelineFunnelChartProps) => {
  if (error) {
    return (
      <WidgetCard title="Pipeline Funnel">
        <WidgetState mode="error" message="Failed to load pipeline funnel" onRetry={onRetry} />
      </WidgetCard>
    );
  }

  if (loading) {
    return (
      <WidgetCard title="Pipeline Funnel">
        <div className="h-[300px] animate-pulse rounded-lg bg-slate-200" />
      </WidgetCard>
    );
  }

  if (!data.length) {
    return (
      <WidgetCard title="Pipeline Funnel">
        <WidgetState mode="empty" message="No pipeline stage data available" />
      </WidgetCard>
    );
  }

  const maxCount = Math.max(...data.map((item) => item.count || 0), 1);

  return (
    <WidgetCard title="Pipeline Funnel">
      <div className="space-y-3">
        {data.map((stage, index) => {
          const width = `${Math.max((stage.count / maxCount) * 100, 8)}%`;
          return (
            <div key={`${stage.stageId}-${stage.stageName}`} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium text-slate-800">{stage.stageName}</p>
                <p className="text-xs text-slate-500">
                  {formatCurrency(stage.totalRevenue)} ({formatCompactNumber(stage.count)})
                </p>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width,
                    backgroundColor: FUNNEL_COLORS[index % FUNNEL_COLORS.length],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
};
