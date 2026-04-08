import { AlertTriangle } from "lucide-react";
import type { Activity } from "@/types/activity";

interface DeleteActivityModalProps {
  open: boolean;
  loading?: boolean;
  activity: Activity | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteActivityModal = ({
  open,
  loading = false,
  activity,
  onClose,
  onConfirm,
}: DeleteActivityModalProps) => {
  if (!open || !activity) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="app-shell-font w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Delete Activity</h3>
            <p className="mt-1 text-sm text-slate-500">This action cannot be undone.</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-3">
          <p className="text-sm font-medium text-slate-800">{activity.title}</p>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void onConfirm()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};
