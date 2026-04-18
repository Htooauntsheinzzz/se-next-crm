"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  DollarSign,
  Edit,
  Plus,
  Trophy,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { TeamMemberList } from "@/components/teams/TeamMemberList";
import { AddMemberModal } from "@/components/teams/AddMemberModal";
import { SetLeaderModal } from "@/components/teams/SetLeaderModal";
import { TeamForm } from "@/components/teams/TeamForm";
import { ForbiddenState } from "@/components/teams/ForbiddenState";
import { ActivityTabs } from "@/components/activities/ActivityTabs";
import { ActivityList } from "@/components/activities/ActivityList";
import { useTeam } from "@/hooks/useTeam";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { activityService } from "@/services/activityService";
import { teamService } from "@/services/teamService";
import { userService } from "@/services/userService";
import type { Activity } from "@/types/activity";
import type { User } from "@/types/user";
import { formatCurrency, getApiMessage, getInitials } from "@/lib/utils";

interface TeamDetailPageProps {
  teamId: string;
}

type ActiveTab = "members" | "performance" | "activity";

export const TeamDetailPage = ({ teamId }: TeamDetailPageProps) => {
  const { team, members, loading, error, isForbidden, refetch } = useTeam(teamId);
  const { currentUser } = useCurrentUser();

  const [activeTab, setActiveTab] = useState<ActiveTab>("members");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [activityTab, setActivityTab] = useState<"todo" | "done">("todo");
  const [teamActivities, setTeamActivities] = useState<Activity[]>([]);
  const [teamActivityLoading, setTeamActivityLoading] = useState(false);
  const [teamActivityError, setTeamActivityError] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [savingTeam, setSavingTeam] = useState(false);

  const isAdmin = currentUser?.role === "ADMIN";
  const isManager = currentUser?.role === "SALES_MANAGER";
  const canManageMembers = isAdmin || isManager;

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const page = await userService.getAll(0, 500);
        setAllUsers(page.content ?? []);
      } catch {
        // Non-blocking for team detail; modal can still be opened later.
      } finally {
        setLoadingUsers(false);
      }
    };

    void loadUsers();
  }, []);

  const teamLeader = useMemo(
    () => members.find((member) => member.id === team?.leaderId) ?? null,
    [members, team?.leaderId],
  );

  const pipelineValue = Math.round((team?.targetRevenue ?? 0) * 0.65);
  const wonDeals = members.length * 2;
  const teamMemberIdSet = useMemo(
    () =>
      new Set(
        members
          .map((member) => Number(member.id))
          .filter((value) => Number.isFinite(value)),
      ),
    [members],
  );

  const fetchTeamActivities = useCallback(async (done: boolean) => {
    try {
      setTeamActivityLoading(true);
      setTeamActivityError(null);
      const response = await activityService.getAll({ done, page: 0, size: 500 });
      const filtered = (response.content ?? []).filter((activity) => {
        const assignedToId = Number(activity.assignedTo);
        return Number.isFinite(assignedToId) && teamMemberIdSet.has(assignedToId);
      });
      setTeamActivities(filtered);
    } catch (err) {
      setTeamActivityError(getApiMessage(err, "Failed to load team activities"));
    } finally {
      setTeamActivityLoading(false);
    }
  }, [teamMemberIdSet]);

  useEffect(() => {
    if (activeTab !== "activity") {
      return;
    }

    if (teamMemberIdSet.size === 0) {
      setTeamActivities([]);
      setTeamActivityLoading(false);
      setTeamActivityError(null);
      return;
    }

    void fetchTeamActivities(activityTab === "done");
  }, [activeTab, activityTab, teamMemberIdSet, fetchTeamActivities]);

  const onSaveTeam = async (values: {
    name?: string;
    description?: string;
    targetRevenue?: number;
    leaderId?: string;
  }) => {
    if (!team) {
      return;
    }

    try {
      setSavingTeam(true);
      await teamService.update(team.id, values);
      toast.success("Team updated successfully");
      setShowEditModal(false);
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to update team"));
    } finally {
      setSavingTeam(false);
    }
  };

  const onDeleteTeam = async () => {
    if (!team) {
      return;
    }

    if (members.length > 0) {
      toast.error("Cannot delete team with active members");
      return;
    }

    try {
      await teamService.delete(team.id);
      toast.success("Team deleted");
      window.location.href = "/teams";
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to delete team"));
    }
  };

  const onAddMember = async (userId: string) => {
    if (!team) {
      return;
    }

    try {
      setBusyUserId(userId);
      await teamService.assignMember(team.id, userId);
      toast.success("Member added to team");
      setShowAddMemberModal(false);
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to add member"));
    } finally {
      setBusyUserId(null);
    }
  };

  const onRemoveMember = async (member: User) => {
    if (!team) {
      return;
    }

    const confirmed = window.confirm(
      `Remove ${member.firstName} ${member.lastName} from ${team.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setBusyUserId(member.id);
      await teamService.removeMember(team.id, member.id);
      toast.success("Member removed from team");
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to remove member"));
    } finally {
      setBusyUserId(null);
    }
  };

  const onConfirmSetLeader = async (userId: string) => {
    if (!team) {
      return;
    }

    try {
      setBusyUserId(userId);
      await teamService.setLeader(team.id, userId);
      toast.success("Team leader updated");
      setShowLeaderModal(false);
      setSelectedMember(null);
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to set team leader"));
    } finally {
      setBusyUserId(null);
    }
  };

  const onMarkDoneActivity = async (activity: Activity) => {
    try {
      await activityService.markDone(activity.id);
      await fetchTeamActivities(activityTab === "done");
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to mark activity done"));
    }
  };

  const onUndoDoneActivity = async (activity: Activity) => {
    try {
      await activityService.undoDone(activity.id);
      await fetchTeamActivities(activityTab === "done");
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to undo activity"));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded bg-slate-100" />
        <div className="h-44 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-72 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (isForbidden) {
    return <ForbiddenState />;
  }

  if (!team) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error ?? "Team not found"}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link href="/teams" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
        <ArrowLeft className="h-4 w-4" />
        Back to Teams
      </Link>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#8B6FD0] text-white">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-4xl font-semibold leading-tight text-slate-900">{team.name}</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                {team.description || "No description provided."}
              </p>
            </div>
          </div>

          {isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Edit className="h-4 w-4" />
                Edit Team
              </button>
              <button
                type="button"
                onClick={() => void onDeleteTeam()}
                className="inline-flex h-9 items-center rounded-md border border-red-200 px-3 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-600">
          Team Leader:{" "}
          {teamLeader ? (
            <span className="font-medium text-slate-900">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#8B6FD0] text-[11px] font-semibold text-white">
                {getInitials(teamLeader.firstName, teamLeader.lastName)}
              </span>
              <span className="ml-2">{teamLeader.firstName} {teamLeader.lastName}</span>
              <span className="ml-1 text-slate-500">({teamLeader.email})</span>
            </span>
          ) : (
            <span className="font-medium text-slate-900">No leader assigned</span>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3E8FF] text-[#8B6FD0]">
              <Users className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm text-slate-500">Team Members</p>
              <p className="text-4xl font-semibold leading-tight text-slate-900">{members.length}</p>
            </div>
          </div>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#2563EB]">
              <DollarSign className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm text-slate-500">Target Revenue</p>
              <p className="text-4xl font-semibold leading-tight text-slate-900">
                {formatCurrency(team.targetRevenue)}
              </p>
            </div>
          </div>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#DCFCE7] text-[#16A34A]">
              <TrendingUp className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm text-slate-500">Pipeline Value</p>
              <p className="text-4xl font-semibold leading-tight text-slate-900">
                {formatCurrency(pipelineValue)}
              </p>
            </div>
          </div>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#FEF3C7] text-[#D97706]">
              <Trophy className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm text-slate-500">Won Deals</p>
              <p className="text-4xl font-semibold leading-tight text-slate-900">{wonDeals}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="space-y-3">
        <div className="inline-flex rounded-full bg-slate-100 p-1">
          {[
            { id: "members", label: "Members" },
            { id: "performance", label: "Performance" },
            { id: "activity", label: "Activity" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "members" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-t-xl border border-b-0 border-slate-200 bg-white px-4 py-3">
              <h2 className="text-xl font-semibold text-slate-900">Team Members</h2>

              {canManageMembers ? (
                <button
                  type="button"
                  disabled={loadingUsers}
                  onClick={() => setShowAddMemberModal(true)}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-[#8B6FD0] px-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" />
                  Add Member
                </button>
              ) : null}
            </div>

            <TeamMemberList
              members={members}
              leaderId={team.leaderId}
              canRemove={canManageMembers}
              canSetLeader={isAdmin}
              busyUserId={busyUserId}
              onRemove={onRemoveMember}
              onSetLeader={(member) => {
                setSelectedMember(member);
                setShowLeaderModal(true);
              }}
            />
          </div>
        ) : activeTab === "activity" ? (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <ActivityTabs
              activeTab={activityTab}
              onChange={(tab) => {
                setActivityTab(tab);
              }}
            />
            <p className="text-sm text-slate-500">
              Showing {teamActivities.length} {activityTab === "done" ? "completed" : "to do"} activities
            </p>
            <ActivityList
              activities={teamActivities}
              loading={teamActivityLoading}
              error={teamActivityError}
              onMarkDone={onMarkDoneActivity}
              onUndo={onUndoDoneActivity}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            <UserRound className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-xl font-semibold text-slate-800">
              {activeTab === "performance" ? "Performance Metrics" : "Team Activity"}
            </p>
            <p className="mt-1 text-sm">
              {activeTab === "performance"
                ? "Team performance analytics and reports will be displayed here"
                : "Recent team activities and timeline will be displayed here"}
            </p>
          </div>
        )}
      </section>

      {showEditModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Edit Team</h3>
                <p className="text-sm text-slate-500">Update team information and settings</p>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-slate-500"
                onClick={() => setShowEditModal(false)}
              >
                Close
              </button>
            </div>

            <TeamForm
              mode="edit"
              initialValues={{
                name: team.name,
                description: team.description ?? "",
                leaderId: team.leaderId ?? "",
                targetRevenue: team.targetRevenue ?? 0,
              }}
              users={members}
              loading={savingTeam}
              onCancel={() => setShowEditModal(false)}
              onSubmit={onSaveTeam}
            />
          </div>
        </div>
      ) : null}

      <AddMemberModal
        open={showAddMemberModal}
        teamName={team.name}
        teamId={team.id}
        users={allUsers}
        currentMembers={members}
        loading={Boolean(busyUserId)}
        onClose={() => setShowAddMemberModal(false)}
        onSubmit={onAddMember}
      />

      <SetLeaderModal
        open={showLeaderModal}
        teamName={team.name}
        candidate={selectedMember}
        loading={Boolean(busyUserId)}
        onClose={() => {
          setShowLeaderModal(false);
          setSelectedMember(null);
        }}
        onConfirm={onConfirmSetLeader}
      />
    </div>
  );
};
