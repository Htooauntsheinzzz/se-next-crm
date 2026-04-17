"use client";

import { formatCurrency, formatPercent } from "@/lib/reportFormat";
import type { TeamPerformance } from "@/types/report";

interface TeamComparisonTableProps {
  data: TeamPerformance[];
}

export const TeamComparisonTable = ({ data }: TeamComparisonTableProps) => {
  if (!data.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No team data available.
      </p>
    );
  }

  const maxRevenue = Math.max(...data.map((t) => t.totalRevenue ?? 0), 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="pb-3 pr-4">Team</th>
            <th className="pb-3 pr-4 text-right">Opportunities</th>
            <th className="pb-3 pr-4 text-right">Won</th>
            <th className="pb-3 pr-4 text-right">Revenue</th>
            <th className="pb-3 pr-4 text-right">Win Rate</th>
            <th className="pb-3 min-w-[140px]">Revenue Share</th>
          </tr>
        </thead>
        <tbody>
          {data.map((team) => {
            const winRate = team.winRate ?? 0;
            const revenue = team.totalRevenue ?? 0;
            const sharePercent =
              maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;

            return (
              <tr
                key={team.teamId}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-xs font-bold text-white">
                      {team.teamName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <span className="font-medium text-slate-800">
                      {team.teamName}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-right font-semibold text-slate-700">
                  {team.totalOpportunities ?? 0}
                </td>
                <td className="py-3 pr-4 text-right text-green-600">
                  {team.wonOpportunities ?? 0}
                </td>
                <td className="py-3 pr-4 text-right font-semibold text-slate-800">
                  {formatCurrency(revenue)}
                </td>
                <td className="py-3 pr-4 text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      winRate >= 60
                        ? "bg-green-50 text-green-600"
                        : winRate >= 40
                          ? "bg-amber-50 text-amber-600"
                          : "bg-red-50 text-red-600"
                    }`}
                  >
                    {formatPercent(winRate, 1)}
                  </span>
                </td>
                <td className="py-3">
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
                      style={{ width: `${Math.max(sharePercent, 3)}%` }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
