"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Plus } from "lucide-react";
import { toast } from "sonner";
import { useLeads } from "@/hooks/useLeads";
import { useLeadStats } from "@/hooks/useLeadStats";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { leadService } from "@/services/leadService";
import { leadScoringService } from "@/services/leadScoringService";
import { userService } from "@/services/userService";
import { teamService } from "@/services/teamService";
import { contactService } from "@/services/contactService";
import { getApiMessage } from "@/lib/utils";
import dynamic from "next/dynamic";
import { LeadStatusTabs, type LeadTabKey } from "@/components/leads/LeadStatusTabs";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadTable } from "@/components/leads/LeadTable";
const LeadStatsModal = dynamic(() => import("@/components/leads/LeadStatsModal").then(m => ({ default: m.LeadStatsModal })), { ssr: false });
const CreateLeadModal = dynamic(() => import("@/components/leads/CreateLeadModal").then(m => ({ default: m.CreateLeadModal })), { ssr: false });
const EditLeadModal = dynamic(() => import("@/components/leads/EditLeadModal").then(m => ({ default: m.EditLeadModal })), { ssr: false });
const AssignLeadModal = dynamic(() => import("@/components/leads/AssignLeadModal").then(m => ({ default: m.AssignLeadModal })), { ssr: false });
const ConvertLeadModal = dynamic(() => import("@/components/leads/ConvertLeadModal").then(m => ({ default: m.ConvertLeadModal })), { ssr: false });
const MergeLeadModal = dynamic(() => import("@/components/leads/MergeLeadModal").then(m => ({ default: m.MergeLeadModal })), { ssr: false });
const DeleteLeadModal = dynamic(() => import("@/components/leads/DeleteLeadModal").then(m => ({ default: m.DeleteLeadModal })), { ssr: false });
const LeadScoreModal = dynamic(() => import("@/components/leads/LeadScoreModal").then(m => ({ default: m.LeadScoreModal })), { ssr: false });
import type {
  Lead,
  LeadCreateRequest,
  LeadScoreResultDto,
  LeadStatus,
  LeadTagDto,
  LeadUpdateRequest,
} from "@/types/lead";
import type { SalesTeam } from "@/types/team";
import type { User } from "@/types/user";

const PAGE_SIZE = 20;

const getActiveUsers = (users: User[]) => users.filter((user) => user.active);

