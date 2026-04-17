"use client";

import { formatCurrency, formatPercentage } from "@/lib/format";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { WidgetState } from "@/components/dashboard/WidgetState";
import type { WonLostReport } from "@/types/report";

interface WonLostSummaryProps {
  data: WonLostReport | null;
  loading: boolean;
  error?: string;
  onRetry: () => void;
}

export const WonLostSummary = ({ data, loading, error, onRetry }: WonLostSummaryProps) => {
  if (error) {
    return (
      <WidgetCard title="Won vs Lost Analysis">
        <WidgetState mode="error" message="Failed to load won/lost report" onRetry={onRetry} />
      </WidgetCard>
    );
  }

  if (loading) {
    return (
      <WidgetCard title="Won vs Lost Analysis">
        <div className="h-[280px] animate-pulse rounded-lg bg-slate-200" />
      </WidgetCard>
    );
  }

  if (!data) {
    return (
      <WidgetCard title="Won vs Lost Analysis">
        <WidgetState mode="empty" message="No won/lost data available" />
      </WidgetCard>
    );
  }

  const maxReasonCount = Math.max(...(data.byLostReason ?? []).map((reason) => reason.count), 1);

  return (
    <WidgetCard title="Won vs Lost Analysis">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <article className="rounded-lg border border-green-100 bg-green-50 p-3">
          <p className="text-xs uppercase tracking-wide text-green-600">Won</p>
          <p className="text-lg font-semibold text-green-700">{data.wonCount}</p>
          <p className="text-xs text-green-600">{formatCurrency(data.wonRevenue)}</p>
        </article>
        <article className="rounded-lg border border-red-100 bg-red-50 p-3">
          <p className="text-xs uppercase tracking-wide text-red-600">Lost</p>
          <p className="text-lg font-semibold text-red-700">{data.lostCount}</p>
          <p className="text-xs text-red-600">{formatCurrency(data.lostRevenue)}</p>
        </article>
        <article className="rounded-lg border border-blue-100 bg-blue-50 p-3">
          <p className="text-xs uppercase tracking-wide text-blue-600">Win Rate</p>
          <p className="text-lg font-semibold text-blue-700">{formatPercentage(data.winRate)}</p>
        </article>
      </div>

      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-semibold text-slate-800">Lost Reasons</h4>
        {(data.byLostReason ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">No lost reason breakdown available.</p>
        ) : (
          data.byLostReason.map((reason, index) => (
            <div key={`${reason.reason}-${index}`}>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                <span>{reason.reason}</span>
                <span>
                  {reason.percentage.toFixed(1)}% · {reason.count}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-amber-500"
                  style={{
                    width: `${Math.max((reason.count / maxReasonCount) * 100, 8)}%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </WidgetCard>
  );
};
