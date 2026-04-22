"use client";

import { useCallback, useEffect, useState } from "react";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { reportService } from "@/services/reportService";
import dynamic from "next/dynamic";
import { ReportHeader } from "@/components/reports/shared/ReportHeader";
import { ChartCard } from "@/components/reports/shared/ChartCard";
import { ForecastKpiCards } from "@/components/reports/forecast/ForecastKpiCards";
import { ForecastBreakdownTable } from "@/components/reports/forecast/ForecastBreakdownTable";
const ForecastTrendChart = dynamic(() => import("@/components/reports/forecast/ForecastTrendChart").then(m => ({ default: m.ForecastTrendChart })), { ssr: false });
const ForecastConfidenceChart = dynamic(() => import("@/components/reports/forecast/ForecastConfidenceChart").then(m => ({ default: m.ForecastConfidenceChart })), { ssr: false });
import { downloadCsv } from "@/lib/reportFormat";
import { getApiMessage } from "@/lib/utils";
import type { Forecast } from "@/types/report";

export default function ForecastReportsPage() {
  const { isAdmin, isManager, isRep, loading: roleLoading } = useRoleGuard();
  const canAccess = isAdmin || isManager || isRep;
  const [months, setMonths] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Forecast | null>(null);

  const loadData = useCallback(async () => {
    if (!canAccess || roleLoading) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await reportService.getForecast(months);
      setData(response);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load forecast report"));
    } finally {
      setLoading(false);
    }
  }, [canAccess, months, roleLoading]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (roleLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 animate-pulse rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="h-[320px] animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">
        You don&apos;t have permission to view reports. Contact your manager.
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <ReportHeader
          title="Forecast Reports"
          subtitle="Revenue outlook and forecast confidence"
        />
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error ?? "Failed to load forecast report"}
        </div>
      </div>
    );
  }

  const forecastMonths = data.months ?? [];

  return (
    <div>
      <ReportHeader
        title="Forecast Reports"
        subtitle="Revenue outlook and forecast confidence"
        periodOptions={[3, 6, 12]}
        selectedPeriod={months}
        onPeriodChange={setMonths}
        onExport={() => {
          const headers = [
            "Month",
            "Year",
            "Open Deals",
            "Expected Revenue ($)",
            "Won Revenue ($)",
          ];
          const rows = forecastMonths.map((m) => [
            m.monthName,
            m.year,
            m.count,
            m.expectedRevenue,
            m.wonRevenue,
          ]);
          downloadCsv(`forecast-report-${months}m.csv`, headers, rows);
        }}
      />

      <ForecastKpiCards data={data} />

      <ChartCard
        title="Revenue Forecast"
        subtitle="Expected vs won revenue by month"
        className="mb-6"
      >
        <ForecastTrendChart data={forecastMonths} />
      </ChartCard>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Forecast Distribution"
          subtitle="Revenue breakdown by month"
        >
          <ForecastConfidenceChart data={forecastMonths} />
        </ChartCard>

        <ChartCard
          title="Monthly Summary"
          subtitle="Quick stats per forecast month"
        >
          <div className="space-y-3">
            {forecastMonths.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">
                No forecast data available.
              </p>
            ) : (
              forecastMonths.map((m) => {
                const expected = m.expectedRevenue ?? 0;
                const won = m.wonRevenue ?? 0;
                const confidence =
                  expected > 0
                    ? Math.min(Math.round((won / expected) * 100), 100)
                    : 0;

                return (
                  <div
                    key={`${m.year}-${m.month}`}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">
                        {m.monthName} {m.year}
                      </span>
                      <span className="text-xs text-slate-500">
                        {m.count} deal{m.count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
                      <span className="text-indigo-600">
                        ${((expected) / 1000).toFixed(0)}K expected
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-green-600">
                        ${((won) / 1000).toFixed(0)}K won
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="font-medium text-slate-700">
                        {confidence}% secured
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-400 transition-all"
                        style={{
                          width: `${Math.max(confidence, 2)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title="Forecast Breakdown"
        subtitle="Detailed monthly forecast data"
      >
        <ForecastBreakdownTable data={forecastMonths} />
      </ChartCard>
    </div>
  );
}
