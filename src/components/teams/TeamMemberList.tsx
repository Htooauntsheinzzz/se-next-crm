import { Crown, Mail, UserMinus, UserRoundPlus } from "lucide-react";
import type { User } from "@/types/user";
import { RoleBadge } from "@/components/users/RoleBadge";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { getInitials } from "@/lib/utils";

interface TeamMemberListProps {
  members: User[];
  leaderId: string | null;
  canRemove: boolean;
  canSetLeader: boolean;
  busyUserId?: string | null;
  onRemove: (user: User) => void;
  onSetLeader: (user: User) => void;
}

export const TeamMemberList = ({
  members,
  leaderId,
  canRemove,
  canSetLeader,
  busyUserId,
  onRemove,
  onSetLeader,
}: TeamMemberListProps) => {
  if (members.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        No team members yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="divide-y divide-slate-100 md:hidden">
        {members.map((member) => {
          const isLeader = leaderId === member.id;
          const busy = busyUserId === member.id;

          return (
            <article key={member.id} className={`space-y-3 p-4 ${isLeader ? "bg-[#FAF7FF]" : ""}`}>
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#8B6FD0] text-xs font-semibold text-white">
                  {getInitials(member.firstName, member.lastName)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-800">
                    {member.firstName} {member.lastName}
                  </p>
                  {isLeader ? (
                    <p className="inline-flex items-center gap-1 text-xs text-[#6F58B7]">
                      <Crown className="h-3.5 w-3.5" /> Team Leader
                    </p>
                  ) : null}
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <RoleBadge role={member.role} />
                <UserStatusBadge active={member.active} />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {canSetLeader && !isLeader ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onSetLeader(member)}
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <UserRoundPlus className="h-3.5 w-3.5" />
                    Set Leader
                  </button>
                ) : null}

                {canRemove ? (
                  <button
                    type="button"
                    disabled={busy || isLeader}
                    onClick={() => onRemove(member)}
                    className="inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400"
                    title={isLeader ? "Change leader first" : "Remove member"}
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                    Remove
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((member) => {
              const isLeader = leaderId === member.id;
              const busy = busyUserId === member.id;

              return (
                <tr key={member.id} className={isLeader ? "bg-[#FAF7FF]" : "hover:bg-slate-50/80"}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#8B6FD0] text-xs font-semibold text-white">
                        {getInitials(member.firstName, member.lastName)}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">
                          {member.firstName} {member.lastName}
                        </p>
                        {isLeader ? (
                          <p className="inline-flex items-center gap-1 text-xs text-[#6F58B7]">
                            <Crown className="h-3.5 w-3.5" /> Team Leader
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="inline-flex items-center gap-1 text-slate-600">
                      <Mail className="h-3.5 w-3.5" />
                      {member.email}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={member.role} />
                  </td>
                  <td className="px-4 py-3">
                    <UserStatusBadge active={member.active} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      {canSetLeader && !isLeader ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onSetLeader(member)}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          <UserRoundPlus className="h-3.5 w-3.5" />
                          Set Leader
                        </button>
                      ) : null}

                      {canRemove ? (
                        <button
                          type="button"
                          disabled={busy || isLeader}
                          onClick={() => onRemove(member)}
                          className="inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400"
                          title={isLeader ? "Change leader first" : "Remove member"}
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
