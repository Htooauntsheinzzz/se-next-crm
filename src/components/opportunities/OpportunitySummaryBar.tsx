import { formatCurrency } from "@/components/opportunities/opportunityConfig";

interface OpportunitySummaryBarProps {
  totalPipeline: number;
  weightedValue: number;
  opportunities: number;
}

export const OpportunitySummaryBar = ({
  totalPipeline,
  weightedValue,
  opportunities,
}: OpportunitySummaryBarProps) => {
  return (
    <div className="grid gap-4 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4 md:grid-cols-3">
      <div>
        <p className="text-xs font-medium text-slate-500">Total Pipeline</p>
        <p className="mt-1 text-3xl font-semibold text-slate-900">{formatCurrency(totalPipeline)}</p>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500">Weighted Value</p>
        <p className="mt-1 text-3xl font-semibold text-[#6D44CC]">{formatCurrency(weightedValue)}</p>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500">Opportunities</p>
        <p className="mt-1 text-3xl font-semibold text-slate-900">{opportunities}</p>
      </div>
    </div>
  );
};
