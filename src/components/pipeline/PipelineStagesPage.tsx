"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { usePipelineStages } from "@/hooks/usePipelineStages";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { pipelineService } from "@/services/pipelineService";
import { PipelinePreview } from "@/components/pipeline/PipelinePreview";
import { PipelineStageList } from "@/components/pipeline/PipelineStageList";
import dynamic from "next/dynamic";
const AddStageModal = dynamic(() => import("@/components/pipeline/AddStageModal").then(m => ({ default: m.AddStageModal })), { ssr: false });
const EditStageModal = dynamic(() => import("@/components/pipeline/EditStageModal").then(m => ({ default: m.EditStageModal })), { ssr: false });
const DeleteStageModal = dynamic(() => import("@/components/pipeline/DeleteStageModal").then(m => ({ default: m.DeleteStageModal })), { ssr: false });
import { getApiMessage } from "@/lib/utils";
import type { PipelineStageDto } from "@/types/pipeline";

export const PipelineStagesPage = () => {
  const { isAdmin, isManager } = useRoleGuard();
  const { stages, loading, error, refetch } = usePipelineStages();
  const [localStages, setLocalStages] = useState<PipelineStageDto[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStage, setEditingStage] = useState<PipelineStageDto | null>(null);
  const [deletingStage, setDeletingStage] = useState<PipelineStageDto | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalStages(stages);
  }, [stages]);

  const canManage = isAdmin || isManager;

  const handleAddStage = async (payload: {
    name: string;
    probability?: number;
    isWon?: boolean;
    isLost?: boolean;
  }) => {
    try {
      setSaving(true);
      await pipelineService.createStage(payload);
      toast.success("Stage added");
      setShowAddModal(false);
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to add stage"));
    } finally {
      setSaving(false);
    }
  };

  const handleEditStage = async (payload: {
    name?: string;
    probability?: number;
    isWon?: boolean;
    isLost?: boolean;
  }) => {
    if (!editingStage) {
      return;
    }

    try {
      setSaving(true);
      await pipelineService.updateStage(editingStage.id, payload);
      toast.success("Stage updated");
      setEditingStage(null);
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to update stage"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStage = async () => {
    if (!deletingStage) {
      return;
    }

    try {
      setSaving(true);
      await pipelineService.deleteStage(deletingStage.id);
      toast.success("Stage deleted");
      setDeletingStage(null);
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to delete stage"));
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = async (nextIds: number[]) => {
    const byId = new Map(localStages.map((stage) => [stage.id, stage]));
    const reordered = nextIds
      .map((id) => byId.get(id))
      .filter((value): value is PipelineStageDto => Boolean(value));
    const previous = localStages;
    setLocalStages(reordered);

    try {
      await pipelineService.reorderStages(nextIds);
      toast.success("Stages reordered");
      await refetch();
    } catch (err) {
      setLocalStages(previous);
      toast.error(getApiMessage(err, "Failed to reorder stages"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[34px] font-semibold leading-tight text-slate-900">Pipeline Stages</h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure your sales pipeline stages and probabilities
          </p>
        </div>

        {canManage ? (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#8B6FD0] px-4 text-sm font-semibold text-white transition hover:bg-[#7A58BE]"
          >
            <Plus className="h-4 w-4" />
            Add Stage
          </button>
        ) : null}
      </div>

      <PipelinePreview stages={localStages} />

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="h-[320px] animate-pulse rounded-lg bg-slate-100" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      ) : (
        <PipelineStageList
          stages={localStages}
          onEdit={(stage) => {
            if (canManage) {
              setEditingStage(stage);
            }
          }}
          onDelete={(stage) => {
            if (isAdmin) {
              setDeletingStage(stage);
            }
          }}
          onReorder={(ids) => {
            if (canManage) {
              void handleReorder(ids);
            }
          }}
          canEdit={canManage}
          canDelete={isAdmin}
          canReorder={canManage}
        />
      )}

      <AddStageModal
        open={showAddModal}
        loading={saving}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddStage}
      />

      <EditStageModal
        open={Boolean(editingStage)}
        loading={saving}
        stage={editingStage}
        onClose={() => setEditingStage(null)}
        onSubmit={handleEditStage}
      />

      <DeleteStageModal
        open={Boolean(deletingStage)}
        loading={saving}
        stage={deletingStage}
        onClose={() => setDeletingStage(null)}
        onConfirm={handleDeleteStage}
      />
    </div>
  );
};
