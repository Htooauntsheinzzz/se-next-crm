"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { X } from "lucide-react";
import { ActivityTypeIcon } from "@/components/activities/ActivityTypeIcon";
import { activityTypeMeta } from "@/components/activities/activityConfig";
import { mergeClassNames, roleToLabel } from "@/lib/utils";
import type { Activity, ActivityCreateRequest, ActivityType, ActivityUpdateRequest } from "@/types/activity";
import type { Lead } from "@/types/lead";
import type { Opportunity } from "@/types/opportunity";
import type { User } from "@/types/user";

const schema = z
  .object({
    type: z.enum(["CALL", "EMAIL", "MEETING", "TODO", "DOCUMENT"], {
      message: "Activity type is required",
    }),
    title: z.string().min(1, "Title is required").max(255),
    note: z.string().optional().or(z.literal("")),
    dueDate: z.string().min(1, "Due date is required"),
    dueTime: z.string().min(1, "Due time is required"),
    assignedTo: z.string().optional().or(z.literal("")),
    recordType: z.enum(["opportunity", "lead"]),
    opportunityId: z.string().optional().or(z.literal("")),
    leadId: z.string().optional().or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    if (value.recordType === "opportunity" && !value.opportunityId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select an opportunity",
        path: ["opportunityId"],
      });
    }

    if (value.recordType === "lead" && !value.leadId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a lead",
        path: ["leadId"],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

interface ActivityFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  loading?: boolean;
  users: User[];
  opportunities: Opportunity[];
  leads: Lead[];
  initialActivity?: Activity | null;
  initialRecordType?: "opportunity" | "lead";
  initialOpportunityId?: number;
  initialLeadId?: number;
  onClose: () => void;
  onSubmit: (payload: ActivityCreateRequest | ActivityUpdateRequest) => Promise<void>;
}

const toDateTimeParts = (value: string | null | undefined) => {
  if (!value) {
    return {
      dueDate: "",
      dueTime: "",
    };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return {
      dueDate: "",
      dueTime: "",
    };
  }

  return {
    dueDate: format(parsed, "yyyy-MM-dd"),
    dueTime: format(parsed, "HH:mm"),
  };
};

