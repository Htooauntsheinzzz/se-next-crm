"use client";

import { Award, DollarSign, Target, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/reports/shared/KpiCard";
import { formatCurrency, formatPercent } from "@/lib/reportFormat";
import type { SalesReport } from "@/types/report";

interface SalesKpiCardsProps {
  data: SalesReport;
}

export const SalesKpiCards = ({ data }: SalesKpiCardsProps) => {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title="Total Revenue"
        value={formatCurrency(data.totalRevenue)}
        changePercent={data.revenueChangePercent}
        icon={DollarSign}
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />
      <KpiCard
        title="Avg Deal Size"
        value={formatCurrency(data.avgDealSize)}
        changePercent={data.avgDealSizeChangePercent}
        icon={Target}
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />
      <KpiCard
        title="Win Rate"
        value={formatPercent(data.winRate)}
        changePercent={data.winRateChangePercent}
        icon={Award}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
      />
      <KpiCard
        title="Deals Closed"
        value={data.dealsClosed}
        subtitle={`${data.dealsLost} lost`}
        icon={TrendingUp}
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
      />
    </div>
  );
};
