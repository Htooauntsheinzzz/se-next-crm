"use client";

import { Medal } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { WidgetState } from "@/components/dashboard/WidgetState";
import type { TopSalesperson } from "@/types/report";

interface TopSalespersonsTableProps {
  data: TopSalesperson[];
  loading: boolean;
  error?: string;
  onRetry: () => void;
}

const getMedalColor = (index: number) => {
  if (index === 0) {
    return "text-amber-500";
  }
  if (index === 1) {
    return "text-slate-400";
  }
  if (index === 2) {
    return "text-orange-500";
  }
  return "text-slate-300";
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.charAt(0) ?? "U") + (parts[1]?.charAt(0) ?? "");
};

export const TopSalespersonsTable = ({ data, loading, error, onRetry }: TopSalespersonsTableProps) => {
  if (error) {
    return (
      <WidgetCard title="Top Salespersons">
        <WidgetState mode="error" message="Failed to load top salespersons" onRetry={onRetry} />
      </WidgetCard>
    );
  }

  if (loading) {
    return (
      <WidgetCard title="Top Salespersons">
        <div className="h-[220px] animate-pulse rounded-lg bg-slate-200" />
      </WidgetCard>
    );
  }

  if (!data.length) {
    return (
      <WidgetCard title="Top Salespersons">
        <WidgetState mode="empty" message="No salesperson data available" />
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title="Top Salespersons">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-3">#</th>
              <th className="py-2 pr-3">Salesperson</th>
              <th className="py-2 pr-3">Won</th>
              <th className="py-2 pr-3">Won Revenue</th>
              <th className="py-2 pr-3">Active</th>
              <th className="py-2">Pipeline</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.userId || `${item.fullName}-${index}`} className="border-b border-slate-100 last:border-none">
                <td className="py-2 pr-3 align-middle text-slate-700">
                  <span className="inline-flex items-center gap-1">
                    {index + 1}
                    {index < 3 ? <Medal className={`h-4 w-4 ${getMedalColor(index)}`} /> : null}
                  </span>
                </td>
                <td className="py-2 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#EEE7FB] text-[10px] font-semibold text-[#7A58BE]">
                      {getInitials(item.fullName || "Unknown")}
                    </span>
                    <span className="font-medium text-slate-800">{item.fullName || "Unknown"}</span>
                  </div>
                </td>
                <td className="py-2 pr-3 text-slate-700">{item.wonCount ?? 0}</td>
                <td className="py-2 pr-3 text-slate-700">{formatCurrency(item.wonRevenue ?? 0)}</td>
                <td className="py-2 pr-3 text-slate-700">{item.activeOpportunities ?? 0}</td>
                <td className="py-2 text-slate-700">{formatCurrency(item.activePipelineValue ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetCard>
  );
};
