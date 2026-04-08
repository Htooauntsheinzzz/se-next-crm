import { Mail, Phone, UserRound } from "lucide-react";
import { KanbanStateSelector } from "@/components/opportunities/KanbanStateSelector";
import type { Contact } from "@/types/contact";
import type { Lead } from "@/types/lead";
import type { Opportunity, KanbanState } from "@/types/opportunity";
import type { PipelineStageDto } from "@/types/pipeline";

interface OpportunitySidebarProps {
  opportunity: Opportunity;
  stages: PipelineStageDto[];
  contact: Contact | null;
  leadFallback?: Lead | null;
  stateLoading?: boolean;
  onStateChange: (state: KanbanState) => void;
}

export const OpportunitySidebar = ({
  opportunity,
  stages,
  contact,
  leadFallback = null,
  stateLoading = false,
  onStateChange,
}: OpportunitySidebarProps) => {
  const currentStage = stages.find((stage) => stage.id === opportunity.stageId);
  const displayName =
    contact?.fullName ??
    opportunity.contactName ??
    leadFallback?.contactFullName ??
    leadFallback?.contactName ??
    "—";
  const displayCompany =
    contact?.companyName ?? contact?.parentName ?? leadFallback?.companyName ?? "—";
  const displayEmail = contact?.email ?? leadFallback?.email ?? "—";
  const displayPhone = contact?.phone ?? leadFallback?.phone ?? "—";

  return (
    <aside className="space-y-3">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-semibold text-slate-900">Current Stage</h3>
        <p className="mt-2 text-xs text-slate-500">Stage</p>
        <p className="text-lg font-semibold text-slate-900">{opportunity.stageName}</p>
        <p className="mt-2 text-xs text-slate-500">Probability</p>
        <p className="text-lg font-semibold text-slate-900">
          {currentStage?.probability ?? opportunity.probability}%
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-semibold text-slate-900">Contact</h3>
        <p className="mt-2 text-sm font-semibold text-slate-900">{displayName}</p>
        <p className="text-xs text-slate-500">{displayCompany}</p>
        <div className="mt-2 space-y-1 text-xs text-slate-600">
          <p className="inline-flex items-center gap-1">
            <Mail className="h-3.5 w-3.5" />
            {displayEmail}
          </p>
          <p className="inline-flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" />
            {displayPhone}
          </p>
          <p className="inline-flex items-center gap-1">
            <UserRound className="h-3.5 w-3.5" />
            {opportunity.salespersonName ?? "Unassigned"}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-semibold text-slate-900">Kanban State</h3>
        <div className="mt-3">
          <KanbanStateSelector
            value={opportunity.kanbanState}
            onChange={onStateChange}
            disabled={stateLoading}
          />
        </div>
      </section>
    </aside>
  );
};
