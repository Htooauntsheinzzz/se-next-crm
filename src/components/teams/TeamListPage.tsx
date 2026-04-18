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
import type { SalesTeam } from "@/types/team";
import { getApiMessage } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { isAdmin as checkAdmin, isManager, isRep } from "@/lib/auth/rbac";
import { EmptyState } from "@/components/teams/EmptyState";
import { useRouter } from "next/navigation";

export const TeamListPage = () => {
  const { currentUser } = useCurrentUser();
  const router = useRouter();
  const admin = checkAdmin(currentUser);
  const manager = isManager(currentUser);
  const rep = isRep(currentUser);
  const { teams, loading, error, refetch } = useTeams();
  const { isAdmin } = useRoleGuard();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [leaderUsers, setLeaderUsers] = useState<User[]>([]);

  // Rep Auto-Redirect
  useEffect(() => {
    if (rep && currentUser?.teamId) {
      router.replace(`/teams/${currentUser.teamId}`);
    }
  }, [rep, currentUser, router]);

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

  const onDeleteTeam = async (team: SalesTeam) => {
    if (team.memberCount > 0) {
      toast.error("Cannot delete team with active members");
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete ${team.name}?`);
    if (!confirmed) return;

    try {
      await teamService.delete(team.id);
      toast.success("Team deleted");
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to delete team"));
    }
  };

  let title = "My Team";
  let subtitle = "The team you're a member of.";
  let badgeLabel = currentUser?.teamName || "No team";
  let badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";

  if (admin) {
    title = "All Teams";
    subtitle = "Manage all sales teams across the organization.";
    badgeLabel = "Admin view";
    badgeClass = "bg-violet-50 text-violet-700 border-violet-200";
  } else if (manager) {
    title = "My Teams";
    subtitle = "Teams you lead or belong to.";
    badgeLabel = "Manager view";
    badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
  }

  // If rep is redirecting, render nothing or a loader to prevent flash
  if (rep && currentUser?.teamId) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8B6FD0] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[34px] font-semibold leading-tight text-slate-900">{title}</h1>
            {badgeLabel && (
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
                {badgeLabel}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
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
        admin ? (
          <EmptyState
            message="No teams yet. Create your first team to start organizing sales reps."
            action={
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex h-9 items-center justify-center rounded-md bg-[#8B6FD0] px-4 text-sm font-semibold text-white transition hover:bg-[#7D62C4]"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Team
              </button>
            }
          />
        ) : manager ? (
          <EmptyState message="You're not leading or part of any team yet. Ask an admin to assign you." />
        ) : (
          <EmptyState message="You haven't been assigned to a team yet. Ask your manager to add you." />
        )
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onEdit={(t) => router.push(`/teams/${t.id}`)}
              onAddMember={(t) => router.push(`/teams/${t.id}`)}
              onChangeLeader={(t) => router.push(`/teams/${t.id}`)}
              onDelete={onDeleteTeam}
            />
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
