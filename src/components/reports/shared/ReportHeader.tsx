"use client";

import { CalendarDays } from "lucide-react";
import { ExportButton } from "@/components/reports/shared/ExportButton";

interface ReportHeaderProps {
  title: string;
  subtitle: string;
  periodOptions?: number[];
  selectedPeriod?: number;
  onPeriodChange?: (months: number) => void;
  onExport?: () => void;
  periodLabelSuffix?: string;
}

export const ReportHeader = ({
  title,
  subtitle,
  periodOptions,
  selectedPeriod,
  onPeriodChange,
  onExport,
  periodLabelSuffix = "Months",
}: ReportHeaderProps) => {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      {(periodOptions?.length || onExport) ? (
        <div className="flex flex-wrap items-center gap-2">
          {periodOptions?.length && typeof selectedPeriod === "number" && onPeriodChange ? (
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedPeriod}
                onChange={(event) => onPeriodChange(Number(event.target.value))}
                className="h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm font-medium text-slate-700 outline-none ring-[#8B6DD0] transition focus:ring-2"
              >
                {periodOptions.map((value) => (
                  <option key={value} value={value}>
                    Last {value} {periodLabelSuffix}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {onExport ? <ExportButton onClick={onExport} /> : null}
        </div>
      ) : null}
    </header>
  );
};
