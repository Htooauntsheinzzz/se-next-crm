"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, Target, TrendingUp, Users } from "lucide-react";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { reportService } from "@/services/reportService";
import { ReportHeader } from "@/components/reports/shared/ReportHeader";
import { ReportCard } from "@/components/reports/hub/ReportCard";
import { PerformanceOverview } from "@/components/reports/hub/PerformanceOverview";
import { formatCurrency, formatPercent } from "@/lib/reportFormat";
import { getApiMessage } from "@/lib/utils";
import type {
  ActivitySummary,
  ConversionFunnel,
  DashboardSummary,
  Forecast,
  TeamPerformance,
} from "@/types/report";

export default function ReportsHubPage() {
  const { isAdmin, isManager, isRep, loading: roleLoading } = useRoleGuard();
  const canAccess = isAdmin || isManager || isRep;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel | null>(null);

  const loadData = useCallback(async () => {
    if (!canAccess || roleLoading) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const tasks = await Promise.allSettled([
      reportService.getDashboardSummary(),
      reportService.getActivitySummary(),
      reportService.getTeamPerformance(),
      reportService.getForecast(3),
      reportService.getConversionFunnel(),
    ]);

    const [summaryResult, activityResult, teamResult, forecastResult, conversionResult] = tasks;

    if (summaryResult.status === "fulfilled") setSummary(summaryResult.value);
    if (activityResult.status === "fulfilled") setActivitySummary(activityResult.value);
    if (teamResult.status === "fulfilled") setTeamPerformance(teamResult.value ?? []);
    if (forecastResult.status === "fulfilled") setForecast(forecastResult.value);
    if (conversionResult.status === "fulfilled") setConversionFunnel(conversionResult.value);

    const failed = tasks.filter((result) => result.status === "rejected");
    if (failed.length === tasks.length) {
      setError("Failed to load reports hub");
    } else if (failed.length > 0) {
      const firstError = failed[0] as PromiseRejectedResult;
      setError(getApiMessage(firstError.reason, "Some report previews failed to load"));
    }

    setLoading(false);
  }, [canAccess, roleLoading]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const topTeam = useMemo(() => {
    if (!teamPerformance.length) return null;
    return [...teamPerformance].sort((a, b) => (b.winRate ?? 0) - (a.winRate ?? 0))[0];
  }, [teamPerformance]);

  if (roleLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 animate-pulse rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
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

  return (
    <div className="space-y-6">
      <ReportHeader
        title="Reports & Analytics"
        subtitle="Gain insights into your sales performance and team productivity"
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportCard
          href="/reports/sales"
          icon={TrendingUp}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          title="Sales Reports"
          subtitle="Revenue trends and deal performance"
          stats={[
            { label: "Total Revenue", value: formatCurrency(summary?.totalRevenue) },
            { label: "Win Rate", value: formatPercent(summary?.winRate, 1) },
            { label: "Deals Closed", value: String(summary?.wonOpportunities ?? 0) },
          ]}
        />

        <ReportCard
          href="/reports/pipeline"
          icon={BarChart3}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          title="Pipeline Reports"
          subtitle="Pipeline value and stage conversion"
          stats={[
            { label: "Pipeline Value", value: formatCurrency(summary?.pipelineValue) },
            {
              label: "Avg Deal Size",
              value:
                summary && summary.totalOpportunities > 0
                  ? formatCurrency(summary.pipelineValue / summary.totalOpportunities)
                  : "$0",
            },
            { label: "Active Opps", value: String(summary?.openOpportunities ?? 0) },
          ]}
        />

        <ReportCard
          href="/reports/activities"
          icon={Activity}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          title="Activity Reports"
          subtitle="Task completion and productivity"
          stats={[
            { label: "This Month", value: String(activitySummary?.totalCompletedThisWeek ?? 0) },
            {
              label: "Completion Rate",
              value:
                activitySummary && activitySummary.totalPending + activitySummary.totalCompletedThisWeek > 0
                  ? formatPercent(
                      (activitySummary.totalCompletedThisWeek /
                        (activitySummary.totalPending + activitySummary.totalCompletedThisWeek)) *
                        100,
                      0,
                    )
                  : "0%",
            },
            { label: "Avg/Day", value: String(activitySummary?.totalCompletedToday ?? 0) },
          ]}
        />

        <ReportCard
          href="/reports/team"
          icon={Users}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          title="Team Performance"
          subtitle="Top reps and quota attainment"
          stats={[
            { label: "Top Performer", value: topTeam?.teamName ?? "-" },
            { label: "Quota", value: topTeam ? formatPercent(topTeam.winRate, 0) : "0%" },
            { label: "Active Reps", value: String(teamPerformance.length) },
          ]}
        />

        <ReportCard
          href="/reports/leads"
          icon={Target}
          iconBg="bg-pink-100"
          iconColor="text-pink-600"
          title="Lead Reports"
          subtitle="Lead quality and conversion metrics"
          stats={[
            { label: "New Leads", value: String(conversionFunnel?.totalLeads ?? 0) },
            { label: "Conversion", value: formatPercent(conversionFunnel?.leadToOpportunityRate, 1) },
            { label: "Qualified", value: String(conversionFunnel?.qualifiedLeads ?? 0) },
          ]}
        />

        <ReportCard
          href="/reports/forecast"
          icon={TrendingUp}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
          title="Forecast Reports"
          subtitle="Future revenue outlook"
          stats={[
            { label: "Q2 Forecast", value: formatCurrency(forecast?.totalForecast) },
            { label: "Coverage", value: summary ? formatPercent(summary.winRate, 0) : "0%" },
            { label: "Confidence", value: summary ? formatPercent(summary.winRate, 0) : "0%" },
          ]}
        />
      </div>

      <PerformanceOverview
        items={[
          {
            label: "Monthly Revenue",
            value: formatCurrency(summary?.totalRevenue),
            subtext: "+23% vs last month",
          },
          {
            label: "Active Deals",
            value: String(summary?.openOpportunities ?? 0),
            subtext: `${formatCurrency(summary?.pipelineValue)} total value`,
          },
          {
            label: "Team Quota",
            value: formatPercent(summary?.winRate, 0),
            subtext: "+5% this week",
          },
          {
            label: "Win Rate",
            value: formatPercent(summary?.winRate, 0),
            subtext: "Above target 60%",
          },
        ]}
      />
    </div>
  );
}
