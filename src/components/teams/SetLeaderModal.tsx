"use client";

import { X } from "lucide-react";
import type { User } from "@/types/user";
import { Button } from "@/components/ui/Button";

interface SetLeaderModalProps {
  open: boolean;
  teamName: string;
  candidate: User | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (userId: string) => Promise<void>;
}

export const SetLeaderModal = ({
  open,
  teamName,
  candidate,
  loading = false,
  onClose,
  onConfirm,
}: SetLeaderModalProps) => {
  if (!open || !candidate) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="text-lg font-semibold text-slate-900">Set Team Leader</h3>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 py-4 text-sm text-slate-600">
          Set <span className="font-semibold text-slate-900">{candidate.firstName} {candidate.lastName}</span>
          {" "}as the leader of <span className="font-semibold text-slate-900">{teamName}</span>?
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3">
          <Button type="button" variant="outline" className="w-auto px-4" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            loading={loading}
            className="w-auto px-4"
            onClick={() => onConfirm(candidate.id)}
          >
            Set Leader
          </Button>
        </div>
      </div>
    </div>
  );
};
