"use client";

import { formatPercentage } from "@/lib/format";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { WidgetState } from "@/components/dashboard/WidgetState";
import type { ConversionFunnel } from "@/types/report";

interface ConversionFunnelChartProps {
  data: ConversionFunnel | null;
  loading: boolean;
  error?: string;
  onRetry: () => void;
}

const FUNNEL_ROWS = [
  { key: "totalLeads", label: "Total Leads", color: "#3B82F6" },
  { key: "contactedLeads", label: "Contacted", color: "#F59E0B" },
  { key: "qualifiedLeads", label: "Qualified", color: "#10B981" },
  { key: "convertedLeads", label: "Converted", color: "#8B6DD0" },
  { key: "lostLeads", label: "Lost", color: "#EF4444" },
] as const;

export const ConversionFunnelChart = ({ data, loading, error, onRetry }: ConversionFunnelChartProps) => {
  if (error) {
    return (
      <WidgetCard title="Conversion Funnel">
        <WidgetState mode="error" message="Failed to load conversion funnel" onRetry={onRetry} />
      </WidgetCard>
    );
  }

  if (loading) {
    return (
      <WidgetCard title="Conversion Funnel">
        <div className="h-[300px] animate-pulse rounded-lg bg-slate-200" />
      </WidgetCard>
    );
  }

  if (!data) {
    return (
      <WidgetCard title="Conversion Funnel">
        <WidgetState mode="empty" message="No conversion funnel data available" />
      </WidgetCard>
    );
  }

  const maxCount = Math.max(
    data.totalLeads,
    data.contactedLeads,
    data.qualifiedLeads,
    data.convertedLeads,
    data.lostLeads,
    1,
  );

  return (
    <WidgetCard title="Conversion Funnel">
      <div className="space-y-3">
        {FUNNEL_ROWS.map((row) => {
          const count = Number(data[row.key] ?? 0);
          const width = `${Math.max((count / maxCount) * 100, 8)}%`;
          return (
            <div key={row.key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{row.label}</span>
                <span className="text-xs text-slate-500">{count.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div className="h-2 rounded-full" style={{ width, backgroundColor: row.color }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-indigo-500">Lead to Opportunity</p>
          <p className="text-lg font-semibold text-indigo-700">
            {formatPercentage(data.leadToOpportunityRate)}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-emerald-500">Opportunity to Win</p>
          <p className="text-lg font-semibold text-emerald-700">
            {formatPercentage(data.opportunityToWinRate)}
          </p>
        </div>
      </div>
    </WidgetCard>
  );
};
