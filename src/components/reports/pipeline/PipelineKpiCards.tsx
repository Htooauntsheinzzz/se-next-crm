"use client";

import { Clock3, Target, TrendingUp, Wallet } from "lucide-react";
import { KpiCard } from "@/components/reports/shared/KpiCard";
import { formatCurrency, formatPercent } from "@/lib/reportFormat";
import type { PipelineFullReport } from "@/types/report";

interface PipelineKpiCardsProps {
  data: PipelineFullReport;
}

export const PipelineKpiCards = ({ data }: PipelineKpiCardsProps) => {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title="Pipeline Value"
        value={formatCurrency(data.pipelineValue)}
        subtitle={`${data.totalOpportunities} opportunities`}
        icon={Wallet}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
      />
      <KpiCard
        title="Avg Deal Size"
        value={formatCurrency(data.avgDealSize)}
        subtitle="Across all stages"
        icon={TrendingUp}
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />
      <KpiCard
        title="Conversion Rate"
        value={formatPercent(data.conversionRate)}
        icon={Target}
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />
      <KpiCard
        title="Avg Cycle Time"
        value={`${data.avgCycleTimeDays.toFixed(0)} days`}
        changePercent={data.cycleTimeChangeFromLastQuarter}
        icon={Clock3}
        iconBg="bg-orange-100"
        iconColor="text-orange-600"
      />
    </div>
  );
};
