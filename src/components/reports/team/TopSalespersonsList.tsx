"use client";

import { formatCurrency } from "@/lib/reportFormat";
import type { TopSalesperson } from "@/types/report";

interface TopSalespersonsListProps {
  data: TopSalesperson[];
}

const MEDAL_COLORS = [
  "from-yellow-400 to-amber-500",
  "from-slate-300 to-slate-400",
  "from-orange-400 to-orange-600",
];

export const TopSalespersonsList = ({ data }: TopSalespersonsListProps) => {
  if (!data.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No salesperson data available.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((person, index) => {
        const medalGradient =
          index < 3 ? MEDAL_COLORS[index] : "from-slate-200 to-slate-300";

        return (
          <div
            key={person.userId}
            className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100"
          >
            <div
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${medalGradient} text-sm font-bold text-white`}
            >
              {index + 1}
            </div>

            <div className="flex-1 min-w-0">
              <p className="truncate font-semibold text-slate-800">
                {person.fullName}
              </p>
              <p className="text-xs text-slate-500">
                {person.wonCount} deals won · {person.activeOpportunities}{" "}
                active
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-slate-900">
                {formatCurrency(person.wonRevenue)}
              </p>
              <p className="text-xs text-slate-500">
                {formatCurrency(person.activePipelineValue)} pipeline
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
