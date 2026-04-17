"use client";

import { formatCurrency, formatPercent } from "@/lib/reportFormat";
import type { StageAnalysis } from "@/types/report";

interface StageAnalysisCardsProps {
  data: StageAnalysis[];
}

const BORDER_COLORS = ["border-blue-500", "border-green-500", "border-orange-500", "border-purple-500", "border-indigo-500"];
const DOT_COLORS = ["bg-blue-500", "bg-green-500", "bg-orange-500", "bg-purple-500", "bg-indigo-500"];

export const StageAnalysisCards = ({ data }: StageAnalysisCardsProps) => {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {data.map((stage, index) => {
        const borderClass = BORDER_COLORS[index % BORDER_COLORS.length];
        const dotClass = DOT_COLORS[index % DOT_COLORS.length];
        return (
          <article key={stage.stageId} className={`rounded-2xl border border-slate-200 border-l-4 ${borderClass} bg-white p-5 shadow-sm`}>
            <div className="mb-2 flex items-start justify-between">
              <h4 className="text-base font-semibold text-slate-900">{stage.stageName}</h4>
              <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stage.count}</p>
            <p className="mt-1 text-xs text-slate-500">Total Value: {formatCurrency(stage.totalValue)}</p>
            <p className="text-xs text-slate-500">Avg Time: {stage.avgDaysInStage.toFixed(0)} days</p>
            <p className="text-xs text-slate-500">Conversion: {formatPercent(stage.conversionRate)}</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
              <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${Math.min(stage.conversionRate, 100)}%` }} />
            </div>
          </article>
        );
      })}
    </div>
  );
};
