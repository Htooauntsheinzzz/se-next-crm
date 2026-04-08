import { KanbanSquare, Plus } from "lucide-react";
import { OpportunityFilters } from "@/components/opportunities/OpportunityFilters";
import { OpportunityTable } from "@/components/opportunities/OpportunityTable";
import type { KanbanState, Opportunity } from "@/types/opportunity";
import type { PipelineStageDto } from "@/types/pipeline";
import type { SalesTeam } from "@/types/team";

interface OpportunityListPageProps {
  search: string;
  stageId?: number;
  teamId?: number;
  kanbanState?: KanbanState;
  stages: PipelineStageDto[];
  teams: SalesTeam[];
  opportunities: Opportunity[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  canDelete: boolean;
  onSearchChange: (value: string) => void;
  onStageChange: (value: number | undefined) => void;
  onTeamChange: (value: number | undefined) => void;
  onStateChange: (value: KanbanState | undefined) => void;
  onPageChange: (page: number) => void;
  onSwitchToKanban: () => void;
  onCreate: () => void;
  onView: (opportunity: Opportunity) => void;
  onEdit: (opportunity: Opportunity) => void;
  onMarkWon: (opportunity: Opportunity) => void;
  onMarkLost: (opportunity: Opportunity) => void;
  onDelete: (opportunity: Opportunity) => void;
}

export const OpportunityListPage = ({
  search,
  stageId,
  teamId,
  kanbanState,
  stages,
  teams,
  opportunities,
  loading,
  error,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  canDelete,
  onSearchChange,
  onStageChange,
  onTeamChange,
  onStateChange,
  onPageChange,
  onSwitchToKanban,
  onCreate,
  onView,
  onEdit,
  onMarkWon,
  onMarkLost,
  onDelete,
}: OpportunityListPageProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[34px] font-semibold leading-tight text-slate-900">Opportunities</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and track all your sales opportunities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSwitchToKanban}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <KanbanSquare className="h-4 w-4" />
            Kanban View
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#8B6FD0] px-4 text-sm font-semibold text-white transition hover:bg-[#7A58BE]"
          >
            <Plus className="h-4 w-4" />
            Create Opportunity
          </button>
        </div>
      </div>

      <OpportunityFilters
        search={search}
        stageId={stageId}
        teamId={teamId}
        kanbanState={kanbanState}
        stages={stages}
        teams={teams}
        onSearchChange={onSearchChange}
        onStageChange={onStageChange}
        onTeamChange={onTeamChange}
        onStateChange={onStateChange}
      />

      <p className="text-sm text-slate-500">
        Showing {opportunities.length} of {totalElements} opportunities
      </p>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      ) : (
        <OpportunityTable
          opportunities={opportunities}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          stages={stages}
          canDelete={canDelete}
          onPageChange={onPageChange}
          onView={onView}
          onEdit={onEdit}
          onMarkWon={onMarkWon}
          onMarkLost={onMarkLost}
          onDelete={onDelete}
        />
      )}
    </div>
  );
};
