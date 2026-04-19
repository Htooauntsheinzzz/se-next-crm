"use client";

import { formatPercent } from "@/lib/reportFormat";
import type { LeadSourcePerformance } from "@/types/report";

interface LeadSourceCardsProps {
  data: LeadSourcePerformance[];
}

const BORDER_COLORS = ["border-blue-500", "border-green-500", "border-indigo-500", "border-pink-500"];
const DOT_COLORS = ["bg-blue-500", "bg-green-500", "bg-indigo-500", "bg-pink-500"];

export const LeadSourceCards = ({ data }: LeadSourceCardsProps) => {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {data.map((source, index) => (
        <article
          key={`${source.source}-${index}`}
          className={`rounded-2xl border border-slate-200 border-l-4 ${BORDER_COLORS[index % BORDER_COLORS.length]} bg-white p-5 shadow-sm`}
        >
          <div className="mb-2 flex items-start justify-between">
            <h4 className="text-base font-semibold text-slate-900">{source.source}</h4>
            <span className={`h-2.5 w-2.5 rounded-full ${DOT_COLORS[index % DOT_COLORS.length]}`} />
          </div>
          <p className="text-2xl font-bold text-slate-900">{source.totalLeads}</p>
          <p className="text-xs text-slate-500">Converted: <span className="font-medium text-green-600">{source.convertedCount}</span></p>
          <p className="text-xs text-slate-500">{formatPercent(source.conversionRate)} conversion</p>
        </article>
      ))}
    </div>
  );
};
