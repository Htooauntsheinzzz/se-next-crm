"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Shield,
  UserCheck,
  UserX,
  UsersRound,
  X,
} from "lucide-react";
import { userService } from "@/services/userService";
import { formatDateLabel, getApiMessage, getInitials, roleToLabel } from "@/lib/utils";
import { RoleBadge } from "@/components/users/RoleBadge";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import type { Role, User } from "@/types/user";

interface UserDetailDrawerProps {
  open: boolean;
  userId: string | null;
  currentUserId: string | null;
  currentUserRole?: Role;
  onClose: () => void;
  onEditProfile: (user: User) => void;
  onChangeRole: (user: User) => void;
  onAssignTeam: (user: User) => void;
  onDeactivate: (user: User) => void;
  onActivate: (user: User) => void;
}

export const UserDetailDrawer = ({
  open,
  userId,
  currentUserId,
  currentUserRole,
  onClose,
  onEditProfile,
  onChangeRole,
  onAssignTeam,
  onDeactivate,
  onActivate,
}: UserDetailDrawerProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

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
    const loadUser = async () => {
      if (!open || !userId) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await userService.getById(userId);
        setUser(response);
      } catch (err) {
        setError(getApiMessage(err, "Failed to load user details"));
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
  }, [open, userId]);

  const canEdit = useMemo(() => {
    if (!user) {
      return false;
    }

    return currentUserRole === "ADMIN" || currentUserId === user.id;
  }, [currentUserId, currentUserRole, user]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" onClick={onClose}>
      <aside
        className="ml-auto h-full w-full max-w-[384px] overflow-y-auto bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-900">User Details</h2>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </header>

        {loading ? (
          <div className="space-y-3 p-4">
            <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-28 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ) : error ? (
          <div className="p-4">
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          </div>
        ) : user ? (
          <div className="space-y-5 p-4">
            <section className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#8B6FD0] text-xs font-semibold text-white">
                  {getInitials(user.firstName, user.lastName)}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <RoleBadge role={user.role} />
                    <UserStatusBadge active={user.active} />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 p-4 text-sm text-slate-600">
              <div>
                <span className="font-medium text-slate-800">
                  {user.teams && user.teams.length > 1 ? "Teams:" : "Team:"}
                </span>{" "}
                {user.teams && user.teams.length > 0 ? (
                  <span className="inline-flex flex-wrap gap-1 align-middle">
                    {user.teams.map((t) => (
                      <span
                        key={t.id}
                        className={
                          t.primary
                            ? "inline-flex items-center rounded-full bg-[#EFEAFB] px-2 py-0.5 text-xs font-medium text-[#5E4BAA]"
                            : "inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                        }
                      >
                        {t.name}
                        {t.primary ? " ★" : ""}
                      </span>
                    ))}
                  </span>
                ) : (
                  user.teamName ?? "-"
                )}
              </div>
              <p className="mt-2">
                <span className="font-medium text-slate-800">Role:</span> {roleToLabel(user.role)}
              </p>
              <p className="mt-2">
                <span className="font-medium text-slate-800">Joined:</span> {formatDateLabel(user.createdAt)}
              </p>
            </section>

            <section className="space-y-2">
              <button
                type="button"
                onClick={() => onClose()}
                className="flex w-full items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Eye className="h-4 w-4" />
                Viewing {user.firstName}
              </button>

              {canEdit ? (
                <button
                  type="button"
                  onClick={() => onEditProfile(user)}
                  className="flex w-full items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </button>
              ) : null}

              {currentUserRole === "ADMIN" ? (
                <button
                  type="button"
                  onClick={() => onChangeRole(user)}
                  className="flex w-full items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Shield className="h-4 w-4" />
                  Change Role
                </button>
              ) : null}

              {(currentUserRole === "ADMIN" || currentUserRole === "SALES_MANAGER") ? (
                <button
                  type="button"
                  onClick={() => onAssignTeam(user)}
                  className="flex w-full items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <UsersRound className="h-4 w-4" />
                  Assign Team
                </button>
              ) : null}

              {currentUserRole === "ADMIN" && user.active && currentUserId !== user.id ? (
                <button
                  type="button"
                  onClick={() => onDeactivate(user)}
                  className="flex w-full items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <UserX className="h-4 w-4" />
                  Deactivate
                </button>
              ) : null}

              {currentUserRole === "ADMIN" && !user.active ? (
                <button
                  type="button"
                  onClick={() => onActivate(user)}
                  className="flex w-full items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <UserCheck className="h-4 w-4" />
                  Activate
                </button>
              ) : null}
            </section>
          </div>
        ) : null}
      </aside>
    </div>
  );
};
