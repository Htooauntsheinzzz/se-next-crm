"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { User } from "@/types/user";
import { UserEditForm } from "@/components/users/UserEditForm";

interface UserEditActionModalProps {
  open: boolean;
  user: User | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: { firstName: string; lastName: string }) => Promise<void>;
}

export const UserEditActionModal = ({
  open,
  user,
  loading = false,
  onClose,
  onSubmit,
}: UserEditActionModalProps) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="text-lg font-semibold text-slate-900">Edit Profile</h3>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          <UserEditForm
            initialValues={{ firstName: user.firstName, lastName: user.lastName }}
            loading={loading}
            onCancel={onClose}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
};
