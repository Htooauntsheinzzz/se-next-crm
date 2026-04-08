import { format } from "date-fns";
import { AlertCircle, CheckCircle2, Circle } from "lucide-react";
import { StageBadge } from "@/components/opportunities/StageBadge";
import { OpportunityActions } from "@/components/opportunities/OpportunityActions";
import { PriorityStars } from "@/components/opportunities/PriorityStars";
import { formatCurrency, toSafeNumber } from "@/components/opportunities/opportunityConfig";
import type { Opportunity, KanbanState } from "@/types/opportunity";
import type { PipelineStageDto } from "@/types/pipeline";

interface OpportunityTableProps {
  opportunities: Opportunity[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  stages: PipelineStageDto[];
  canDelete: boolean;
  onPageChange: (page: number) => void;
  onView: (opportunity: Opportunity) => void;
  onEdit: (opportunity: Opportunity) => void;
  onMarkWon: (opportunity: Opportunity) => void;
  onMarkLost: (opportunity: Opportunity) => void;
  onDelete: (opportunity: Opportunity) => void;
}

const stateNode = (state: KanbanState) => {
  if (state === "READY") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600">
        <CheckCircle2 className="h-3.5 w-3.5" /> Ready
      </span>
    );
  }

  if (state === "BLOCKED") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-500">
        <AlertCircle className="h-3.5 w-3.5" /> Blocked
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
      <Circle className="h-3.5 w-3.5" /> Normal
    </span>
  );
};

const getInitials = (name: string | null | undefined) => {
  const safe = (name ?? "").trim();
  if (!safe) {
    return "U";
  }

  const parts = safe.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return format(date, "yyyy-MM-dd");
};

export const OpportunityTable = ({
  opportunities,
  loading,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  stages,
  canDelete,
  onPageChange,
  onView,
  onEdit,
  onMarkWon,
  onMarkLost,
  onDelete,
}: OpportunityTableProps) => {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`opp-skeleton-${index}`} className="h-12 rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        No opportunities found
      </div>
    );
  }

  const start = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const end = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-600">
          <tr>
            <th className="px-4 py-3">Opportunity</th>
            <th className="px-4 py-3">Stage</th>
            <th className="px-4 py-3">Revenue</th>
            <th className="px-4 py-3">Probability</th>
            <th className="px-4 py-3">Weighted</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Salesperson</th>
            <th className="px-4 py-3">Team</th>
            <th className="px-4 py-3">State</th>
            <th className="px-4 py-3">Deadline</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 text-slate-700">
          {opportunities.map((opportunity) => {
            const stage = stages.find((item) => item.id === opportunity.stageId);

            return (
              <tr key={opportunity.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{opportunity.name}</p>
                  <p className="text-xs text-slate-500">{opportunity.salespersonName ?? "—"}</p>
                </td>
                <td className="px-4 py-3">
                  <StageBadge stageName={opportunity.stageName} stage={stage} />
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {formatCurrency(toSafeNumber(opportunity.expectedRevenue))}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-md border border-[#CEDCF8] bg-[#EFF4FF] px-2 py-0.5 text-xs font-medium text-[#2F6EDB]">
                    {toSafeNumber(opportunity.probability)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatCurrency(toSafeNumber(opportunity.weightedRevenue))}
                </td>
                <td className="px-4 py-3">
                  <PriorityStars value={toSafeNumber(opportunity.priority)} />
                </td>
                <td className="px-4 py-3">
                  {opportunity.salespersonName ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700">
                        {getInitials(opportunity.salespersonName)}
                      </span>
                      <span className="text-xs text-slate-700">{opportunity.salespersonName}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-700">{opportunity.teamName ?? "—"}</td>
                <td className="px-4 py-3">{stateNode(opportunity.kanbanState)}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(opportunity.deadline)}</td>
                <td className="px-4 py-3 text-right">
                  <OpportunityActions
                    opportunity={opportunity}
                    canDelete={canDelete}
                    onView={onView}
                    onEdit={onEdit}
                    onMarkWon={onMarkWon}
                    onMarkLost={onMarkLost}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
        <p>
          Showing {start}-{end} of {totalElements} opportunities
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 0}
            onClick={() => onPageChange(currentPage - 1)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-[#8B6FD0] px-2 text-xs font-semibold text-white">
            {currentPage + 1}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages - 1 || totalPages === 0}
            onClick={() => onPageChange(currentPage + 1)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
