"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teamSchema } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { TeamCreateRequest, TeamUpdateRequest } from "@/types/team";
import type { User } from "@/types/user";

interface TeamFormValues {
  name: string;
  description?: string;
  targetRevenue?: number;
  leaderId?: string;
}

interface TeamFormProps {
  mode: "create" | "edit";
  initialValues?: TeamFormValues;
  users: User[];
  loading?: boolean;
  onCancel?: () => void;
  onSubmit: (data: TeamCreateRequest | TeamUpdateRequest) => Promise<void>;
}

export const TeamForm = ({
  mode,
  initialValues,
  users,
  loading = false,
  onCancel,
  onSubmit,
}: TeamFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      targetRevenue: initialValues?.targetRevenue ?? 0,
      leaderId: initialValues?.leaderId ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      targetRevenue: initialValues?.targetRevenue ?? 0,
      leaderId: initialValues?.leaderId ?? "",
    });
  }, [initialValues, reset]);

  const submit = async (values: TeamFormValues) => {
    await onSubmit({
      name: values.name,
      description: values.description?.trim() || undefined,
      leaderId: values.leaderId || undefined,
      targetRevenue: values.targetRevenue ?? 0,
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit((values) => submit(values))}>
      <Input
        id={`${mode}-team-name`}
        label="Team Name"
        placeholder="Enter team name"
        error={errors.name?.message}
        {...register("name")}
      />

      <div className="space-y-1.5">
        <label htmlFor={`${mode}-description`} className="text-sm font-semibold text-slate-700">
          Description
        </label>
        <textarea
          id={`${mode}-description`}
          rows={3}
          placeholder="Brief description of the team's focus"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
          {...register("description")}
        />
        {errors.description ? (
          <p className="text-xs text-red-600">{errors.description.message}</p>
        ) : null}
      </div>

      <Input
        id={`${mode}-target`}
        label="Target Revenue"
        type="number"
        min={0}
        step="0.01"
        placeholder="500000"
        error={errors.targetRevenue?.message as string | undefined}
        {...register("targetRevenue", {
          setValueAs: (value) =>
            value === "" || value === null || typeof value === "undefined"
              ? undefined
              : Number(value),
        })}
      />

      <div className="space-y-1.5">
        <label htmlFor={`${mode}-leader`} className="text-sm font-semibold text-slate-700">
          Team Leader
        </label>
        <select
          id={`${mode}-leader`}
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
          {...register("leaderId")}
        >
          <option value="">Select a team leader (optional)</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName} ({user.role})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" className="w-auto px-4" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" loading={loading} className="w-auto px-4">
          {mode === "create" ? "Create Team" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};