const toNumber = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const ActivityFormModal = ({
  open,
  mode,
  loading = false,
  users,
  opportunities,
  leads,
  initialActivity,
  initialRecordType,
  initialOpportunityId,
  initialLeadId,
  onClose,
  onSubmit,
}: ActivityFormModalProps) => {
  const initialParts = toDateTimeParts(initialActivity?.dueDate);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: initialActivity?.type ?? "CALL",
      title: initialActivity?.title ?? "",
      note: initialActivity?.note ?? "",
      dueDate: initialParts.dueDate,
      dueTime: initialParts.dueTime,
      assignedTo: initialActivity?.assignedTo ? String(initialActivity.assignedTo) : "",
      recordType:
        initialRecordType ??
        (initialActivity?.leadId ? "lead" : "opportunity"),
      opportunityId: initialActivity?.opportunityId
        ? String(initialActivity.opportunityId)
        : initialOpportunityId
          ? String(initialOpportunityId)
          : "",
      leadId: initialActivity?.leadId
        ? String(initialActivity.leadId)
        : initialLeadId
          ? String(initialLeadId)
          : "",
    },
  });

  const recordType = watch("recordType");
  const selectedType = watch("type");

  useEffect(() => {
    if (!open) {
      return;
    }

    const parts = toDateTimeParts(initialActivity?.dueDate);

    reset({
      type: initialActivity?.type ?? "CALL",
      title: initialActivity?.title ?? "",
      note: initialActivity?.note ?? "",
      dueDate: parts.dueDate,
      dueTime: parts.dueTime,
      assignedTo: initialActivity?.assignedTo ? String(initialActivity.assignedTo) : "",
      recordType:
        initialRecordType ??
        (initialActivity?.leadId ? "lead" : "opportunity"),
      opportunityId: initialActivity?.opportunityId
        ? String(initialActivity.opportunityId)
        : initialOpportunityId
          ? String(initialOpportunityId)
          : "",
      leadId: initialActivity?.leadId
        ? String(initialActivity.leadId)
        : initialLeadId
          ? String(initialLeadId)
          : "",
    });
  }, [
    initialActivity,
    initialLeadId,
    initialOpportunityId,
    initialRecordType,
    open,
    reset,
  ]);

  useEffect(() => {
    if (recordType === "opportunity") {
      setValue("leadId", "", { shouldValidate: true });
      return;
    }

    setValue("opportunityId", "", { shouldValidate: true });
  }, [recordType, setValue]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const submit = async (values: FormValues) => {
    const payload: ActivityCreateRequest | ActivityUpdateRequest = {
      type: values.type,
      title: values.title.trim(),
      note: values.note?.trim() || undefined,
      dueDate: `${values.dueDate}T${values.dueTime}:00`,
      assignedTo: toNumber(values.assignedTo),
      opportunityId: values.recordType === "opportunity" ? toNumber(values.opportunityId) : undefined,
      leadId: values.recordType === "lead" ? toNumber(values.leadId) : undefined,
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="app-shell-font max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {mode === "create" ? "Schedule Activity" : "Edit Activity"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {mode === "create"
                ? "Create a new activity to track your follow-ups and tasks."
                : "Update this activity details."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="max-h-[75vh] overflow-y-auto p-5">
          <section>
            <p className="mb-2 text-sm font-semibold text-slate-700">Activity Type *</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {(Object.keys(activityTypeMeta) as ActivityType[]).map((type) => {
                const active = selectedType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setValue("type", type, { shouldValidate: true })}
                    className={mergeClassNames(
                      "rounded-lg border-2 px-2 py-3 text-center transition",
                      active
                        ? "border-slate-400 bg-slate-50"
                        : "border-slate-200 bg-white hover:bg-slate-50",
                    )}
                  >
                    <span className="mx-auto block w-fit">
                      <ActivityTypeIcon type={type} className="h-8 w-8" />
                    </span>
                    <span className="mt-1 block text-xs font-medium text-slate-700">
                      {activityTypeMeta[type].label}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.type ? <p className="mt-1 text-xs text-red-500">{errors.type.message}</p> : null}
          </section>

          <section className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Title *</label>
              <input
                {...register("title")}
                type="text"
                placeholder="Follow-up call with customer"
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] transition focus:ring-2"
              />
              {errors.title ? <p className="mt-1 text-xs text-red-500">{errors.title.message}</p> : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Note</label>
              <textarea
                {...register("note")}
                rows={3}
                placeholder="Add any additional details about this activity..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none ring-[#D9CFF5] transition focus:ring-2"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Due Date *</label>
                <input
                  {...register("dueDate")}
                  type="date"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700"
                />
                {errors.dueDate ? <p className="mt-1 text-xs text-red-500">{errors.dueDate.message}</p> : null}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Due Time *</label>
                <input
                  {...register("dueTime")}
                  type="time"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700"
                />
                {errors.dueTime ? <p className="mt-1 text-xs text-red-500">{errors.dueTime.message}</p> : null}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Assign To</label>
              <select
                {...register("assignedTo")}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700"
              >
                <option value="">Select user</option>
                {users
                  .filter((user) => user.active)
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({roleToLabel(user.role)})
                    </option>
                  ))}
              </select>
            </div>
          </section>

          <section className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Link to Record (Optional)
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Record Type</label>
                <select
                  {...register("recordType")}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700"
                >
                  <option value="opportunity">Opportunity</option>
                  <option value="lead">Lead</option>
                </select>
              </div>

              {recordType === "opportunity" ? (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Opportunity</label>
                  <select
                    {...register("opportunityId")}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700"
                  >
                    <option value="">Select opportunity</option>
                    {opportunities.map((opportunity) => (
                      <option key={opportunity.id} value={opportunity.id}>
                        {opportunity.name}
                      </option>
                    ))}
                  </select>
                  {errors.opportunityId ? (
                    <p className="mt-1 text-xs text-red-500">{errors.opportunityId.message}</p>
                  ) : null}
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Lead</label>
                  <select
                    {...register("leadId")}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700"
                  >
                    <option value="">Select lead</option>
                    {leads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.contactName}
                      </option>
                    ))}
                  </select>
                  {errors.leadId ? <p className="mt-1 text-xs text-red-500">{errors.leadId.message}</p> : null}
                </div>
              )}
            </div>
          </section>

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#8B6FD0] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7A58BE] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Saving..." : mode === "create" ? "Schedule Activity" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
