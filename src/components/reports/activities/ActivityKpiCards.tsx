"use client";

import { Activity, AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";
import { KpiCard } from "@/components/reports/shared/KpiCard";
import { formatPercent } from "@/lib/reportFormat";
import type { ActivityReport } from "@/types/report";

interface ActivityKpiCardsProps {
  data: ActivityReport;
}

export const ActivityKpiCards = ({ data }: ActivityKpiCardsProps) => {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title="Total Activities"
        value={data.totalActivities}
        subtitle={`${data.doneCount} completed`}
        icon={Activity}
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
      />
      <KpiCard
        title="Completion Rate"
        value={formatPercent(data.completionRate, 1)}
        subtitle={`${data.doneCount} of ${data.totalActivities}`}
        icon={CheckCircle2}
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />
      <KpiCard
        title="Overdue"
        value={data.overdueCount}
        subtitle="Need attention"
        icon={AlertTriangle}
        iconBg="bg-red-100"
        iconColor="text-red-600"
      />
      <KpiCard
        title="Pending"
        value={data.pendingCount}
        subtitle="In progress"
        icon={Clock3}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
      />
    </div>
  );
};
