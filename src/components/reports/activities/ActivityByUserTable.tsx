"use client";

import type { UserActivitySummary } from "@/types/report";

interface ActivityByUserTableProps {
  data: UserActivitySummary[];
}

export const ActivityByUserTable = ({ data }: ActivityByUserTableProps) => {
  if (!data.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No user activity data available.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="pb-3 pr-4">User</th>
            <th className="pb-3 pr-4 text-right">Total</th>
            <th className="pb-3 pr-4 text-right">Done</th>
            <th className="pb-3 pr-4 text-right">Overdue</th>
            <th className="pb-3 pr-4 text-right">Rate</th>
            <th className="pb-3 min-w-[140px]">Progress</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => {
            const rate =
              user.total > 0
                ? Math.round((user.done / user.total) * 100)
                : 0;

            return (
              <tr
                key={user.userId}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-xs font-bold text-white">
                      {user.userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <span className="font-medium text-slate-800">
                      {user.userName}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-right font-semibold text-slate-700">
                  {user.total}
                </td>
                <td className="py-3 pr-4 text-right text-green-600">
                  {user.done}
                </td>
                <td className="py-3 pr-4 text-right">
                  {user.overdue > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                      {user.overdue}
                    </span>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>
                <td className="py-3 pr-4 text-right text-sm font-medium text-slate-700">
                  {rate}%
                </td>
                <td className="py-3">
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(rate, 2)}%`,
                        background:
                          rate >= 80
                            ? "linear-gradient(90deg, #10B981, #34D399)"
                            : rate >= 50
                              ? "linear-gradient(90deg, #F59E0B, #FBBF24)"
                              : "linear-gradient(90deg, #EF4444, #F87171)",
                      }}
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
