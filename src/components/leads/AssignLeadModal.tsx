"use client";

import { useEffect, useMemo, useState } from "react";
import { UserPlus, X } from "lucide-react";
import type { Lead } from "@/types/lead";
import type { User } from "@/types/user";
import { roleToLabel } from "@/lib/utils";

interface AssignLeadModalProps {
  open: boolean;
  lead: Lead | null;
  users: User[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (userId: number) => Promise<void>;
}

export const AssignLeadModal = ({
  open,
  lead,
  users,
  loading = false,
  onClose,
  onSubmit,
}: AssignLeadModalProps) => {
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  useEffect(() => {
    if (!open) {
      return;
    }

    const initialAssignedId =
      lead?.assignedTo && users.some((user) => Number(user.id) === Number(lead.assignedTo))
        ? String(lead.assignedTo)
        : "";

    setSelectedUserId(initialAssignedId);

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [lead?.assignedTo, onClose, open, users]);

  const selectedUser = useMemo(
    () => users.find((user) => String(user.id) === selectedUserId) ?? null,
    [selectedUserId, users],
  );
  const canSubmit = Boolean(selectedUser) && !loading;

  if (!open || !lead) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <UserPlus className="h-4 w-4 text-[#8B6FD0]" />
              Assign Lead
            </h3>
            <p className="text-sm text-slate-500">
              Assign this lead to a team member. The team will be automatically filled.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-sm font-semibold text-slate-900">{lead.contactName}</p>
            <p className="text-xs text-slate-500">{lead.companyName || "—"}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Assign To *</label>
            <select
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              disabled={users.length === 0}
              className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({roleToLabel(user.role)})
                </option>
              ))}
            </select>
            {users.length === 0 ? (
              <p className="mt-1 text-xs text-amber-600">No assignable users for your role/team.</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Team</label>
            <input
              value={selectedUser?.teamName ?? ""}
              disabled
              placeholder="Select a user to auto-fill team"
              className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600"
            />
            <p className="mt-1 text-xs text-slate-500">
              Team is automatically filled based on the selected user.
            </p>
          </div>

          <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2">
            <p className="text-xs font-semibold text-blue-700">Current Assignment</p>
            <p className="text-sm text-blue-700">
              {lead.assignedToName ? `${lead.assignedToName} (${lead.teamName || ""})` : "Unassigned"}
            </p>
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
            disabled={!canSubmit}
            onClick={() => void onSubmit(Number(selectedUserId))}
            className="inline-flex h-9 items-center gap-1 rounded-md bg-[#8B6FD0] px-3 text-sm font-semibold text-white transition hover:bg-[#7D62C4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Assigning..." : "Assign Lead"}
          </button>
        </div>
      </div>
    </div>
  );
};
