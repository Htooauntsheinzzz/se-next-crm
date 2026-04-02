"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { User } from "@/types/user";
import { Button } from "@/components/ui/Button";

interface AddMemberModalProps {
  open: boolean;
  teamName: string;
  teamId: string;
  users: User[];
  currentMembers: User[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (userId: string) => Promise<void>;
}

export const AddMemberModal = ({
  open,
  teamName,
  teamId,
  users,
  currentMembers,
  loading = false,
  onClose,
  onSubmit,
}: AddMemberModalProps) => {
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const currentMemberIds = useMemo(
    () => new Set(currentMembers.map((member) => member.id)),
    [currentMembers],
  );

  const availableUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      if (!user.active) {
        return false;
      }

      if (currentMemberIds.has(user.id)) {
        return false;
      }

      if (user.teamId && user.teamId !== teamId) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return fullName.includes(normalizedSearch) || user.email.toLowerCase().includes(normalizedSearch);
    });
  }, [currentMemberIds, search, teamId, users]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Add Team Member</h3>
            <p className="text-xs text-slate-500">Select a user to add to {teamName}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-4 py-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search user..."
            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700"
          />

          <select
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700"
          >
            <option value="">Choose a user...</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </select>

          <p className="text-xs text-slate-400">
            Only active users without another team are shown.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3">
          <Button type="button" variant="outline" className="w-auto px-4" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            loading={loading}
            disabled={!selectedUserId}
            className="w-auto px-4"
            onClick={() => onSubmit(selectedUserId)}
          >
            Add Member
          </Button>
        </div>
      </div>
    </div>
  );
};
