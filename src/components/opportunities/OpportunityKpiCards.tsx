import { Calendar, DollarSign, Percent, Sparkles, Star } from "lucide-react";
import { formatCurrency, toSafeNumber } from "@/components/opportunities/opportunityConfig";
import { PriorityStars } from "@/components/opportunities/PriorityStars";
import type { Opportunity } from "@/types/opportunity";

interface OpportunityKpiCardsProps {
  opportunity: Opportunity;
}

const iconClass = "h-3.5 w-3.5";

export const OpportunityKpiCards = ({ opportunity }: OpportunityKpiCardsProps) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="inline-flex items-center gap-1 text-xs text-slate-500">
          <DollarSign className={iconClass} />
          Revenue
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">
          {formatCurrency(opportunity.expectedRevenue)}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="inline-flex items-center gap-1 text-xs text-slate-500">
          <Percent className={iconClass} />
          Probability
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">
          {toSafeNumber(opportunity.probability)}%
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="inline-flex items-center gap-1 text-xs text-slate-500">
          <Sparkles className={iconClass} />
          Weighted
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">
          {formatCurrency(opportunity.weightedRevenue)}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="inline-flex items-center gap-1 text-xs text-slate-500">
          <Star className={iconClass} />
          Priority
        </p>
        <div className="mt-2">
          <PriorityStars value={toSafeNumber(opportunity.priority)} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="inline-flex items-center gap-1 text-xs text-slate-500">
          <Calendar className={iconClass} />
          Deadline
        </p>
        <p className="mt-1 text-xl font-semibold text-slate-900">
          {opportunity.deadline ?? "—"}
        </p>
      </div>
    </div>
  );
};
