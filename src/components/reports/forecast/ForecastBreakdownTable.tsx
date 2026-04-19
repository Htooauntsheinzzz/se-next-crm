"use client";

import { formatCurrency } from "@/lib/reportFormat";
import type { MonthForecast } from "@/types/report";

interface ForecastBreakdownTableProps {
  data: MonthForecast[];
}

export const ForecastBreakdownTable = ({ data }: ForecastBreakdownTableProps) => {
  if (!data.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No forecast data available.
      </p>
    );
  }

  const maxExpected = Math.max(...data.map((m) => m.expectedRevenue ?? 0), 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="pb-3 pr-4">Month</th>
            <th className="pb-3 pr-4 text-right">Open Deals</th>
            <th className="pb-3 pr-4 text-right">Expected Revenue</th>
            <th className="pb-3 pr-4 text-right">Won Revenue</th>
            <th className="pb-3 pr-4 text-right">Confidence</th>
            <th className="pb-3 min-w-[140px]">Forecast</th>
          </tr>
        </thead>
        <tbody>
          {data.map((m) => {
            const expected = m.expectedRevenue ?? 0;
            const won = m.wonRevenue ?? 0;
            const barPercent =
              maxExpected > 0 ? (expected / maxExpected) * 100 : 0;
            const confidence =
              expected > 0 ? Math.min(Math.round((won / expected) * 100), 100) : 0;

            return (
              <tr
                key={`${m.year}-${m.month}`}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white">
                      {m.monthName.slice(0, 3)}
                    </div>
                    <span className="font-medium text-slate-800">
                      {m.monthName} {m.year}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-right font-semibold text-slate-700">
                  {m.count}
                </td>
                <td className="py-3 pr-4 text-right font-semibold text-indigo-600">
                  {formatCurrency(expected)}
                </td>
                <td className="py-3 pr-4 text-right text-green-600">
                  {formatCurrency(won)}
                </td>
                <td className="py-3 pr-4 text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      confidence >= 60
                        ? "bg-green-50 text-green-600"
                        : confidence >= 30
                          ? "bg-amber-50 text-amber-600"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {confidence}%
                  </span>
                </td>
                <td className="py-3">
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-400 transition-all duration-500"
                      style={{ width: `${Math.max(barPercent, 3)}%` }}
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
