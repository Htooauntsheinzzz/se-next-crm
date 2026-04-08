"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { OpportunityKanbanPage } from "@/components/opportunities/OpportunityKanbanPage";
import { OpportunityListPage } from "@/components/opportunities/OpportunityListPage";
import { CreateOpportunityModal } from "@/components/opportunities/CreateOpportunityModal";
import { EditOpportunityModal } from "@/components/opportunities/EditOpportunityModal";
import { MarkWonModal } from "@/components/opportunities/MarkWonModal";
import { MarkLostModal } from "@/components/opportunities/MarkLostModal";
import { useKanbanView } from "@/hooks/useKanbanView";
import { useOpportunities } from "@/hooks/useOpportunities";
import { usePipelineStages } from "@/hooks/usePipelineStages";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useLostReasons } from "@/hooks/useLostReasons";
import { opportunityService, type KanbanColumnDto } from "@/services/opportunityService";
import { teamService } from "@/services/teamService";
import { userService } from "@/services/userService";
import { contactService } from "@/services/contactService";
import { getApiMessage } from "@/lib/utils";
import type {
  KanbanState,
  Opportunity,
  OpportunityCreateRequest,
  OpportunityUpdateRequest,
} from "@/types/opportunity";
import type { SalesTeam } from "@/types/team";
import type { User } from "@/types/user";
import type { TagDto } from "@/types/contact";

const PAGE_SIZE = 20;

