"use client";

import { format } from "date-fns";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { MonthlyRevenueChart } from "@/components/dashboard/MonthlyRevenueChart";
import { LeadsBySourceChart } from "@/components/dashboard/LeadsBySourceChart";
import { PipelineFunnel } from "@/components/dashboard/PipelineFunnel";
import { ConversionFunnel } from "@/components/dashboard/ConversionFunnel";
import { TopSalespersons } from "@/components/dashboard/TopSalespersons";
import { TeamPerformance } from "@/components/dashboard/TeamPerformance";
import { ActivitySummary } from "@/components/dashboard/ActivitySummary";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { useDashboard } from "@/hooks/useDashboard";

export const DashboardPage = () => {
  const { data, loading, refreshing, error, widgetErrors, lastUpdated, refetch } = useDashboard();

  const lastUpdatedText = lastUpdated
    ? format(lastUpdated, "MMM d, yyyy • hh:mm a")
    : "Not synced yet";

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Last updated: {lastUpdatedText}</p>
        </div>

        <button
          type="button"
          onClick={refetch}
          disabled={refreshing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#CFC2F3] bg-[#8B6FD0] px-4 text-sm font-semibold text-white transition hover:bg-[#7B5FC0] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <span>{error} Some widgets may still show cached data.</span>
        </div>
      ) : null}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <KpiCards summary={data.summary} error={widgetErrors.summary} onRetry={refetch} />
        </div>

        <div className="col-span-12 lg:col-span-8">
          <MonthlyRevenueChart
            data={data.monthlyRevenue}
            error={widgetErrors.monthlyRevenue}
            onRetry={refetch}
          />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <LeadsBySourceChart
            data={data.leadsBySource}
            error={widgetErrors.leadsBySource}
            onRetry={refetch}
          />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <PipelineFunnel
            data={data.pipelineFunnel}
            error={widgetErrors.pipelineFunnel}
            onRetry={refetch}
          />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <ConversionFunnel
            data={data.conversionFunnel}
            error={widgetErrors.conversionFunnel}
            onRetry={refetch}
          />
        </div>

        <div className="col-span-12 lg:col-span-4">
          <TopSalespersons
            data={data.topSalespersons}
            error={widgetErrors.topSalespersons}
            onRetry={refetch}
          />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <TeamPerformance
            data={data.teamPerformance}
            error={widgetErrors.teamPerformance}
            onRetry={refetch}
          />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <ActivitySummary
            data={data.activitySummary}
            error={widgetErrors.activitySummary}
            onRetry={refetch}
          />
        </div>

        <div className="col-span-12">
          <RecentActivityFeed
            data={data.recentFeed}
            error={widgetErrors.recentFeed}
            onRetry={refetch}
          />
        </div>
      </div>
    </div>
  );
};
