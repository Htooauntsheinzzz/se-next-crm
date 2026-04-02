"use client";

import { useEffect, useMemo, useState } from "react";
import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Role, User } from "@/types/user";
import { roleToLabel } from "@/lib/utils";

interface UserRoleActionModalProps {
  open: boolean;
  user: User | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (role: Role) => Promise<void>;
}

const roleOptions: Role[] = ["ADMIN", "SALES_MANAGER", "SALES_REP"];

export const UserRoleActionModal = ({
  open,
  user,
  loading = false,
  onClose,
  onSubmit,
}: UserRoleActionModalProps) => {
  const [selectedRole, setSelectedRole] = useState<Role>("SALES_REP");

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

  useEffect(() => {
    if (open && user) {
      setSelectedRole(user.role);
    }
  }, [open, user]);

  const unchanged = useMemo(() => {
    return user ? selectedRole === user.role : true;
  }, [selectedRole, user]);

  if (!open || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Shield className="h-4 w-4" />
            Change Role
          </h3>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <p className="text-sm text-slate-600">
            Change role for <span className="font-semibold text-slate-900">{user.firstName} {user.lastName}</span>.
          </p>

          <div className="space-y-2">
            {roleOptions.map((role) => (
              <label
                key={role}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                  selectedRole === role
                    ? "border-[#8B6FD0] bg-[#F6F1FF]"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  className="h-4 w-4"
                  checked={selectedRole === role}
                  onChange={() => setSelectedRole(role)}
                />
                <span className="font-medium text-slate-800">{roleToLabel(role)}</span>
                {user.role === role ? (
                  <span className="ml-auto text-xs font-semibold text-slate-500">Current</span>
                ) : null}
              </label>
            ))}
          </div>

          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Changing role updates access permissions immediately.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3">
          <Button type="button" variant="outline" className="w-auto px-4" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            loading={loading}
            disabled={unchanged}
            className="w-auto px-4"
            onClick={() => onSubmit(selectedRole)}
          >
            Update Role
          </Button>
        </div>
      </div>
    </div>
  );
};
