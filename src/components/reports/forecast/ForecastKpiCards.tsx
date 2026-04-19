"use client";

import { DollarSign, TrendingUp, BarChart3, Calendar } from "lucide-react";
import { KpiCard } from "@/components/reports/shared/KpiCard";
import { formatCurrency } from "@/lib/reportFormat";
import type { Forecast } from "@/types/report";

interface ForecastKpiCardsProps {
  data: Forecast;
}

export const ForecastKpiCards = ({ data }: ForecastKpiCardsProps) => {
  const months = data.months ?? [];
  const totalExpected = months.reduce((sum, m) => sum + (m.expectedRevenue ?? 0), 0);
  const totalWon = months.reduce((sum, m) => sum + (m.wonRevenue ?? 0), 0);
  const totalDeals = months.reduce((sum, m) => sum + (m.count ?? 0), 0);
  const avgPerMonth = months.length > 0 ? totalExpected / months.length : 0;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title="Total Forecast"
        value={formatCurrency(totalExpected)}
        subtitle={`${months.length} month outlook`}
        icon={TrendingUp}
        iconBg="bg-indigo-100"
        iconColor="text-indigo-600"
      />
      <KpiCard
        title="Already Won"
        value={formatCurrency(totalWon)}
        subtitle="Revenue secured"
        icon={DollarSign}
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />
      <KpiCard
        title="Open Deals"
        value={totalDeals}
        subtitle="In forecast pipeline"
        icon={BarChart3}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
      />
      <KpiCard
        title="Avg per Month"
        value={formatCurrency(avgPerMonth)}
        subtitle="Expected revenue"
        icon={Calendar}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
      />
    </div>
  );
};
