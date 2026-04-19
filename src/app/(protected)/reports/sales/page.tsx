"use client";

import { useCallback, useEffect, useState } from "react";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { reportService } from "@/services/reportService";
import dynamic from "next/dynamic";
import { ReportHeader } from "@/components/reports/shared/ReportHeader";
import { ChartCard } from "@/components/reports/shared/ChartCard";
import { SalesKpiCards } from "@/components/reports/sales/SalesKpiCards";
import { TopOpportunitiesList } from "@/components/reports/sales/TopOpportunitiesList";
const RevenueTrendChart = dynamic(() => import("@/components/reports/sales/RevenueTrendChart").then(m => ({ default: m.RevenueTrendChart })), { ssr: false });
const DealsByStageChart = dynamic(() => import("@/components/reports/sales/DealsByStageChart").then(m => ({ default: m.DealsByStageChart })), { ssr: false });
const DealSizeDistributionChart = dynamic(() => import("@/components/reports/sales/DealSizeDistributionChart").then(m => ({ default: m.DealSizeDistributionChart })), { ssr: false });
import { downloadCsv } from "@/lib/reportFormat";
import { getApiMessage } from "@/lib/utils";
import type { SalesReport } from "@/types/report";

export default function SalesReportsPage() {
  const { isAdmin, isManager, loading: roleLoading } = useRoleGuard();
  const canAccess = isAdmin || isManager;
  const [months, setMonths] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SalesReport | null>(null);

  const loadData = useCallback(async () => {
    if (!canAccess || roleLoading) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await reportService.getSalesReport(months);
      setData(response);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load sales report"));
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
        <ReportHeader title="Sales Reports" subtitle="Revenue trends and deal performance analytics" />
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error ?? "Failed to load sales report"}
        </div>
      </div>
    );
  }

  return (
    <div>
      <ReportHeader
        title="Sales Reports"
        subtitle="Revenue trends and deal performance analytics"
        periodOptions={[3, 6, 12]}
        selectedPeriod={months}
        onPeriodChange={setMonths}
        onExport={() => {
          const headers = ["Opportunity Name", "Company", "Stage", "Expected Revenue ($)", "Probability (%)"];
          const rows = (data.topOpportunities ?? []).map(o => [
            o.name,
            o.companyName,
            o.stageName,
            o.expectedRevenue,
            o.probability
          ]);
          downloadCsv(`sales-report-${months}m.csv`, headers, rows);
        }}
      />

      <SalesKpiCards data={data} />

      <ChartCard title="Revenue Trend" subtitle="Monthly revenue vs target" className="mb-6">
        <RevenueTrendChart data={data.revenueTrend ?? []} />
      </ChartCard>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Deals by Stage" subtitle="Win/loss breakdown per stage">
          <DealsByStageChart data={data.dealsByStage ?? []} />
        </ChartCard>
        <ChartCard title="Deal Size Distribution" subtitle="Number of deals by value range">
          <DealSizeDistributionChart data={data.dealSizeDistribution ?? []} />
        </ChartCard>
      </div>

      <ChartCard title="Top Opportunities" subtitle="Highest value deals in pipeline">
        <TopOpportunitiesList data={data.topOpportunities ?? []} />
      </ChartCard>
    </div>
  );
}
