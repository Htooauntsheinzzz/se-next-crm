import { Calendar, CheckCircle2, Circle, Dot, MinusCircle } from "lucide-react";
import { format } from "date-fns";
import { PriorityStars } from "@/components/opportunities/PriorityStars";
import {
  formatCurrency,
  toSafeNumber,
} from "@/components/opportunities/opportunityConfig";
import type { Opportunity } from "@/types/opportunity";

interface KanbanCardProps {
  opportunity: Opportunity;
  stageColor: string;
  onClick: (opportunity: Opportunity) => void;
}

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

const formatDeadline = (value: string | null) => {
  if (!value) {
    return { text: "No deadline", overdue: false };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { text: "No deadline", overdue: false };
  }

  return {
    text: format(date, "yyyy-MM-dd"),
    overdue: date.getTime() < Date.now(),
  };
};

const stateIcon = (state: Opportunity["kanbanState"]) => {
  if (state === "READY") {
    return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
  }
  if (state === "BLOCKED") {
    return <MinusCircle className="h-3.5 w-3.5 text-red-500" />;
  }
  return <Circle className="h-3.5 w-3.5 text-slate-400" />;
};

export const KanbanCard = ({ opportunity, stageColor, onClick }: KanbanCardProps) => {
  const deadline = formatDeadline(opportunity.deadline);

  return (
    <button
      type="button"
      onClick={() => onClick(opportunity)}
      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:shadow-md"
      style={{ borderLeftWidth: 4, borderLeftColor: stageColor }}
    >
      <p className="line-clamp-2 text-sm font-semibold text-slate-900">{opportunity.name}</p>
      <p className="mt-1 text-3xl font-semibold leading-none text-slate-900">
        {formatCurrency(toSafeNumber(opportunity.expectedRevenue))}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Weighted: {formatCurrency(toSafeNumber(opportunity.weightedRevenue))}
      </p>

      <span className="mt-2 inline-flex rounded-md border border-[#CEDCF8] bg-[#EFF4FF] px-1.5 py-0.5 text-[11px] font-medium text-[#2F6EDB]">
        {toSafeNumber(opportunity.probability)}% Probability
      </span>

      <div
        className={`mt-2 inline-flex items-center gap-1 text-xs ${
          deadline.overdue ? "text-red-500" : "text-green-600"
        }`}
      >
        <Calendar className="h-3.5 w-3.5" />
        {deadline.text}
      </div>

      <p className="mt-2 text-xs text-slate-600">{opportunity.salespersonName ?? "Unassigned"}</p>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#8B6FD0]/20 text-[10px] font-semibold text-[#8B6FD0]">
            {getInitials(opportunity.salespersonName)}
          </span>
          <PriorityStars value={toSafeNumber(opportunity.priority)} />
          <span className="inline-flex items-center text-[#8B6FD0]">
            <Dot className="h-4 w-4" />
            <Dot className="-ml-2 h-4 w-4" />
          </span>
        </div>

        {stateIcon(opportunity.kanbanState)}
      </div>
    </button>
  );
};
