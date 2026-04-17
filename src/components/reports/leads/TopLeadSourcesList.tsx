"use client";

import { formatPercent } from "@/lib/reportFormat";
import type { TopLeadSource } from "@/types/report";

interface TopLeadSourcesListProps {
  data: TopLeadSource[];
}

const getCircleClassName = (rank: number) => {
  if (rank === 1) return "bg-green-600";
  if (rank === 2) return "bg-green-500";
  if (rank === 3) return "bg-green-400";
  return "bg-slate-400";
};

export const TopLeadSourcesList = ({ data }: TopLeadSourcesListProps) => {
  return (
    <div>
      {data.map((item, index) => (
        <div key={`${item.source}-${index}`} className="flex items-center justify-between gap-3 border-b border-slate-100 py-4 last:border-0">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${getCircleClassName(index + 1)}`}>
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-medium text-slate-900">{item.source}</p>
              <p className="text-xs text-slate-500">{item.totalLeads} total leads</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-right text-xs">
            <div>
              <p className="text-slate-500">Qualified</p>
              <p className="font-semibold text-slate-900">{item.qualifiedCount}</p>
            </div>
            <div>
              <p className="text-slate-500">Converted</p>
              <p className="font-semibold text-slate-900">{item.convertedCount}</p>
            </div>
            <div>
              <p className="text-slate-500">Conversion</p>
              <p className="text-base font-bold text-green-600">{formatPercent(item.conversionRate, 1)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
