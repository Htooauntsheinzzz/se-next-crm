"use client";

import { Award, DollarSign, Target, Users } from "lucide-react";
import { KpiCard } from "@/components/reports/shared/KpiCard";
import { formatCurrency, formatPercent } from "@/lib/reportFormat";
import type { TeamPerformance } from "@/types/report";

interface TeamKpiCardsProps {
  teams: TeamPerformance[];
}

export const TeamKpiCards = ({ teams }: TeamKpiCardsProps) => {
  const totalRevenue = teams.reduce((sum, t) => sum + (t.totalRevenue ?? 0), 0);
  const totalOpps = teams.reduce((sum, t) => sum + (t.totalOpportunities ?? 0), 0);
  const totalWon = teams.reduce((sum, t) => sum + (t.wonOpportunities ?? 0), 0);
  const avgWinRate =
    teams.length > 0
      ? teams.reduce((sum, t) => sum + (t.winRate ?? 0), 0) / teams.length
      : 0;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title="Total Teams"
        value={teams.length}
        subtitle="Active sales teams"
        icon={Users}
        iconBg="bg-orange-100"
        iconColor="text-orange-600"
      />
      <KpiCard
        title="Total Revenue"
        value={formatCurrency(totalRevenue)}
        subtitle={`${totalWon} deals won`}
        icon={DollarSign}
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />
      <KpiCard
        title="Total Opportunities"
        value={totalOpps}
        subtitle={`${totalWon} won`}
        icon={Target}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
      />
      <KpiCard
        title="Avg Win Rate"
        value={formatPercent(avgWinRate, 1)}
        subtitle="Across all teams"
        icon={Award}
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
      />
    </div>
  );
};
