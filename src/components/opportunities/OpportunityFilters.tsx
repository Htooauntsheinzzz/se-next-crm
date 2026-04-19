import { Search } from "lucide-react";
import type { KanbanState } from "@/types/opportunity";
import type { PipelineStageDto } from "@/types/pipeline";
import type { SalesTeam } from "@/types/team";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { isRep } from "@/lib/auth/rbac";

interface OpportunityFiltersProps {
  search: string;
  stageId?: number;
  teamId?: number;
  kanbanState?: KanbanState;
  stages: PipelineStageDto[];
  teams: SalesTeam[];
  onSearchChange: (value: string) => void;
  onStageChange: (value: number | undefined) => void;
  onTeamChange: (value: number | undefined) => void;
  onStateChange: (value: KanbanState | undefined) => void;
}

export const OpportunityFilters = ({
  search,
  stageId,
  teamId,
  kanbanState,
  stages,
  teams,
  onSearchChange,
  onStageChange,
  onTeamChange,
  onStateChange,
}: OpportunityFiltersProps) => {
  const { currentUser } = useCurrentUser();
  const rep = isRep(currentUser);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-[45%]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search opportunities..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] transition focus:ring-2"
          />
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <select
            value={stageId ?? ""}
            onChange={(event) =>
              onStageChange(event.target.value ? Number(event.target.value) : undefined)
            }
            className="h-10 min-w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
          >
            <option value="">All Stages</option>
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>

          {!rep && (
            <select
              value={teamId ?? ""}
              onChange={(event) =>
                onTeamChange(event.target.value ? Number(event.target.value) : undefined)
              }
              className="h-10 min-w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
            >
              <option value="">All Teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={kanbanState ?? ""}
            onChange={(event) =>
              onStateChange((event.target.value || undefined) as KanbanState | undefined)
            }
            className="h-10 min-w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
          >
            <option value="">All States</option>
            <option value="NORMAL">Normal</option>
            <option value="BLOCKED">Blocked</option>
            <option value="READY">Ready</option>
          </select>
        </div>
      </div>
    </div>
  );
};
