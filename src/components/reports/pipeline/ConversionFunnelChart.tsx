"use client";

import { formatPercent } from "@/lib/reportFormat";
import type { StageFunnel } from "@/types/report";

interface ConversionFunnelChartProps {
  data: StageFunnel[];
}

const COLORS = ["bg-amber-400", "bg-green-500", "bg-purple-500", "bg-blue-500", "bg-emerald-600"];

export const ConversionFunnelChart = ({ data }: ConversionFunnelChartProps) => {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="space-y-2">
      {data.map((stage, index) => {
        const width = `${Math.max((stage.count / maxCount) * 100, 20)}%`;
        return (
          <div key={`${stage.stageName}-${index}`} className="space-y-1">
            <div className={`rounded-lg px-4 py-3 text-sm font-medium text-white ${COLORS[index % COLORS.length]}`} style={{ width }}>
              <div className="flex items-center justify-between gap-2">
                <span>{stage.stageName}</span>
                <span>{stage.count} · {formatPercent(stage.percentage, 0)}</span>
              </div>
            </div>
            {index < data.length - 1 ? (
              <p className="pl-2 text-xs text-slate-500">→ {formatPercent(stage.conversionToNext, 1)} conversion</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
