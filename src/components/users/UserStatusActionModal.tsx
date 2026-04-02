"use client";

import { useEffect } from "react";
import { AlertTriangle, UserCheck, UserX, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { User } from "@/types/user";

interface UserStatusActionModalProps {
  open: boolean;
  user: User | null;
  mode: "activate" | "deactivate";
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const UserStatusActionModal = ({
  open,
  user,
  mode,
  loading = false,
  onClose,
  onConfirm,
}: UserStatusActionModalProps) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", onKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !user) {
    return null;
  }

  const isDeactivate = mode === "deactivate";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
            {isDeactivate ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <UserCheck className="h-4 w-4 text-green-600" />
            )}
            {isDeactivate ? "Deactivate User" : "Activate User"}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 p-4 text-sm text-slate-600">
          <p>
            {isDeactivate ? "Deactivate" : "Activate"}{" "}
            <span className="font-semibold text-slate-900">{user.firstName} {user.lastName}</span>?
          </p>
          {isDeactivate ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              This will disable account access until reactivated.
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3">
          <Button type="button" variant="outline" className="w-auto px-4" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            loading={loading}
            className={`w-auto px-4 ${isDeactivate ? "bg-red-600 hover:bg-red-700" : ""}`}
            onClick={() => onConfirm()}
          >
            {isDeactivate ? (
              <span className="inline-flex items-center gap-2">
                <UserX className="h-4 w-4" />
                Confirm Deactivate
              </span>
            ) : (
              "Confirm Activate"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
