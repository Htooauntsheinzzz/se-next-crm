"use client";

import { toast } from "sonner";
import { useState } from "react";
import { ProfileInfoCard } from "@/components/profile/ProfileInfoCard";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { userService } from "@/services/userService";
import { getApiMessage } from "@/lib/utils";

export const ProfilePage = () => {
  const { currentUser, loading, error, refetch } = useCurrentUser();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error ?? "Unable to load profile"}
      </div>
    );
  }

  const onUpdateProfile = async (values: { firstName: string; lastName: string }) => {
    try {
      setSavingProfile(true);
      await userService.update(currentUser.id, values);
      toast.success("Profile updated successfully");
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to update profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const onUpdatePassword = async (values: { currentPassword: string; newPassword: string }) => {
    try {
      setSavingPassword(true);
      await userService.changePassword(currentUser.id, values);
      toast.success("Password changed successfully");
    } catch (err) {
      const message = getApiMessage(err, "Failed to update password");
      if (message.toLowerCase().includes("current") || message.includes("401")) {
        toast.error("Current password is incorrect");
      } else {
        toast.error(message);
      }
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[34px] font-semibold leading-tight text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500">Manage your personal information and settings</p>
      </header>

      <ProfileInfoCard user={currentUser} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">Edit Profile</h2>
          <p className="mt-1 text-sm text-slate-500">Update your first and last name</p>
          <div className="mt-4">
            <EditProfileForm
              initialValues={{
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
              }}
              loading={savingProfile}
              onSubmit={onUpdateProfile}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">Change Password</h2>
          <p className="mt-1 text-sm text-slate-500">Update your password to keep your account secure</p>
          <div className="mt-4">
            <ChangePasswordForm loading={savingPassword} onSubmit={onUpdatePassword} />
          </div>
        </section>
      </div>
    </div>
  );
};
