"use client";

import { X } from "lucide-react";
import type { Role } from "@/types/user";
import { roleToLabel } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface RoleChangeModalProps {
  open: boolean;
  userName: string;
  currentRole: Role;
  nextRole: Role;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const RoleChangeModal = ({
  open,
  userName,
  currentRole,
  nextRole,
  loading = false,
  onClose,
  onConfirm,
}: RoleChangeModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="text-base font-semibold text-slate-800">Change User Role</h3>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 py-4 text-sm text-slate-600">
          Change <span className="font-semibold text-slate-800">{userName}</span>
          {"'"}s role from <span className="font-semibold text-slate-800">{roleToLabel(currentRole)}</span>{" "}
          to <span className="font-semibold text-slate-800">{roleToLabel(nextRole)}</span>?
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3">
          <Button type="button" variant="outline" className="w-auto px-4" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" loading={loading} className="w-auto px-4" onClick={() => onConfirm()}>
            Update Role
          </Button>
        </div>
      </div>
    </div>
  );
};
