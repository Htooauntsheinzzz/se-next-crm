"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp, X } from "lucide-react";
import type { Lead } from "@/types/lead";
import type { SalesTeam } from "@/types/team";
import type { User } from "@/types/user";

interface ConvertLeadModalProps {
  open: boolean;
  lead: Lead | null;
  users: User[];
  teams: SalesTeam[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: { assignedTo?: number; teamId?: number }) => Promise<void>;
}

const toNumberOrUndefined = (value: string) => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const ConvertLeadModal = ({
  open,
  lead,
  users,
  teams,
  loading = false,
  onClose,
  onSubmit,
}: ConvertLeadModalProps) => {
  const [assignedTo, setAssignedTo] = useState("");
  const [teamId, setTeamId] = useState("");

  useEffect(() => {
    if (!open || !lead) {
      return;
    }

    setAssignedTo(lead.assignedTo ? String(lead.assignedTo) : "");
    setTeamId(lead.teamId ? String(lead.teamId) : "");

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("keydown", onEscape);
    };
  }, [lead, onClose, open]);

  const selectedUser = useMemo(
    () => users.find((user) => String(user.id) === assignedTo) ?? null,
    [assignedTo, users],
  );

  useEffect(() => {
    if (!selectedUser?.teamId) {
      return;
    }

    setTeamId(String(selectedUser.teamId));
  }, [selectedUser]);

  if (!open || !lead) {
    return null;
  }

  const isDisabled = loading || lead.status === "CONVERTED" || lead.status === "LOST";
  const previewName = `${lead.contactName || "Lead"}${lead.companyName ? ` - ${lead.companyName}` : ""}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <TrendingUp className="h-4 w-4 text-[#8B6FD0]" />
              Convert Lead to Opportunity
            </h3>
            <p className="text-sm text-slate-500">
              This will create a new opportunity from this lead and mark the lead as converted.
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
          <section>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Lead</p>
            <p className="text-sm font-semibold text-slate-900">{lead.contactName}</p>
            <p className="text-xs text-slate-500">Company</p>
            <p className="text-sm text-slate-700">{lead.companyName || "-"}</p>
          </section>

          <section>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Opportunity Preview</p>
            <div className="mt-1 rounded-md border border-purple-100 bg-purple-50 px-3 py-2">
              <p className="text-xs text-slate-500">New Opportunity Name</p>
              <p className="text-sm font-semibold text-slate-800">{previewName}</p>
            </div>
          </section>

          <section>
            <p className="text-sm font-medium text-slate-800">Assignment (Optional)</p>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-600">Assign To</label>
                <select
                  value={assignedTo}
                  onChange={(event) => setAssignedTo(event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                >
                  <option value="">Select user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">Team</label>
                <select
                  value={teamId}
                  onChange={(event) => setTeamId(event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                >
                  <option value="">Select team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {lead.status === "CONVERTED" || lead.status === "LOST" ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              This lead cannot be converted because it is already {lead.status.toLowerCase()}.
            </p>
          ) : null}
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
            disabled={isDisabled}
            onClick={() =>
              void onSubmit({
                assignedTo: toNumberOrUndefined(assignedTo),
                teamId: toNumberOrUndefined(teamId),
              })
            }
            className="inline-flex h-9 items-center gap-1 rounded-md bg-[#8B6FD0] px-3 text-sm font-semibold text-white transition hover:bg-[#7D62C4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Converting..." : "Convert to Opportunity"}
          </button>
        </div>
      </div>
    </div>
  );
};
