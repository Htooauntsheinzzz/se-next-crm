import {
  AlertTriangle,
  Briefcase,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";
import { formatCompactNumber, formatCurrency, formatPercentage, toSafeNumber } from "@/lib/format";
import type { DashboardSummary } from "@/types/dashboard";
import { WidgetState } from "@/components/dashboard/WidgetState";

interface KpiCardsProps {
  summary: DashboardSummary | null;
  error?: string;
  onRetry: () => void;
}

const cardStyles = {
  blue: "border-l-[#3B82F6] bg-[#EFF6FF] text-[#1D4ED8]",
  purple: "border-l-[#8B5CF6] bg-[#F5F3FF] text-[#6D28D9]",
  green: "border-l-[#10B981] bg-[#ECFDF5] text-[#047857]",
  indigo: "border-l-[#6366F1] bg-[#EEF2FF] text-[#4338CA]",
  amber: "border-l-[#F59E0B] bg-[#FFFBEB] text-[#B45309]",
  red: "border-l-[#EF4444] bg-[#FEF2F2] text-[#B91C1C]",
};

const kpiConfig = (summary: DashboardSummary) => [
  {
    title: "Total Leads",
    value: formatCompactNumber(toSafeNumber(summary.totalLeads)),
    icon: Users,
    palette: cardStyles.blue,
  },
  {
    title: "Total Opportunities",
    value: formatCompactNumber(toSafeNumber(summary.totalOpportunities)),
    icon: Briefcase,
    palette: cardStyles.purple,
  },
  {
    title: "Total Revenue",
    value: formatCurrency(toSafeNumber(summary.totalRevenue)),
    icon: DollarSign,
    palette: cardStyles.green,
  },
  {
    title: "Conversion Rate",
    value: formatPercentage(toSafeNumber(summary.conversionRate)),
    icon: TrendingUp,
    palette: cardStyles.indigo,
  },
  {
    title: "Open Activities",
    value: formatCompactNumber(toSafeNumber(summary.openActivities)),
    icon: ClipboardList,
    palette: cardStyles.amber,
  },
  {
    title: "Overdue Activities",
    value: formatCompactNumber(toSafeNumber(summary.overdueActivities)),
    icon: AlertTriangle,
    palette: cardStyles.red,
  },
];

export const KpiCards = ({ summary, error, onRetry }: KpiCardsProps) => {
  if (error) {
    return <WidgetState mode="error" message="Failed to load KPI summary" onRetry={onRetry} />;
  }

  if (!summary) {
    return <WidgetState mode="empty" message="No summary data available" />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {kpiConfig(summary).map((card) => {
        const Icon = card.icon;

        return (
          <article key={card.title} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className={`mb-3 flex items-center justify-between rounded-lg border-l-4 px-3 py-2 ${card.palette}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">{card.title}</p>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
          </article>
        );
      })}
    </div>
  );
};
