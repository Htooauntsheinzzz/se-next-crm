"use client";

import { useEffect, useMemo, useState } from "react";
import { UsersRound, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { teamService } from "@/services/teamService";
import { getApiMessage } from "@/lib/utils";
import type { SalesTeam } from "@/types/team";
import type { User } from "@/types/user";

interface UserAssignTeamModalProps {
  open: boolean;
  user: User | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (teamId: string | null, teamName: string) => Promise<void>;
}

export const UserAssignTeamModal = ({
  open,
  user,
  loading = false,
  onClose,
  onSubmit,
}: UserAssignTeamModalProps) => {
  const [teams, setTeams] = useState<SalesTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("NONE");
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", onKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    const loadTeams = async () => {
      if (!open || !user) {
        return;
      }

      try {
        setLoadingTeams(true);
        setLoadError(null);
        // TODO: If admins need a specific ?scope=all endpoint for full assignment beyond scoped lists, add it here.
        // Currently relying on backend role-based scoping which naturally returns all teams for ADMINs.
        const response = await teamService.getAll();
        setTeams(response ?? []);
        setSelectedTeamId(user.teamId ?? "NONE");
      } catch (err) {
        setLoadError(getApiMessage(err, "Failed to load teams"));
      } finally {
        setLoadingTeams(false);
      }
    };

    void loadTeams();
  }, [open, user]);

  const isUnchanged = useMemo(() => {
    if (!user) {
      return true;
    }

    return (user.teamId ?? "NONE") === selectedTeamId;
  }, [selectedTeamId, user]);

  if (!open || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
            <UsersRound className="h-4 w-4" />
            Assign Team
          </h3>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <p className="text-sm text-slate-600">
            Update team assignment for <span className="font-semibold text-slate-900">{user.firstName} {user.lastName}</span>.
          </p>

          {loadingTeams ? (
            <div className="h-11 animate-pulse rounded-lg bg-slate-100" />
          ) : loadError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {loadError}
            </div>
          ) : (
            <select
              value={selectedTeamId}
              onChange={(event) => setSelectedTeamId(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
            >
              <option value="NONE">No Team (Remove)</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3">
          <Button type="button" variant="outline" className="w-auto px-4" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            loading={loading}
            disabled={isUnchanged || loadingTeams || Boolean(loadError)}
            className="w-auto px-4"
            onClick={() => {
              const nextTeamId = selectedTeamId === "NONE" ? null : selectedTeamId;
              const selectedTeam = teams.find((team) => team.id === selectedTeamId);
              const nextTeamName = selectedTeam ? selectedTeam.name : "No Team";

              void onSubmit(nextTeamId, nextTeamName);
            }}
          >
            Assign Team
          </Button>
        </div>
      </div>
    </div>
  );
};
