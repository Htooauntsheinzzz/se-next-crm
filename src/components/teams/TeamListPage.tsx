"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, UsersRound, X } from "lucide-react";
import { toast } from "sonner";
import { useTeams } from "@/hooks/useTeams";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { TeamCard } from "@/components/teams/TeamCard";
import { TeamForm } from "@/components/teams/TeamForm";
import { teamService } from "@/services/teamService";
import { userService } from "@/services/userService";
import type { User } from "@/types/user";
import { getApiMessage } from "@/lib/utils";

export const TeamListPage = () => {
  const { teams, loading, error, refetch } = useTeams();
  const { isAdmin } = useRoleGuard();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [leaderUsers, setLeaderUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!showCreateModal) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowCreateModal(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showCreateModal]);

  useEffect(() => {
    if (!showCreateModal || leaderUsers.length > 0) {
      return;
    }

    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const usersPage = await userService.getAll(0, 500);
        setLeaderUsers(usersPage.content ?? []);
      } catch (err) {
        toast.error(getApiMessage(err, "Failed to load users for team leader"));
      } finally {
        setLoadingUsers(false);
      }
    };

    void loadUsers();
  }, [leaderUsers.length, showCreateModal]);

  const onCreateTeam = async (values: {
    name?: string;
    description?: string;
    targetRevenue?: number;
    leaderId?: string;
  }) => {
    try {
      setSavingCreate(true);
      await teamService.create({
        name: values.name ?? "",
        description: values.description,
        targetRevenue: values.targetRevenue,
        leaderId: values.leaderId,
      });
      toast.success("Team created successfully");
      setShowCreateModal(false);
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to create team"));
    } finally {
      setSavingCreate(false);
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[34px] font-semibold leading-tight text-slate-900">Sales Teams</h1>
          <p className="text-sm text-slate-500">Manage your sales teams and their performance</p>
        </div>

        {isAdmin ? (
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex h-10 items-center gap-2 self-start rounded-lg bg-[#8B6FD0] px-4 text-sm font-semibold text-white transition hover:bg-[#7D62C4]"
          >
            <Plus className="h-4 w-4" />
            Create Team
          </button>
        ) : null}
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`team-skeleton-${index}`} className="h-64 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <UsersRound className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">No teams created yet</p>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="mt-4 inline-flex text-sm font-semibold text-[#8B6FD0]"
            >
              Create your first team
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}

      {showCreateModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Create New Team</h3>
                <p className="text-sm text-slate-500">
                  Set up a new sales team with target revenue and team leader
                </p>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close create team modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {loadingUsers ? (
              <div className="space-y-3">
                <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
              </div>
            ) : (
              <TeamForm
                mode="create"
                users={leaderUsers}
                loading={savingCreate}
                onCancel={() => setShowCreateModal(false)}
                onSubmit={onCreateTeam}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
