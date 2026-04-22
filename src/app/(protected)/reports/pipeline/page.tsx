"use client";

import { useCallback, useEffect, useState } from "react";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { reportService } from "@/services/reportService";
import dynamic from "next/dynamic";
import { ReportHeader } from "@/components/reports/shared/ReportHeader";
import { ChartCard } from "@/components/reports/shared/ChartCard";
import { PipelineKpiCards } from "@/components/reports/pipeline/PipelineKpiCards";
import { StageAnalysisCards } from "@/components/reports/pipeline/StageAnalysisCards";
const PipelineConversionFunnelChart = dynamic(() => import("@/components/reports/pipeline/ConversionFunnelChart").then(m => ({ default: m.ConversionFunnelChart })), { ssr: false });
const SalesVelocityChart = dynamic(() => import("@/components/reports/pipeline/SalesVelocityChart").then(m => ({ default: m.SalesVelocityChart })), { ssr: false });
const PipelineCoverageChart = dynamic(() => import("@/components/reports/pipeline/PipelineCoverageChart").then(m => ({ default: m.PipelineCoverageChart })), { ssr: false });
import { downloadCsv } from "@/lib/reportFormat";
import { getApiMessage } from "@/lib/utils";
import type { PipelineFullReport } from "@/types/report";

export default function PipelineReportsPage() {
  const { isAdmin, isManager, isRep, loading: roleLoading } = useRoleGuard();
  const canAccess = isAdmin || isManager || isRep;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PipelineFullReport | null>(null);

  const loadData = useCallback(async () => {
    if (!canAccess || roleLoading) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await reportService.getPipelineFullReport();
      setData(response);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load pipeline report"));
    } finally {
      setLoading(false);
    }
  }, [canAccess, roleLoading]);

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
          title="Pipeline Reports"
          subtitle="Stage analysis, conversion metrics, and velocity trends"
          backHref="/reports"
        />
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error ?? "Failed to load pipeline report"}
        </div>
      </div>
    );
  }

  return (
    <div>
      <ReportHeader
        title="Pipeline Reports"
        subtitle="Stage analysis, conversion metrics, and velocity trends"
        backHref="/reports"
        onExport={() => {
          const headers = ["Stage", "Count", "Total Value ($)", "Avg Days In Stage", "Conversion Rate (%)"];
          const rows = (data.stageAnalysis ?? []).map(s => [
            s.stageName,
            s.count,
            s.totalValue,
            s.avgDaysInStage,
            s.conversionRate
          ]);
          downloadCsv("pipeline-report.csv", headers, rows);
        }}
      />

      <PipelineKpiCards data={data} />

      <div className="mb-3">
        <h3 className="text-lg font-semibold text-slate-900">Stage Analysis</h3>
        <p className="mt-0.5 text-sm text-slate-500">Detailed metrics for each pipeline stage</p>
      </div>
      <StageAnalysisCards data={data.stageAnalysis ?? []} />

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Conversion Funnel" subtitle="Lead to customer journey">
          <PipelineConversionFunnelChart data={data.conversionFunnel ?? []} />
        </ChartCard>
        <ChartCard title="Sales Velocity" subtitle="Average days to close over time">
          <SalesVelocityChart data={data.salesVelocity ?? []} />
        </ChartCard>
      </div>

      <ChartCard title="Pipeline Coverage" subtitle="Pipeline value vs quota (target 3x coverage)">
        <PipelineCoverageChart data={data.pipelineCoverage ?? []} />
      </ChartCard>
    </div>
  );
}