export const OpportunitiesModule = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "list" ? "list" : "kanban";
  const { isAdmin } = useRoleGuard();

  const [teamFilter, setTeamFilter] = useState<number | undefined>(undefined);
  const [listPage, setListPage] = useState(0);
  const [search, setSearch] = useState("");
  const [stageId, setStageId] = useState<number | undefined>(undefined);
  const [kanbanState, setKanbanState] = useState<KanbanState | undefined>(undefined);

  const [teams, setTeams] = useState<SalesTeam[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tags, setTags] = useState<TagDto[]>([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStageId, setCreateStageId] = useState<number | undefined>(undefined);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [wonOpportunity, setWonOpportunity] = useState<Opportunity | null>(null);
  const [lostOpportunity, setLostOpportunity] = useState<Opportunity | null>(null);
  const [lostReasonId, setLostReasonId] = useState<number | undefined>(undefined);
  const [lostNote, setLostNote] = useState("");
  const [saving, setSaving] = useState(false);

  const { columns, totalPipelineValue, loading: kanbanLoading, error: kanbanError, refetch: refetchKanban } =
    useKanbanView(teamFilter);
  const { stages } = usePipelineStages();
  const { reasons } = useLostReasons(Boolean(lostOpportunity));

  const {
    opportunities,
    currentPage,
    totalPages,
    totalElements,
    loading: listLoading,
    error: listError,
    refetch: refetchList,
  } = useOpportunities({
    page: listPage,
    size: PAGE_SIZE,
    stageId,
    teamId: teamFilter,
    kanbanState,
    search,
  });

  const [localColumns, setLocalColumns] = useState<KanbanColumnDto[]>([]);

  useEffect(() => {
    setLocalColumns((previous) => {
      if (previous === columns) {
        return previous;
      }

      if (previous.length === 0 && columns.length === 0) {
        return previous;
      }

      return columns;
    });
  }, [columns]);

  useEffect(() => {
    const loadPageData = async () => {
      try {
        const [usersResponse, teamsResponse, tagsResponse] = await Promise.all([
          userService.getAll(0, 500),
          teamService.getAll(),
          contactService.getTags(),
        ]);
        setUsers(usersResponse.content ?? []);
        setTeams(teamsResponse ?? []);
        setTags(tagsResponse ?? []);
      } catch (err) {
        toast.error(getApiMessage(err, "Failed to load opportunity metadata"));
      }
    };

    void loadPageData();
  }, []);

  const weightedValue = useMemo(
    () =>
      localColumns.reduce(
        (sum, column) =>
          sum +
          column.opportunities.reduce((columnSum, opportunity) => {
            const weighted = Number(opportunity.weightedRevenue || 0);
            return columnSum + (Number.isFinite(weighted) ? weighted : 0);
          }, 0),
        0,
      ),
    [localColumns],
  );

  const totalOpportunities = useMemo(
    () => localColumns.reduce((sum, column) => sum + column.count, 0),
    [localColumns],
  );

  const refreshAll = async () => {
    await Promise.all([refetchKanban(), refetchList()]);
  };

  const updateView = (nextView: "kanban" | "list") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", nextView);
    router.push(`/opportunities?${params.toString()}`);
  };

  const handleCreateSubmit = async (payload: OpportunityCreateRequest | OpportunityUpdateRequest) => {
    try {
      setSaving(true);
      await opportunityService.create(payload as OpportunityCreateRequest);
      toast.success("Opportunity created");
      setShowCreateModal(false);
      setCreateStageId(undefined);
      await refreshAll();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to create opportunity"));
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (payload: OpportunityCreateRequest | OpportunityUpdateRequest) => {
    if (!editingOpportunity) {
      return;
    }

    try {
      setSaving(true);
      await opportunityService.update(editingOpportunity.id, payload as OpportunityUpdateRequest);
      toast.success("Opportunity updated");
      setEditingOpportunity(null);
      await refreshAll();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to update opportunity"));
    } finally {
      setSaving(false);
    }
  };

  const handleMarkWon = async () => {
    if (!wonOpportunity) {
      return;
    }

    try {
      setSaving(true);
      await opportunityService.markWon(wonOpportunity.id);
      toast.success("Opportunity marked as won");
      setWonOpportunity(null);
      await refreshAll();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to mark as won"));
    } finally {
      setSaving(false);
    }
  };

  const handleMarkLost = async () => {
    if (!lostOpportunity) {
      return;
    }

    try {
      setSaving(true);
      await opportunityService.markLost(lostOpportunity.id, {
        lostReasonId,
        lostNote: lostNote.trim() || undefined,
      });
      toast.success("Opportunity marked as lost");
      setLostOpportunity(null);
      setLostReasonId(undefined);
      setLostNote("");
      await refreshAll();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to mark as lost"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (opportunity: Opportunity) => {
    const confirmed = window.confirm("Delete this opportunity?");
    if (!confirmed) {
      return;
    }

    try {
      await opportunityService.delete(opportunity.id);
      toast.success("Opportunity deleted");
      await refreshAll();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to delete opportunity"));
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const destination = result.destination;
    const source = result.source;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceStageId = Number(source.droppableId);
    const destinationStageId = Number(destination.droppableId);

    const previousColumns = localColumns;

    const sourceColumnIndex = previousColumns.findIndex(
      (column) => column.stage.id === sourceStageId,
    );
    const destinationColumnIndex = previousColumns.findIndex(
      (column) => column.stage.id === destinationStageId,
    );

    if (sourceColumnIndex < 0 || destinationColumnIndex < 0) {
      return;
    }

    const sourceColumn = previousColumns[sourceColumnIndex];
    const destinationColumn = previousColumns[destinationColumnIndex];
    if (destinationColumn.stage.isWon || destinationColumn.stage.isLost) {
      return;
    }
    const sourceItems = [...sourceColumn.opportunities];
    const destinationItems =
      sourceColumnIndex === destinationColumnIndex
        ? sourceItems
        : [...destinationColumn.opportunities];

    const [moved] = sourceItems.splice(source.index, 1);
    if (!moved) {
      return;
    }

    const movedWithNewStage: Opportunity = {
      ...moved,
      stageId: destinationStageId,
      stageName: destinationColumn.stage.name,
      probability: destinationColumn.stage.probability,
      weightedRevenue:
        (Number(moved.expectedRevenue || 0) * Number(destinationColumn.stage.probability || 0)) /
        100,
    };
    destinationItems.splice(destination.index, 0, movedWithNewStage);

    const nextColumns = [...previousColumns];
    nextColumns[sourceColumnIndex] = {
      ...sourceColumn,
      opportunities: sourceItems,
      count: sourceItems.length,
      totalRevenue: sourceItems.reduce((sum, item) => sum + Number(item.expectedRevenue || 0), 0),
    };
    nextColumns[destinationColumnIndex] = {
      ...destinationColumn,
      opportunities: destinationItems,
      count: destinationItems.length,
      totalRevenue: destinationItems.reduce(
        (sum, item) => sum + Number(item.expectedRevenue || 0),
        0,
      ),
    };

    setLocalColumns(nextColumns);

    try {
      await opportunityService.moveStage(moved.id, destinationStageId);
      toast.success(`Moved to ${destinationColumn.stage.name}`);
      await refreshAll();
    } catch (err) {
      setLocalColumns(previousColumns);
      toast.error(getApiMessage(err, "Failed to move stage"));
    }
  };

  return (
    <>
      {view === "kanban" ? (
        <OpportunityKanbanPage
          teamId={teamFilter}
          teams={teams}
          columns={localColumns}
          loading={kanbanLoading}
          error={kanbanError}
          totalPipeline={totalPipelineValue}
          weightedValue={weightedValue}
          totalOpportunities={totalOpportunities}
          onTeamChange={setTeamFilter}
          onSwitchToList={() => updateView("list")}
          onCreate={() => setShowCreateModal(true)}
          onAddOpportunity={(stageIdFromColumn) => {
            setCreateStageId(stageIdFromColumn);
            setShowCreateModal(true);
          }}
          onCardClick={(opportunity) => router.push(`/opportunities/${opportunity.id}`)}
          onDragEnd={handleDragEnd}
        />
      ) : (
        <OpportunityListPage
          search={search}
          stageId={stageId}
          teamId={teamFilter}
          kanbanState={kanbanState}
          stages={stages}
          teams={teams}
          opportunities={opportunities}
          loading={listLoading}
          error={listError}
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={PAGE_SIZE}
          canDelete={isAdmin}
          onSearchChange={(value) => {
            setSearch(value);
            setListPage(0);
          }}
          onStageChange={(value) => {
            setStageId(value);
            setListPage(0);
          }}
          onTeamChange={(value) => {
            setTeamFilter(value);
            setListPage(0);
          }}
          onStateChange={(value) => {
            setKanbanState(value);
            setListPage(0);
          }}
          onPageChange={setListPage}
          onSwitchToKanban={() => updateView("kanban")}
          onCreate={() => setShowCreateModal(true)}
          onView={(opportunity) => router.push(`/opportunities/${opportunity.id}`)}
          onEdit={setEditingOpportunity}
          onMarkWon={setWonOpportunity}
          onMarkLost={setLostOpportunity}
          onDelete={(opportunity) => void handleDelete(opportunity)}
        />
      )}

      <CreateOpportunityModal
        open={showCreateModal}
        loading={saving}
        stages={stages}
        users={users}
        teams={teams}
        tags={tags}
        forcedStageId={createStageId}
        onClose={() => {
          setShowCreateModal(false);
          setCreateStageId(undefined);
        }}
        onSubmit={handleCreateSubmit}
      />

      <EditOpportunityModal
        open={Boolean(editingOpportunity)}
        loading={saving}
        opportunity={editingOpportunity}
        stages={stages}
        users={users}
        teams={teams}
        tags={tags}
        onClose={() => setEditingOpportunity(null)}
        onSubmit={handleEditSubmit}
      />

      <MarkWonModal
        open={Boolean(wonOpportunity)}
        loading={saving}
        opportunity={wonOpportunity}
        onClose={() => setWonOpportunity(null)}
        onConfirm={handleMarkWon}
      />

      <MarkLostModal
        open={Boolean(lostOpportunity)}
        loading={saving}
        reasons={reasons}
        opportunity={lostOpportunity}
        selectedReasonId={lostReasonId}
        note={lostNote}
        onReasonChange={setLostReasonId}
        onNoteChange={setLostNote}
        onClose={() => {
          setLostOpportunity(null);
          setLostReasonId(undefined);
          setLostNote("");
        }}
        onConfirm={handleMarkLost}
      />
    </>
  );
};
