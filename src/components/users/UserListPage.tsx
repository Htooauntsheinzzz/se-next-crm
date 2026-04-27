"use client";

import { useMemo, useState } from "react";
import { Plus, Send, X } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { UserFilters } from "@/components/users/UserFilters";
import { UserTable } from "@/components/users/UserTable";
import { UserDetailDrawer } from "@/components/users/UserDetailDrawer";
const UserEditActionModal = dynamic(() => import("@/components/users/UserEditActionModal").then(m => ({ default: m.UserEditActionModal })), { ssr: false });
const UserRoleActionModal = dynamic(() => import("@/components/users/UserRoleActionModal").then(m => ({ default: m.UserRoleActionModal })), { ssr: false });
const UserAssignTeamModal = dynamic(() => import("@/components/users/UserAssignTeamModal").then(m => ({ default: m.UserAssignTeamModal })), { ssr: false });
const UserStatusActionModal = dynamic(() => import("@/components/users/UserStatusActionModal").then(m => ({ default: m.UserStatusActionModal })), { ssr: false });
import { useUsers } from "@/hooks/useUsers";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { userService } from "@/services/userService";
import { teamService } from "@/services/teamService";
import { getApiMessage, roleToLabel } from "@/lib/utils";
import { session } from "@/lib/session";
import type { Role, User, UserFilters as UserFiltersType } from "@/types/user";

const PAGE_SIZE = 10;