export const LeadListPage = () => {
  const { isAdmin, isManager, isRep } = useRoleGuard();
  const { currentUser } = useCurrentUser();

  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<LeadStatus | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [assignedTo, setAssignedTo] = useState<number | undefined>(undefined);

  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<SalesTeam[]>([]);
  const [tags, setTags] = useState<LeadTagDto[]>([]);

  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [assignLead, setAssignLead] = useState<Lead | null>(null);
  const [convertLead, setConvertLead] = useState<Lead | null>(null);
  const [mergeLead, setMergeLead] = useState<Lead | null>(null);
  const [deleteLead, setDeleteLead] = useState<Lead | null>(null);

  const [scoreLead, setScoreLead] = useState<Lead | null>(null);
  const [scoreData, setScoreData] = useState<LeadScoreResultDto | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const [savingCreate, setSavingCreate] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingAssign, setSavingAssign] = useState(false);
  const [savingConvert, setSavingConvert] = useState(false);
  const [savingMerge, setSavingMerge] = useState(false);
  const [savingDelete, setSavingDelete] = useState(false);

  const {
    leads,
    currentPage,
    totalPages,
    totalElements,
    loading,
    error,
    refetch: refetchLeads,
  } = useLeads({
    page,
    size: PAGE_SIZE,
    status,
    assignedTo,
    search,
  });

  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useLeadStats();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [usersResponse, teamsResponse, tagsResponse] = await Promise.all([
          userService.getAll(0, 500),
          teamService.getAll(),
          contactService.getTags(),
        ]);

        setUsers(getActiveUsers(usersResponse.content ?? []));
        setTeams(teamsResponse ?? []);
        setTags((tagsResponse ?? []) as LeadTagDto[]);
      } catch (fetchError) {
        toast.error(getApiMessage(fetchError, "Failed to load lead form data"));
      }
    };

    void loadInitialData();
  }, []);

  const assignableUsersForAssignModal = useMemo(() => {
    if (isAdmin) {
      return users;
    }

    if (isManager) {
      const teamId = currentUser?.teamId ?? null;
      if (!teamId) {
        return [];
      }
      return users.filter((user) => user.teamId === teamId);
    }

    return [];
  }, [currentUser?.teamId, isAdmin, isManager, users]);

  const refreshAll = async () => {
    await Promise.all([refetchLeads(), refetchStats()]);
  };

  const handleTabChange = (tab: LeadTabKey) => {
    setStatus(tab === "ALL" ? undefined : tab);
    setPage(0);
  };

  const showingText = useMemo(
    () => `Showing ${leads.length} of ${totalElements} leads`,
    [leads.length, totalElements],
  );

  const handleCreate = async (payload: LeadCreateRequest) => {
    try {
      setSavingCreate(true);
      await leadService.create(payload);
      toast.success("Lead created successfully");
      setShowCreateModal(false);
      setPage(0);
      await refreshAll();
    } catch (createError) {
      toast.error(getApiMessage(createError, "Failed to create lead"));
    } finally {
      setSavingCreate(false);
    }
  };

  const handleEdit = async (payload: LeadUpdateRequest) => {
    if (!editingLead) {
      return;
    }

    try {
      setSavingEdit(true);
      await leadService.update(editingLead.id, payload);
      toast.success("Lead updated successfully");
      setEditingLead(null);
      await refreshAll();
    } catch (updateError) {
      toast.error(getApiMessage(updateError, "Failed to update lead"));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAssign = async (userId: number) => {
    if (!assignLead) {
      return;
    }

    if (isRep) {
      toast.error("You don't have permission to assign leads");
      return;
    }

    try {
      setSavingAssign(true);
      await leadService.assign(assignLead.id, { userId });
      const assignedUser = assignableUsersForAssignModal.find((user) => Number(user.id) === userId);
      toast.success(
        assignedUser
          ? `Lead assigned to ${assignedUser.firstName} ${assignedUser.lastName}`
          : "Lead assigned successfully",
      );
      setAssignLead(null);
      await refreshAll();
    } catch (assignError) {
      toast.error(getApiMessage(assignError, "Failed to assign lead"));
    } finally {
      setSavingAssign(false);
    }
  };

  const handleConvert = async (values: { assignedTo?: number; teamId?: number }) => {
    if (!convertLead) {
      return;
    }

    try {
      setSavingConvert(true);

      if (values.assignedTo || values.teamId) {
        await leadService.update(convertLead.id, {
          assignedTo: values.assignedTo,
          teamId: values.teamId,
        });
      }

      await leadService.convert(convertLead.id);
      toast.success("Lead converted to opportunity");
      setConvertLead(null);
      await refreshAll();
    } catch (convertError) {
      toast.error(getApiMessage(convertError, "Failed to convert lead"));
    } finally {
      setSavingConvert(false);
    }
  };

  const handleMerge = async (duplicateId: number) => {
    if (!mergeLead) {
      return;
    }

    try {
      setSavingMerge(true);
      await leadService.merge(mergeLead.id, { duplicateId });
      toast.success("Leads merged successfully");
      setMergeLead(null);
      await refreshAll();
    } catch (mergeError) {
      toast.error(getApiMessage(mergeError, "Failed to merge leads"));
    } finally {
      setSavingMerge(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteLead) {
      return;
    }

    try {
      setSavingDelete(true);
      await leadService.delete(deleteLead.id);
      toast.success("Lead deleted");
      setDeleteLead(null);
      await refreshAll();
    } catch (deleteError) {
      toast.error(getApiMessage(deleteError, "Failed to delete lead"));
    } finally {
      setSavingDelete(false);
    }
  };

  const openScoreModal = async (lead: Lead) => {
    setScoreLead(lead);
    setScoreData(null);
    setScoreLoading(true);
    setScoreError(null);

    try {
      const response = await leadScoringService.getScoreBreakdown(lead.id);
      setScoreData(response);
    } catch (scoreFetchError) {
      setScoreError(getApiMessage(scoreFetchError, "Failed to load lead score"));
    } finally {
      setScoreLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[34px] font-semibold leading-tight text-slate-900">Leads</h1>
            <p className="text-sm text-slate-500">Track and manage your sales leads through the pipeline</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowStatsModal(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <BarChart3 className="h-4 w-4" />
              Stats
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#8B6FD0] px-4 text-sm font-semibold text-white transition hover:bg-[#7D62C4]"
            >
              <Plus className="h-4 w-4" />
              Create Lead
            </button>
          </div>
        </header>

        <LeadStatusTabs activeTab={status ?? "ALL"} stats={stats} onChange={handleTabChange} />

        <LeadFilters
          search={search}
          status={status}
          assignedTo={assignedTo}
          users={users}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(0);
          }}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(0);
          }}
          onAssignedToChange={(value) => {
            setAssignedTo(value);
            setPage(0);
          }}
        />

        <p className="text-sm text-slate-500">{showingText}</p>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            <button
              type="button"
              className="ml-3 font-semibold underline"
              onClick={() => void refetchLeads()}
            >
              Retry
            </button>
          </div>
        ) : null}

        {statsError && !statsLoading ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {statsError}
          </div>
        ) : null}

        <LeadTable
          leads={leads}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={PAGE_SIZE}
          canDelete={isAdmin}
          canAssign={!isRep}
          onPageChange={setPage}
          onEdit={setEditingLead}
          onAssign={(lead) => {
            if (isRep) {
              toast.error("You don't have permission to assign leads");
              return;
            }
            setAssignLead(lead);
          }}
          onConvert={setConvertLead}
          onViewScore={(lead) => {
            void openScoreModal(lead);
          }}
          onMerge={setMergeLead}
          onDelete={setDeleteLead}
        />
      </div>

      <LeadStatsModal open={showStatsModal} stats={stats} onClose={() => setShowStatsModal(false)} />

      <CreateLeadModal
        open={showCreateModal}
        loading={savingCreate}
        users={users}
        teams={teams}
        tags={tags}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
      />

      <EditLeadModal
        open={Boolean(editingLead)}
        loading={savingEdit}
        lead={editingLead}
        users={users}
        teams={teams}
        tags={tags}
        onClose={() => setEditingLead(null)}
        onSubmit={handleEdit}
      />

      <AssignLeadModal
        open={Boolean(assignLead)}
        lead={assignLead}
        users={assignableUsersForAssignModal}
        loading={savingAssign}
        onClose={() => setAssignLead(null)}
        onSubmit={handleAssign}
      />

      <ConvertLeadModal
        open={Boolean(convertLead)}
        lead={convertLead}
        users={users}
        teams={teams}
        loading={savingConvert}
        onClose={() => setConvertLead(null)}
        onSubmit={handleConvert}
      />

      <MergeLeadModal
        open={Boolean(mergeLead)}
        primaryLead={mergeLead}
        loading={savingMerge}
        onClose={() => setMergeLead(null)}
        onSubmit={handleMerge}
      />

      <DeleteLeadModal
        open={Boolean(deleteLead)}
        lead={deleteLead}
        loading={savingDelete}
        onClose={() => setDeleteLead(null)}
        onConfirm={handleDelete}
      />

      <LeadScoreModal
        open={Boolean(scoreLead)}
        lead={scoreLead}
        score={scoreData}
        loading={scoreLoading}
        error={scoreError}
        onClose={() => {
          setScoreLead(null);
          setScoreData(null);
          setScoreError(null);
          setScoreLoading(false);
        }}
      />
    </>
  );
};
