"use client";

import { AlertTriangle, X } from "lucide-react";
import type { PipelineStageDto } from "@/types/pipeline";

interface DeleteStageModalProps {
  open: boolean;
  loading?: boolean;
  stage: PipelineStageDto | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteStageModal = ({
  open,
  loading = false,
  stage,
  onClose,
  onConfirm,
}: DeleteStageModalProps) => {
  if (!open || !stage) {
    return null;
  }

  const blocked = stage.opportunityCount > 0;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="app-shell-font w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h3 className="text-xl font-semibold text-slate-900">Delete Stage</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-600">Delete {stage.name}?</p>

        {blocked ? (
          <p className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-700">
            This stage has {stage.opportunityCount} opportunities. Please move them
            to another stage before deleting.
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            This action cannot be undone.
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading || blocked}
            onClick={() => void onConfirm()}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete Stage"}
          </button>
        </div>
      </div>
    </div>
  );
};
