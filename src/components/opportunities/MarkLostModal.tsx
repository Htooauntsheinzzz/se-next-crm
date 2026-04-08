"use client";

import { AlertTriangle, X } from "lucide-react";
import type { LostReasonDto } from "@/types/pipeline";
import type { Opportunity } from "@/types/opportunity";

interface MarkLostModalProps {
  open: boolean;
  loading?: boolean;
  reasons: LostReasonDto[];
  opportunity: Opportunity | null;
  selectedReasonId?: number;
  note: string;
  onReasonChange: (reasonId: number | undefined) => void;
  onNoteChange: (note: string) => void;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const MarkLostModal = ({
  open,
  loading = false,
  reasons,
  opportunity,
  selectedReasonId,
  note,
  onReasonChange,
  onNoteChange,
  onClose,
  onConfirm,
}: MarkLostModalProps) => {
  if (!open || !opportunity) {
    return null;
  }

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
            <h3 className="text-xl font-semibold text-slate-900">Mark as Lost</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Record why this opportunity was lost for future insights.
        </p>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">Lost Reason</label>
          <select
            value={selectedReasonId ?? ""}
            onChange={(event) =>
              onReasonChange(event.target.value ? Number(event.target.value) : undefined)
            }
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700"
          >
            <option value="">Select a reason</option>
            {reasons.map((reason) => (
              <option key={reason.id} value={reason.id}>
                {reason.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
          <textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            rows={4}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none ring-[#D9CFF5] transition focus:ring-2"
            placeholder="Add context about why this was lost..."
          />
        </div>

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
            disabled={loading}
            onClick={() => void onConfirm()}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-70"
          >
            {loading ? "Saving..." : "Mark as Lost"}
          </button>
        </div>
      </div>
    </div>
  );
};
