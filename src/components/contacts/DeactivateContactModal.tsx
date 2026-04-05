"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import type { Contact } from "@/types/contact";

interface DeactivateContactModalProps {
  open: boolean;
  contact: Contact | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeactivateContactModal = ({
  open,
  contact,
  loading = false,
  onClose,
  onConfirm,
}: DeactivateContactModalProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, open]);

  if (!open || !contact) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
          <div className="inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h3 className="text-lg font-semibold text-slate-900">Deactivate Contact</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 p-4">
          <p className="text-sm text-slate-700">
            Are you sure you want to deactivate <span className="font-semibold">{contact.fullName}</span>?
            This contact will be hidden from active lists but data will be retained.
          </p>
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
            onClick={() => void onConfirm()}
            disabled={loading}
            className="inline-flex h-9 items-center rounded-md bg-red-500 px-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Deactivating..." : "Deactivate Contact"}
          </button>
        </div>
      </div>
    </div>
  );
};
