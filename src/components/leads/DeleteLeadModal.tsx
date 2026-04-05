"use client";

import { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import type { Lead } from "@/types/lead";

interface DeleteLeadModalProps {
  open: boolean;
  lead: Lead | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteLeadModal = ({
  open,
  lead,
  loading = false,
  onClose,
  onConfirm,
}: DeleteLeadModalProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("keydown", onEscape);
    };
  }, [onClose, open]);

  if (!open || !lead) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-red-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Delete Lead
            </h3>
            <p className="text-sm text-slate-500">This action cannot be undone.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 p-4">
          <p className="text-sm text-slate-700">
            Are you sure you want to delete <span className="font-semibold">{lead.contactName}</span>? This lead will be permanently removed.
          </p>
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            Deleted lead data cannot be recovered.
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void onConfirm()}
            className="inline-flex h-9 items-center gap-1 rounded-md bg-red-600 px-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            {loading ? "Deleting..." : "Delete Lead"}
          </button>
        </div>
      </div>
    </div>
  );
};
