"use client";

import { useCallback, useEffect, useState } from "react";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { reportService } from "@/services/reportService";
import dynamic from "next/dynamic";
import { ReportHeader } from "@/components/reports/shared/ReportHeader";
import { ChartCard } from "@/components/reports/shared/ChartCard";
import { LeadKpiCards } from "@/components/reports/leads/LeadKpiCards";
import { LeadSourceCards } from "@/components/reports/leads/LeadSourceCards";
import { TopLeadSourcesList } from "@/components/reports/leads/TopLeadSourcesList";
const LeadTrendsChart = dynamic(() => import("@/components/reports/leads/LeadTrendsChart").then(m => ({ default: m.LeadTrendsChart })), { ssr: false });
const LeadQualityChart = dynamic(() => import("@/components/reports/leads/LeadQualityChart").then(m => ({ default: m.LeadQualityChart })), { ssr: false });
const IndustryBreakdownChart = dynamic(() => import("@/components/reports/leads/IndustryBreakdownChart").then(m => ({ default: m.IndustryBreakdownChart })), { ssr: false });
const ConversionBySourceChart = dynamic(() => import("@/components/reports/leads/ConversionBySourceChart").then(m => ({ default: m.ConversionBySourceChart })), { ssr: false });
import { downloadJson } from "@/lib/reportFormat";
import { getApiMessage } from "@/lib/utils";
import type { LeadReport } from "@/types/report";

export default function LeadReportsPage() {
  const { isAdmin, isManager, isRep, loading: roleLoading } = useRoleGuard();
  const canAccess = isAdmin || isManager || isRep;

  const [months, setMonths] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LeadReport | null>(null);

  const loadData = useCallback(async () => {
    if (!canAccess || roleLoading) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await reportService.getLeadReport(months);
      setData(response);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load lead report"));
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
        <ReportHeader
          title="Lead Reports"
          subtitle="Lead source analysis, conversion rates, and qualification metrics"
          backHref="/reports"
          periodOptions={[1, 3, 6, 12]}
          selectedPeriod={months}
          onPeriodChange={setMonths}
        />
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error ?? "Failed to load lead report"}
        </div>
      </div>
    );
  }

  return (
    <div>
      <ReportHeader
        title="Lead Reports"
        subtitle="Lead source analysis, conversion rates, and qualification metrics"
        backHref="/reports"
        periodOptions={[1, 3, 6, 12]}
        selectedPeriod={months}
        onPeriodChange={setMonths}
        onExport={() => downloadJson(`lead-report-${months}m.json`, data)}
      />

      <LeadKpiCards data={data} />

      <div className="mb-3">
        <h3 className="text-lg font-semibold text-slate-900">Lead Source Performance</h3>
        <p className="mt-0.5 text-sm text-slate-500">Total leads vs conversions by source</p>
      </div>
      <LeadSourceCards data={data.sourcePerformance ?? []} />

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Lead Trends" subtitle="Monthly lead flow through funnel">
          <LeadTrendsChart data={data.leadTrends ?? []} />
        </ChartCard>
        <ChartCard title="Lead Quality" subtitle="Distribution by quality score">
          <LeadQualityChart data={data.leadQuality ?? []} />
        </ChartCard>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Industry Breakdown" subtitle="Leads by target industry">
          <IndustryBreakdownChart data={data.industryBreakdown ?? []} />
        </ChartCard>
        <ChartCard title="Conversion Rate by Source" subtitle="Which sources convert best">
          <ConversionBySourceChart data={data.conversionBySource ?? []} />
        </ChartCard>
      </div>

      <ChartCard title="Top Lead Sources" subtitle="Detailed breakdown of best performing channels">
        <TopLeadSourcesList data={data.topLeadSources ?? []} />
      </ChartCard>
    </div>
  );
}
