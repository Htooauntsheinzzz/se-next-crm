"use client";

import { useCallback, useEffect, useState } from "react";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { reportService } from "@/services/reportService";
import { ReportHeader } from "@/components/reports/shared/ReportHeader";
import { ChartCard } from "@/components/reports/shared/ChartCard";
import { TeamKpiCards } from "@/components/reports/team/TeamKpiCards";
import { TeamRevenueChart } from "@/components/reports/team/TeamRevenueChart";
import { TeamWinRateChart } from "@/components/reports/team/TeamWinRateChart";
import { TeamComparisonTable } from "@/components/reports/team/TeamComparisonTable";
import { TopSalespersonsList } from "@/components/reports/team/TopSalespersonsList";
import { downloadCsv } from "@/lib/reportFormat";
import { getApiMessage } from "@/lib/utils";
import type { TeamPerformance, TopSalesperson } from "@/types/report";

export default function TeamReportsPage() {
  const { isAdmin, isManager, loading: roleLoading } = useRoleGuard();
  const canAccess = isAdmin || isManager;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<TeamPerformance[]>([]);
  const [topSalespersons, setTopSalespersons] = useState<TopSalesperson[]>([]);

  const loadData = useCallback(async () => {
    if (!canAccess || roleLoading) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [teamsData, salespersonsData] = await Promise.all([
        reportService.getTeamPerformance(),
        reportService.getTopSalespersons({ limit: 10 }),
      ]);
      setTeams(teamsData ?? []);
      setTopSalespersons(salespersonsData ?? []);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load team performance report"));
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

  if (error) {
    return (
      <div className="space-y-4">
        <ReportHeader
          title="Team Performance Reports"
          subtitle="Team-level productivity and quota analytics"
        />
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <ReportHeader
        title="Team Performance Reports"
        subtitle="Team-level productivity and quota analytics"
        onExport={() => {
          const headers = ["Team Name", "Total Opportunities", "Won Opportunities", "Total Revenue", "Win Rate (%)"];
          const rows = teams.map(t => [
            t.teamName,
            t.totalOpportunities ?? 0,
            t.wonOpportunities ?? 0,
            t.totalRevenue ?? 0,
            t.winRate ?? 0
          ]);
          downloadCsv("team-performance-report.csv", headers, rows);
        }}
      />

      <TeamKpiCards teams={teams} />

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Revenue by Team" subtitle="Total revenue per team">
          <TeamRevenueChart data={teams} />
        </ChartCard>
        <ChartCard
          title="Deals Won vs Open/Lost"
          subtitle="Deal outcome comparison by team"
        >
          <TeamWinRateChart data={teams} />
        </ChartCard>
      </div>

      <ChartCard
        title="Team Comparison"
        subtitle="Detailed metrics for each team"
        className="mb-6"
      >
        <TeamComparisonTable data={teams} />
      </ChartCard>

      <ChartCard
        title="Top Salespersons"
        subtitle="Best performing individual contributors"
      >
        <TopSalespersonsList data={topSalespersons} />
      </ChartCard>
    </div>
  );
}
