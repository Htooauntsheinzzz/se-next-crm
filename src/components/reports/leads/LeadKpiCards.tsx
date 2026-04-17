"use client";

import { CalendarClock, CheckCircle2, Target, Users } from "lucide-react";
import { KpiCard } from "@/components/reports/shared/KpiCard";
import { formatPercent } from "@/lib/reportFormat";
import type { LeadReport } from "@/types/report";

interface LeadKpiCardsProps {
  data: LeadReport;
}

export const LeadKpiCards = ({ data }: LeadKpiCardsProps) => {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title="Total Leads"
        value={data.totalLeads}
        changePercent={data.leadsChangePercent}
        icon={Users}
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />
      <KpiCard
        title="Qualified"
        value={data.qualifiedLeads}
        subtitle={`${formatPercent(data.totalLeads > 0 ? (data.qualifiedLeads / data.totalLeads) * 100 : 0)} qualification rate`}
        icon={CheckCircle2}
        iconBg="bg-orange-100"
        iconColor="text-orange-600"
      />
      <KpiCard
        title="Conversion Rate"
        value={formatPercent(data.conversionRate)}
        changePercent={data.conversionRateChangePercent}
        icon={Target}
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />
      <KpiCard
        title="Avg Time to Qualify"
        value={`${data.avgTimeToQualifyDays.toFixed(0)} days`}
        icon={CalendarClock}
        iconBg="bg-red-100"
        iconColor="text-red-600"
      />
    </div>
  );
};
