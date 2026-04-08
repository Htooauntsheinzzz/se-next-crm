import { List, Plus } from "lucide-react";
import type { DropResult } from "@hello-pangea/dnd";
import { KanbanBoard } from "@/components/opportunities/KanbanBoard";
import { OpportunitySummaryBar } from "@/components/opportunities/OpportunitySummaryBar";
import type { KanbanColumnDto } from "@/services/opportunityService";
import type { Opportunity } from "@/types/opportunity";
import type { SalesTeam } from "@/types/team";

interface OpportunityKanbanPageProps {
  teamId?: number;
  teams: SalesTeam[];
  columns: KanbanColumnDto[];
  loading: boolean;
  error: string | null;
  totalPipeline: number;
  weightedValue: number;
  totalOpportunities: number;
  onTeamChange: (teamId: number | undefined) => void;
  onSwitchToList: () => void;
  onCreate: () => void;
  onAddOpportunity: (stageId: number) => void;
  onCardClick: (opportunity: Opportunity) => void;
  onDragEnd: (result: DropResult) => void;
}

export const OpportunityKanbanPage = ({
  teamId,
  teams,
  columns,
  loading,
  error,
  totalPipeline,
  weightedValue,
  totalOpportunities,
  onTeamChange,
  onSwitchToList,
  onCreate,
  onAddOpportunity,
  onCardClick,
  onDragEnd,
}: OpportunityKanbanPageProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[34px] font-semibold leading-tight text-slate-900">Pipeline</h1>
          <p className="mt-1 text-sm text-slate-500">
            Drag and drop opportunities to change their stage
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={teamId ?? ""}
            onChange={(event) =>
              onTeamChange(event.target.value ? Number(event.target.value) : undefined)
            }
            className="h-10 min-w-[150px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
          >
            <option value="">All Teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onSwitchToList}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <List className="h-4 w-4" />
            List View
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

      <OpportunitySummaryBar
        totalPipeline={totalPipeline}
        weightedValue={weightedValue}
        opportunities={totalOpportunities}
      />

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="h-[420px] animate-pulse rounded-lg bg-slate-100" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      ) : (
        <KanbanBoard
          columns={columns}
          onDragEnd={onDragEnd}
          onAddOpportunity={onAddOpportunity}
          onCardClick={onCardClick}
        />
      )}
    </div>
  );
};
