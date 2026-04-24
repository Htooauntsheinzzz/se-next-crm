import { useEffect, useRef, useState } from "react";
import {
  Eye,
  MoreVertical,
  Pencil,
  Shield,
  UserCheck,
  Users,
  UsersRound,
  UserX,
} from "lucide-react";
import { formatDateLabel, getInitials } from "@/lib/utils";
import { RoleBadge } from "@/components/users/RoleBadge";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import type { Role, User } from "@/types/user";

interface UserTableProps {
  users: User[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  currentUserId: string | null;
  currentUserRole?: Role;
  onPageChange: (page: number) => void;
  onViewDetails: (user: User) => void;
  onEditProfile: (user: User) => void;
  onChangeRole: (user: User) => void;
  onAssignTeam: (user: User) => void;
  onDeactivate: (user: User) => void;
  onActivate: (user: User) => void;
}

export const UserTable = ({
  users,
  loading,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  currentUserId,
  currentUserRole,
  onPageChange,
  onViewDetails,
  onEditProfile,
  onChangeRole,
  onAssignTeam,
  onDeactivate,
  onActivate,
}: UserTableProps) => {
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!openMenuUserId) {
        return;
      }

      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpenMenuUserId(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenuUserId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openMenuUserId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={`row-${index}`} className="h-12 rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <Users className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-600">No users found</p>
      </div>
    );
  }

  const start = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const end = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <>
      <div className="relative hidden overflow-x-hidden overflow-y-visible rounded-xl border border-slate-200 bg-white md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {users.map((user, index) => {
              const isNearBottom = index >= users.length - 2;

              return (
                <tr key={user.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#8B6FD0] text-xs font-semibold text-white">
                        {getInitials(user.firstName, user.lastName)}
                      </span>
                      <span className="font-medium text-slate-800">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {user.teams && user.teams.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.teams.map((t) => (
                          <span
                            key={t.id}
                            className={
                              t.primary
                                ? "inline-flex items-center rounded-full bg-[#EFEAFB] px-2 py-0.5 text-xs font-medium text-[#5E4BAA]"
                                : "inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                            }
                            title={t.primary ? "Primary team" : "Additional team"}
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      user.teamName ?? "-"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <UserStatusBadge active={user.active} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDateLabel(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <div className="relative" ref={openMenuUserId === user.id ? menuRef : null}>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuUserId((previous) =>
                              previous === user.id ? null : user.id,
                            )
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {openMenuUserId === user.id ? (
                          <div
                            className={`absolute right-0 z-30 min-w-[220px] rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95 ${
                              isNearBottom ? "bottom-9" : "top-9"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuUserId(null);
                                onViewDetails(user);
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </button>

                            {currentUserRole === "ADMIN" || currentUserId === user.id ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuUserId(null);
                                  onEditProfile(user);
                                }}
                                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                              >
                                <Pencil className="h-4 w-4" />
                                Edit Profile
                              </button>
                            ) : null}

                            {currentUserRole === "ADMIN" ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuUserId(null);
                                  onChangeRole(user);
                                }}
                                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                              >
                                <Shield className="h-4 w-4" />
                                Change Role
                              </button>
                            ) : null}

                            {currentUserRole === "ADMIN" || currentUserRole === "SALES_MANAGER" ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuUserId(null);
                                  onAssignTeam(user);
                                }}
                                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                              >
                                <UsersRound className="h-4 w-4" />
                                Assign Team
                              </button>
                            ) : null}

                            {currentUserRole === "ADMIN" &&
                            user.active &&
                            currentUserId !== user.id ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuUserId(null);
                                  onDeactivate(user);
                                }}
                                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                              >
                                <UserX className="h-4 w-4" />
                                Deactivate
                              </button>
                            ) : null}

                            {currentUserRole === "ADMIN" && !user.active ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuUserId(null);
                                  onActivate(user);
                                }}
                                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                              >
                                <UserCheck className="h-4 w-4" />
                                Activate
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
          <p>
            Showing {start}-{end} of {totalElements} users
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 0}
              onClick={() => onPageChange(Math.max(0, currentPage - 1))}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-[#8B6FD0] px-2 text-xs font-semibold text-white">
              {currentPage + 1}
            </span>
            <button
              type="button"
              disabled={currentPage >= Math.max(0, totalPages - 1)}
              onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {users.map((user) => (
          <div key={user.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#8B6FD0] text-xs font-semibold text-white">
                  {getInitials(user.firstName, user.lastName)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onViewDetails(user)}
                className="text-xs font-semibold text-[#8B6FD0]"
              >
                View
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <RoleBadge role={user.role} />
              <UserStatusBadge active={user.active} />
              <span className="text-xs text-slate-500">{formatDateLabel(user.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
