"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TeamForm } from "@/components/teams/TeamForm";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useUsers } from "@/hooks/useUsers";
import { teamService } from "@/services/teamService";
import { getApiMessage } from "@/lib/utils";

export const TeamCreatePage = () => {
  const router = useRouter();
  const { isAdmin, loading: roleLoading } = useRoleGuard();
  const { users, loading: usersLoading } = useUsers(0, 500);
  const [saving, setSaving] = useState(false);

  const onCreateTeam = async (values: {
    name?: string;
    description?: string;
    targetRevenue?: number;
    leaderId?: string;
  }) => {
    try {
      setSaving(true);
      const created = await teamService.create({
        name: values.name ?? "",
        description: values.description,
        targetRevenue: values.targetRevenue,
        leaderId: values.leaderId,
      });
      toast.success("Team created successfully");
      router.push(`/teams/${created.id}`);
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to create team"));
    } finally {
      setSaving(false);
    }
  };

  if (roleLoading || usersLoading) {
    return <div className="h-60 animate-pulse rounded-xl bg-slate-100" />;
  }

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        You don{"'"}t have permission to create a team.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link href="/teams" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
        <ArrowLeft className="h-4 w-4" />
        Back to Teams
      </Link>

      <section className="mx-auto w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-3xl font-semibold text-slate-900">Create New Team</h1>
        <p className="mt-1 text-sm text-slate-500">Set up a new sales team with target revenue and leader</p>

        <div className="mt-5">
          <TeamForm mode="create" users={users} loading={saving} onSubmit={onCreateTeam} />
        </div>
      </section>
    </div>
  );
};
