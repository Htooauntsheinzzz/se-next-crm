"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Shield, UserCog } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { RoleBadge } from "@/components/users/RoleBadge";
const RoleChangeModal = dynamic(() => import("@/components/users/RoleChangeModal").then(m => ({ default: m.RoleChangeModal })), { ssr: false });
import { UserEditForm } from "@/components/users/UserEditForm";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { useUser } from "@/hooks/useUser";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { userService } from "@/services/userService";
import { formatDateLabel, getApiMessage, getInitials } from "@/lib/utils";
import type { Role } from "@/types/user";

interface UserDetailPageProps {
  userId: string;
}

export const UserDetailPage = ({ userId }: UserDetailPageProps) => {
  const router = useRouter();
  const { user, loading, error, refetch } = useUser(userId);
  const { currentUser } = useCurrentUser();
  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [nextRole, setNextRole] = useState<Role>("SALES_REP");
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  const isAdmin = currentUser?.role === "ADMIN";
  const canEdit = Boolean(isAdmin || currentUser?.id === user?.id);

  const fullName = useMemo(() => {
    if (!user) {
      return "";
    }

    return `${user.firstName} ${user.lastName}`;
  }, [user]);

  const onUpdateProfile = async (values: { firstName: string; lastName: string }) => {
    if (!user) {
      return;
    }

    try {
      setSavingProfile(true);
      await userService.update(user.id, values);
      toast.success("Profile updated successfully");
      setEditing(false);
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to update profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const onConfirmRoleChange = async () => {
    if (!user) {
      return;
    }

    try {
      setUpdatingRole(true);
      await userService.changeRole(user.id, { role: nextRole });
      toast.success(`Role updated to ${nextRole}`);
      setRoleModalOpen(false);
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to update role"));
    } finally {
      setUpdatingRole(false);
    }
  };

  const onToggleActivation = async () => {
    if (!user) {
      return;
    }

    try {
      setUpdatingStatus(true);
      if (user.active) {
        await userService.deactivate(user.id);
        toast.success("User deactivated");
      } else {
        await userService.activate(user.id);
        toast.success("User activated");
      }
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to update user status"));
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 rounded bg-slate-100" />
          <div className="h-24 rounded bg-slate-100" />
          <div className="h-36 rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error ?? "User not found"}
        <button
          type="button"
          className="ml-2 font-semibold underline"
          onClick={() => router.push("/users")}
        >
          Back to users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/users" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#8B6FD0] text-lg font-semibold text-white">
              {getInitials(user.firstName, user.lastName)}
            </span>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{fullName}</h1>
              <p className="text-sm text-slate-500">{user.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <RoleBadge role={user.role} />
                <UserStatusBadge active={user.active} />
                <span className="text-xs text-slate-500">Member since {formatDateLabel(user.createdAt)}</span>
              </div>
            </div>
          </div>

          {canEdit ? (
            <button
              type="button"
              onClick={() => setEditing((prev) => !prev)}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <UserCog className="h-4 w-4" />
              {editing ? "Close Edit" : "Edit Profile"}
            </button>
          ) : null}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <p>
            <span className="font-medium text-slate-800">First Name:</span> {user.firstName}
          </p>
          <p>
            <span className="font-medium text-slate-800">Last Name:</span> {user.lastName}
          </p>
          <p>
            <span className="font-medium text-slate-800">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-medium text-slate-800">Team:</span> {user.teamName ?? "-"}
          </p>
        </div>

        {canEdit && editing ? (
          <div className="mt-5 border-t border-slate-200 pt-5">
            <UserEditForm
              initialValues={{ firstName: user.firstName, lastName: user.lastName }}
              loading={savingProfile}
              onCancel={() => setEditing(false)}
              onSubmit={onUpdateProfile}
            />
          </div>
        ) : null}
      </section>

      {isAdmin ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2 text-slate-900">
            <Shield className="h-4 w-4" />
            <h2 className="text-lg font-semibold">Admin Actions</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-800">Change Role</p>
              <div className="mt-3 flex items-center gap-2">
                <select
                  value={nextRole}
                  onChange={(event) => setNextRole(event.target.value as Role)}
                  className="h-10 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SALES_MANAGER">Sales Manager</option>
                  <option value="SALES_REP">Sales Rep</option>
                </select>
                <button
                  type="button"
                  disabled={nextRole === user.role}
                  onClick={() => setRoleModalOpen(true)}
                  className="h-10 rounded-md bg-[#8B6FD0] px-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Update Role
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-800">Account Status</p>
              <p className="mt-1 text-xs text-slate-500">
                {user.active ? "User is currently active" : "User is currently inactive"}
              </p>
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => void onToggleActivation()}
                className={`mt-3 h-10 rounded-md px-3 text-sm font-semibold text-white ${
                  user.active ? "bg-red-500" : "bg-green-600"
                }`}
              >
                {updatingStatus
                  ? "Updating..."
                  : user.active
                    ? "Deactivate User"
                    : "Activate User"}
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <RoleChangeModal
        open={roleModalOpen}
        userName={fullName}
        currentRole={user.role}
        nextRole={nextRole}
        loading={updatingRole}
        onClose={() => setRoleModalOpen(false)}
        onConfirm={onConfirmRoleChange}
      />
    </div>
  );
};
