"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { WidgetState } from "@/components/dashboard/WidgetState";
import type { TeamPerformance } from "@/types/report";

interface TeamPerformanceTableProps {
  data: TeamPerformance[];
  loading: boolean;
  error?: string;
  onRetry: () => void;
}

type SortKey = "teamName" | "totalOpportunities" | "wonOpportunities" | "totalRevenue" | "winRate";

export const TeamPerformanceTable = ({ data, loading, error, onRetry }: TeamPerformanceTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("totalRevenue");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const sortedRows = useMemo(() => {
    const rows = [...data];
    rows.sort((left, right) => {
      const leftValue = left[sortKey];
      const rightValue = right[sortKey];

      if (typeof leftValue === "string" && typeof rightValue === "string") {
        return sortDirection === "asc"
          ? leftValue.localeCompare(rightValue)
          : rightValue.localeCompare(leftValue);
      }

      const leftNumber = Number(leftValue ?? 0);
      const rightNumber = Number(rightValue ?? 0);
      return sortDirection === "asc" ? leftNumber - rightNumber : rightNumber - leftNumber;
    });
    return rows;
  }, [data, sortDirection, sortKey]);

  const updateSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("desc");
  };

  if (error) {
    return (
      <WidgetCard title="Team Performance">
        <WidgetState mode="error" message="Failed to load team performance" onRetry={onRetry} />
      </WidgetCard>
    );
  }

  if (loading) {
    return (
      <WidgetCard title="Team Performance">
        <div className="h-[240px] animate-pulse rounded-lg bg-slate-200" />
      </WidgetCard>
    );
  }

  if (!data.length) {
    return (
      <WidgetCard title="Team Performance">
        <WidgetState mode="empty" message="No team performance data available" />
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title="Team Performance">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              {[
                { key: "teamName", label: "Team" },
                { key: "totalOpportunities", label: "Total" },
                { key: "wonOpportunities", label: "Won" },
                { key: "totalRevenue", label: "Revenue" },
                { key: "winRate", label: "Win Rate" },
              ].map((column) => {
                const active = sortKey === column.key;
                return (
                  <th key={column.key} className="py-2 pr-3">
                    <button
                      type="button"
                      onClick={() => updateSort(column.key as SortKey)}
                      className="inline-flex items-center gap-1"
                    >
                      {column.label}
                      {active ? (
                        sortDirection === "asc" ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, index) => {
              const winRate = Number(row.winRate ?? 0);
              const barColor =
                winRate >= 60 ? "bg-emerald-500" : winRate >= 40 ? "bg-amber-500" : "bg-red-500";

              return (
                <tr
                  key={row.teamId || `${row.teamName}-${index}`}
                  className="border-b border-slate-100 text-slate-700 odd:bg-white even:bg-slate-50 last:border-none"
                >
                  <td className="py-2 pr-3 font-medium">{row.teamName}</td>
                  <td className="py-2 pr-3">{row.totalOpportunities ?? 0}</td>
                  <td className="py-2 pr-3">{row.wonOpportunities ?? 0}</td>
                  <td className="py-2 pr-3">{formatCurrency(row.totalRevenue ?? 0)}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-slate-200">
                        <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${Math.min(winRate, 100)}%` }} />
                      </div>
                      <span className="text-xs">{formatPercentage(winRate)}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </WidgetCard>
  );
};
