"use client";

import { Trophy, X } from "lucide-react";
import { formatCurrency } from "@/components/opportunities/opportunityConfig";
import type { Opportunity } from "@/types/opportunity";

interface MarkWonModalProps {
  open: boolean;
  loading?: boolean;
  opportunity: Opportunity | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const MarkWonModal = ({
  open,
  loading = false,
  opportunity,
  onClose,
  onConfirm,
}: MarkWonModalProps) => {
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
            <Trophy className="h-5 w-5 text-green-600" />
            <h3 className="text-xl font-semibold text-slate-900">Mark as Won</h3>
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
          Congratulations! Mark this opportunity as won?
        </p>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="font-semibold text-slate-900">{opportunity.name}</p>
          <p className="text-sm text-slate-600">
            Revenue: {formatCurrency(opportunity.expectedRevenue)}
          </p>
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
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-70"
          >
            {loading ? "Saving..." : "Mark as Won"}
          </button>
        </div>
      </div>
    </div>
  );
};
