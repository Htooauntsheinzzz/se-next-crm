import Link from "next/link";
import { Crown, Users as UsersIcon } from "lucide-react";
import type { SalesTeam } from "@/types/team";
import { formatCurrency, formatDateLabel } from "@/lib/utils";
import { TeamCardActions } from "@/components/teams/TeamCardActions";

interface TeamCardProps {
  team: SalesTeam;
  onEdit: (team: SalesTeam) => void;
  onDelete: (team: SalesTeam) => void;
  onAddMember: (team: SalesTeam) => void;
  onChangeLeader: (team: SalesTeam) => void;
}

export const TeamCard = ({ team, onEdit, onDelete, onAddMember, onChangeLeader }: TeamCardProps) => {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-semibold text-slate-900">{team.name}</h3>
        <TeamCardActions
          team={team}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddMember={onAddMember}
          onChangeLeader={onChangeLeader}
        />
      </div>

      <p className="mt-2 min-h-[40px] text-sm text-slate-500">
        {team.description?.trim() ? team.description : "No description provided for this team."}
      </p>

      <div className="mt-4 space-y-3 text-sm text-slate-700">
        <p className="inline-flex items-center gap-2">
          <Crown className="h-4 w-4 text-[#8B6FD0]" />
          <span>{team.leaderName ?? "No leader assigned"}</span>
        </p>
        <p className="inline-flex items-center gap-2">
          <UsersIcon className="h-4 w-4 text-slate-400" />
          <span>{team.memberCount} members</span>
        </p>
        <p>
          <span className="text-slate-500">Target Revenue</span>
          <span className="ml-2 font-semibold text-slate-900">
            {formatCurrency(team.targetRevenue ?? 0)}
          </span>
        </p>
        <p className="text-xs text-slate-400">Created {formatDateLabel(team.createdAt)}</p>
      </div>

      <Link
        href={`/teams/${team.id}`}
        className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
      >
        View Details
      </Link>
    </article>
  );
};
