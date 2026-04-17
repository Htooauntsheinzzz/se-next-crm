"use client";

import { AlertCircle, Briefcase, Contact, DollarSign, Target, TrendingUp, Trophy, Users } from "lucide-react";
import type { ComponentType } from "react";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { WidgetState } from "@/components/dashboard/WidgetState";
import type { DashboardSummary } from "@/types/report";

interface KpiCardsProps {
  summary: DashboardSummary | null;
  loading: boolean;
  error?: string;
  onRetry: () => void;
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  iconColorClassName: string;
  iconBgClassName: string;
}

const MetricCard = ({
  label,
  value,
  icon: Icon,
  iconColorClassName,
  iconBgClassName,
}: MetricCardProps) => (
  <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgClassName}`}>
        <Icon className={`h-5 w-5 ${iconColorClassName}`} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  </article>
);

export const KpiCards = ({ summary, loading, error, onRetry }: KpiCardsProps) => {
  if (error) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <WidgetState mode="error" message="Failed to load KPI cards" onRetry={onRetry} />
      </section>
    );
  }

  if (loading || !summary) {
    return (
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          icon={DollarSign}
          iconColorClassName="text-purple-600"
          iconBgClassName="bg-purple-100"
        />
        <MetricCard
          label="Pipeline Value"
          value={formatCurrency(summary.weightedPipelineValue)}
          icon={TrendingUp}
          iconColorClassName="text-blue-600"
          iconBgClassName="bg-blue-100"
        />
        <MetricCard
          label="Win Rate"
          value={formatPercentage(summary.winRate)}
          icon={Target}
          iconColorClassName="text-green-600"
          iconBgClassName="bg-green-100"
        />
        <MetricCard
          label="Overdue Activities"
          value={String(summary.overdueActivities ?? 0)}
          icon={AlertCircle}
          iconColorClassName="text-red-600"
          iconBgClassName="bg-red-100"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Leads"
          value={String(summary.totalLeads ?? 0)}
          icon={Users}
          iconColorClassName="text-indigo-600"
          iconBgClassName="bg-indigo-100"
        />
        <MetricCard
          label="Total Contacts"
          value={String(summary.totalContacts ?? 0)}
          icon={Contact}
          iconColorClassName="text-blue-600"
          iconBgClassName="bg-blue-100"
        />
        <MetricCard
          label="Open Opportunities"
          value={String(summary.openOpportunities ?? 0)}
          icon={Briefcase}
          iconColorClassName="text-amber-600"
          iconBgClassName="bg-amber-100"
        />
        <MetricCard
          label="Won Deals"
          value={String(summary.wonOpportunities ?? 0)}
          icon={Trophy}
          iconColorClassName="text-green-600"
          iconBgClassName="bg-green-100"
        />
      </section>
    </div>
  );
};
