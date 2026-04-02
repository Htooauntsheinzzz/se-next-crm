"use client";

import { ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { formatCurrency, toSafeNumber } from "@/lib/format";
import type { TeamPerformanceItem } from "@/types/dashboard";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { WidgetState } from "@/components/dashboard/WidgetState";

type SortKey = keyof TeamPerformanceItem;
type SortDirection = "asc" | "desc";

interface TeamPerformanceProps {
  data: TeamPerformanceItem[];
  error?: string;
  onRetry: () => void;
}

const numericKeys: SortKey[] = ["totalLeads", "totalOpportunities", "totalRevenue"];

export const TeamPerformance = ({ data, error, onRetry }: TeamPerformanceProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("totalRevenue");
  const [direction, setDirection] = useState<SortDirection>("desc");

  const sortedData = useMemo(() => {
    const copy = [...data];

    copy.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (numericKeys.includes(sortKey)) {
        const numericA = toSafeNumber(aValue as number);
        const numericB = toSafeNumber(bValue as number);
        return direction === "asc" ? numericA - numericB : numericB - numericA;
      }

      const textA = String(aValue);
      const textB = String(bValue);
      return direction === "asc" ? textA.localeCompare(textB) : textB.localeCompare(textA);
    });

    return copy;
  }, [data, direction, sortKey]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setDirection(numericKeys.includes(key) ? "desc" : "asc");
  };

  if (error) {
    return (
      <WidgetCard title="Team Performance">
        <WidgetState mode="error" message="Failed to load team performance" onRetry={onRetry} />
      </WidgetCard>
    );
  }

  if (data.length === 0) {
    return (
      <WidgetCard title="Team Performance">
        <WidgetState mode="empty" message="No team data available" />
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title="Team Performance">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[440px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="pb-2">
                <button type="button" className="inline-flex items-center gap-1" onClick={() => handleSort("teamName")}>
                  Team
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="pb-2">
                <button type="button" className="inline-flex items-center gap-1" onClick={() => handleSort("totalLeads")}>
                  Leads
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="pb-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1"
                  onClick={() => handleSort("totalOpportunities")}
                >
                  Opportunities
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="pb-2 text-right">
                <button
                  type="button"
                  className="inline-flex items-center gap-1"
                  onClick={() => handleSort("totalRevenue")}
                >
                  Revenue
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((team, index) => (
              <tr key={team.teamName + "-" + index} className="border-b border-slate-100 odd:bg-slate-50/50 hover:bg-slate-50">
                <td className="px-1 py-2.5 font-medium text-slate-800">{team.teamName}</td>
                <td className="px-1 py-2.5 text-slate-700">{toSafeNumber(team.totalLeads)}</td>
                <td className="px-1 py-2.5 text-slate-700">{toSafeNumber(team.totalOpportunities)}</td>
                <td className="px-1 py-2.5 text-right font-semibold text-slate-800">
                  {formatCurrency(toSafeNumber(team.totalRevenue))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetCard>
  );
};
