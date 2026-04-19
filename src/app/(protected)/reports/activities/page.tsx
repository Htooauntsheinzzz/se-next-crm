"use client";

import { useCallback, useEffect, useState } from "react";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { reportService } from "@/services/reportService";
import dynamic from "next/dynamic";
import { ReportHeader } from "@/components/reports/shared/ReportHeader";
import { ChartCard } from "@/components/reports/shared/ChartCard";
import { ActivityKpiCards } from "@/components/reports/activities/ActivityKpiCards";
import { ActivityByUserTable } from "@/components/reports/activities/ActivityByUserTable";
const ActivityByTypeChart = dynamic(() => import("@/components/reports/activities/ActivityByTypeChart").then(m => ({ default: m.ActivityByTypeChart })), { ssr: false });
const ActivityTrendChart = dynamic(() => import("@/components/reports/activities/ActivityTrendChart").then(m => ({ default: m.ActivityTrendChart })), { ssr: false });
import { downloadCsv } from "@/lib/reportFormat";
import { getApiMessage } from "@/lib/utils";
import type { ActivityReport } from "@/types/report";

export default function ActivityReportsPage() {
  const { isAdmin, isManager, loading: roleLoading } = useRoleGuard();
  const canAccess = isAdmin || isManager;
  const [months, setMonths] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ActivityReport | null>(null);

  const loadData = useCallback(async () => {
    if (!canAccess || roleLoading) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth() - months, 1);
      const fromStr = from.toISOString().split("T")[0];
      const toStr = now.toISOString().split("T")[0];

      const response = await reportService.getActivities({ from: fromStr, to: toStr });
      setData(response);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load activity report"));
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
        <div className="h-[300px] animate-pulse rounded-2xl bg-slate-200" />
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
        <ReportHeader title="Activity Reports" subtitle="Task completion and productivity analytics" />
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error ?? "Failed to load activity report"}
        </div>
      </div>
    );
  }

  return (
    <div>
      <ReportHeader
        title="Activity Reports"
        subtitle="Task completion and productivity analytics"
        periodOptions={[3, 6, 12]}
        selectedPeriod={months}
        onPeriodChange={setMonths}
        onExport={() => {
          const headers = ["User", "Total Activities", "Done", "Overdue", "Completion Rate (%)"];
          const rows = (data.byUser ?? []).map(u => {
             const rate = u.total > 0 ? Math.round((u.done / u.total) * 100) : 0;
             return [u.userName, u.total, u.done, u.overdue, rate];
          });
          downloadCsv(`activity-report-${months}m.csv`, headers, rows);
        }}
      />

      <ActivityKpiCards data={data} />

      <ChartCard title="Activity Trend" subtitle="Monthly created vs completed activities" className="mb-6">
        <ActivityTrendChart data={data.trend ?? []} />
      </ChartCard>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="By Activity Type" subtitle="Distribution across types">
          <ActivityByTypeChart data={data.byType ?? []} />
        </ChartCard>

        <ChartCard title="Type Breakdown" subtitle="Detailed counts per type">
          <div className="space-y-3">
            {(data.byType ?? []).length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">No type data available.</p>
            ) : (
              (data.byType ?? []).map((t) => {
                const rate = t.count > 0 ? Math.round((t.done / t.count) * 100) : 0;
                return (
                  <div key={t.type} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">
                        {t.type.charAt(0) + t.type.slice(1).toLowerCase()}
                      </span>
                      <span className="text-xs text-slate-500">{t.count} total</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
                      <span className="text-green-600">{t.done} done</span>
                      <span className="text-slate-300">·</span>
                      {t.overdue > 0 ? (
                        <span className="text-red-500">{t.overdue} overdue</span>
                      ) : (
                        <span className="text-slate-400">0 overdue</span>
                      )}
                      <span className="text-slate-300">·</span>
                      <span className="font-medium text-slate-700">{rate}% done</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all"
                        style={{ width: `${Math.max(rate, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Team Activity Breakdown" subtitle="Per-user activity completion">
        <ActivityByUserTable data={data.byUser ?? []} />
      </ChartCard>
    </div>
  );
}