export const UserListPage = () => {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<UserFiltersType>({ search: "" });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [roleUser, setRoleUser] = useState<User | null>(null);
  const [assignTeamUser, setAssignTeamUser] = useState<User | null>(null);
  const [statusUser, setStatusUser] = useState<User | null>(null);
  const [statusMode, setStatusMode] = useState<"activate" | "deactivate">("deactivate");

  const [savingEdit, setSavingEdit] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [savingTeam, setSavingTeam] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const { users, totalPages, totalElements, currentPage, loading, error, refetch } = useUsers(
    page,
    PAGE_SIZE,
  );
  const { isAdmin } = useRoleGuard();
  const { currentUser } = useCurrentUser();

  const filteredUsers = useMemo(() => {
    const search = filters.search?.trim().toLowerCase();

    return users.filter((user) => {
      if (filters.role && user.role !== filters.role) {
        return false;
      }

      if (typeof filters.active === "boolean" && user.active !== filters.active) {
        return false;
      }

      if (!search) {
        return true;
      }

      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return fullName.includes(search) || user.email.toLowerCase().includes(search);
    });
  }, [filters, users]);

  const closeOverlay = () => {
    setEditUser(null);
    setRoleUser(null);
    setAssignTeamUser(null);
    setStatusUser(null);
  };

  const onRefresh = async () => {
    await refetch();
    toast.success("Users refreshed");
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setInviteEmail("");
  };

  const onSendInviteEmail = () => {
    const email = inviteEmail.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const registerUrl = `${window.location.origin}/register`;
    const subject = "Register your CRM account";
    const body = encodeURIComponent(
      `Hello,\n\nPlease register your account using this link:\n${registerUrl}\n\nBest regards,`,
    );

    const gmailUrl =
      `https://mail.google.com/mail/?view=cm&fs=1` +
      `&to=${encodeURIComponent(email)}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${body}`;

    const popup = window.open(gmailUrl, "_blank", "noopener,noreferrer");
    if (!popup) {
      toast.error("Popup blocked. Please allow popups and try again.");
      return;
    }

    toast.success("Gmail compose opened with registration link");
    closeInviteModal();
  };

  const onSubmitEdit = async (values: { firstName: string; lastName: string }) => {
    if (!editUser) {
      return;
    }

    try {
      setSavingEdit(true);
      await userService.update(editUser.id, values);
      toast.success("Profile updated successfully");
      setEditUser(null);
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to update profile"));
    } finally {
      setSavingEdit(false);
    }
  };

  const onSubmitRole = async (role: Role) => {
    if (!roleUser) {
      return;
    }

    try {
      setSavingRole(true);
      await userService.changeRole(roleUser.id, { role });
      toast.success(`Role updated to ${roleToLabel(role)}`);
      setRoleUser(null);
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to update role"));
    } finally {
      setSavingRole(false);
    }
  };

  const onSubmitAssignTeam = async (teamId: string | null, teamName: string) => {
    if (!assignTeamUser) {
      return;
    }

    const oldTeamId = assignTeamUser.teamId;

    try {
      setSavingTeam(true);

      if (oldTeamId && (!teamId || teamId !== oldTeamId)) {
        await teamService.removeMember(oldTeamId, assignTeamUser.id);
      }

      if (teamId && teamId !== oldTeamId) {
        await teamService.assignMember(teamId, assignTeamUser.id);
      }

      if (!teamId) {
        toast.success("User removed from team");
      } else {
        toast.success(`User assigned to ${teamName}`);
      }

      setAssignTeamUser(null);
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to update team assignment"));
    } finally {
      setSavingTeam(false);
    }
  };

  const onConfirmStatus = async () => {
    if (!statusUser) {
      return;
    }

    if (statusMode === "deactivate" && currentUser?.id === statusUser.id) {
      toast.error("You cannot deactivate your own account");
      return;
    }

    try {
      setSavingStatus(true);

      if (statusMode === "deactivate") {
        await userService.deactivate(statusUser.id);
        toast.success("User deactivated");
      } else {
        await userService.activate(statusUser.id);
        toast.success("User activated");
      }

      setStatusUser(null);
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to update user status"));
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <>
      <div className="space-y-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[34px] font-semibold leading-tight text-slate-900">Users</h1>
            <p className="text-sm text-slate-500">Manage your team members and their permissions</p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 self-start rounded-lg bg-[#8B6FD0] px-4 text-sm font-semibold text-white transition hover:bg-[#7D62C4]"
            onClick={() => setShowInviteModal(true)}
          >
            <Plus className="h-4 w-4" />
            Invite User
          </button>
        </header>

        <UserFilters filters={filters} showInactiveFilter={isAdmin} onChange={setFilters} />

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            <button
              type="button"
              className="ml-3 font-semibold underline"
              onClick={() => void onRefresh()}
            >
              Retry
            </button>
            <button
              type="button"
              className="ml-3 font-semibold underline"
              onClick={() => {
                session.clearSession();
                window.location.href = "/login";
              }}
            >
              Sign in again
            </button>
          </div>
        ) : null}

        <UserTable
          users={filteredUsers}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={PAGE_SIZE}
          currentUserId={currentUser?.id ?? null}
          currentUserRole={currentUser?.role}
          onPageChange={setPage}
          onViewDetails={(user) => {
            closeOverlay();
            setDrawerUserId(user.id);
          }}
          onEditProfile={(user) => {
            setDrawerUserId(null);
            setRoleUser(null);
            setAssignTeamUser(null);
            setStatusUser(null);
            setEditUser(user);
          }}
          onChangeRole={(user) => {
            setDrawerUserId(null);
            setEditUser(null);
            setAssignTeamUser(null);
            setStatusUser(null);
            setRoleUser(user);
          }}
          onAssignTeam={(user) => {
            setDrawerUserId(null);
            setEditUser(null);
            setRoleUser(null);
            setStatusUser(null);
            setAssignTeamUser(user);
          }}
          onDeactivate={(user) => {
            setDrawerUserId(null);
            setEditUser(null);
            setRoleUser(null);
            setAssignTeamUser(null);
            setStatusMode("deactivate");
            setStatusUser(user);
          }}
          onActivate={(user) => {
            setDrawerUserId(null);
            setEditUser(null);
            setRoleUser(null);
            setAssignTeamUser(null);
            setStatusMode("activate");
            setStatusUser(user);
          }}
        />
      </div>

      <UserDetailDrawer
        open={Boolean(drawerUserId)}
        userId={drawerUserId}
        currentUserId={currentUser?.id ?? null}
        currentUserRole={currentUser?.role}
        onClose={() => setDrawerUserId(null)}
        onEditProfile={(user) => {
          setDrawerUserId(null);
          setEditUser(user);
        }}
        onChangeRole={(user) => {
          setDrawerUserId(null);
          setRoleUser(user);
        }}
        onAssignTeam={(user) => {
          setDrawerUserId(null);
          setAssignTeamUser(user);
        }}
        onDeactivate={(user) => {
          setDrawerUserId(null);
          setStatusMode("deactivate");
          setStatusUser(user);
        }}
        onActivate={(user) => {
          setDrawerUserId(null);
          setStatusMode("activate");
          setStatusUser(user);
        }}
      />

      <UserEditActionModal
        open={Boolean(editUser)}
        user={editUser}
        loading={savingEdit}
        onClose={() => setEditUser(null)}
        onSubmit={onSubmitEdit}
      />

      <UserRoleActionModal
        open={Boolean(roleUser)}
        user={roleUser}
        loading={savingRole}
        onClose={() => setRoleUser(null)}
        onSubmit={onSubmitRole}
      />

      <UserAssignTeamModal
        open={Boolean(assignTeamUser)}
        user={assignTeamUser}
        loading={savingTeam}
        onClose={() => setAssignTeamUser(null)}
        onSubmit={onSubmitAssignTeam}
      />

      <UserStatusActionModal
        open={Boolean(statusUser)}
        user={statusUser}
        mode={statusMode}
        loading={savingStatus}
        onClose={() => setStatusUser(null)}
        onConfirm={onConfirmStatus}
      />

      {showInviteModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={closeInviteModal}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Invite User</h3>
                <p className="mt-0.5 text-sm text-slate-500">Send a registration link by email</p>
              </div>
              <button
                type="button"
                onClick={closeInviteModal}
                className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 px-5 py-4">
              <label htmlFor="invite-email" className="text-sm font-medium text-slate-700">
                Recipient Email
              </label>
              <input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onSendInviteEmail();
                  }
                }}
                placeholder="name@company.com"
                className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#8B6FD0] focus:ring-2 focus:ring-[#8B6FD0]/20"
                autoFocus
              />
              <p className="text-xs text-slate-500">Link included: /register</p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={closeInviteModal}
                className="inline-flex h-10 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSendInviteEmail}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#8B6FD0] px-4 text-sm font-semibold text-white transition hover:bg-[#7D62C4]"
              >
                <Send className="h-4 w-4" />
                Send Invite
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
