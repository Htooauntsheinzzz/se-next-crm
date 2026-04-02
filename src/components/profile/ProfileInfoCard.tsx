import { CalendarDays, Mail, Shield, UsersRound } from "lucide-react";
import type { User } from "@/types/user";
import { formatDateLabel, getInitials, roleToLabel } from "@/lib/utils";
import { RoleBadge } from "@/components/users/RoleBadge";

interface ProfileInfoCardProps {
  user: User;
}

export const ProfileInfoCard = ({ user }: ProfileInfoCardProps) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-semibold text-slate-900">Profile Information</h2>
      <p className="mt-1 text-sm text-slate-500">Your account details and role information</p>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#8B6FD0] text-lg font-semibold text-white">
          {getInitials(user.firstName, user.lastName)}
        </span>

        <div className="grid flex-1 grid-cols-1 gap-4 text-sm text-slate-700 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">First Name</p>
            <p className="mt-1 font-medium text-slate-900">{user.firstName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Last Name</p>
            <p className="mt-1 font-medium text-slate-900">{user.lastName}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Mail className="h-3.5 w-3.5" /> Email
            </p>
            <p className="mt-1 font-medium text-slate-900">{user.email}</p>
          </div>
          <div>
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Shield className="h-3.5 w-3.5" /> Role
            </p>
            <div className="mt-1 flex items-center gap-2">
              <RoleBadge role={user.role} />
              <span className="text-slate-500">{roleToLabel(user.role)}</span>
            </div>
          </div>
          <div>
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <UsersRound className="h-3.5 w-3.5" /> Team
            </p>
            <p className="mt-1 font-medium text-slate-900">{user.teamName ?? "-"}</p>
          </div>
          <div>
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <CalendarDays className="h-3.5 w-3.5" /> Member Since
            </p>
            <p className="mt-1 font-medium text-slate-900">{formatDateLabel(user.createdAt)}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
