"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, X } from "lucide-react";
import { contactService } from "@/services/contactService";
import { formatCurrency } from "@/components/opportunities/opportunityConfig";
import { PriorityStars } from "@/components/opportunities/PriorityStars";
import type {
  Opportunity,
  OpportunityCreateRequest,
  OpportunityUpdateRequest,
} from "@/types/opportunity";
import type { PipelineStageDto } from "@/types/pipeline";
import type { SalesTeam } from "@/types/team";
import type { User } from "@/types/user";
import type { Contact, TagDto } from "@/types/contact";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  expectedRevenue: z.coerce.number().min(0, "Must be positive"),
  probability: z.coerce.number().min(0).max(100),
  priority: z.coerce.number().min(1).max(3),
  stageId: z.coerce
    .number({ message: "Stage is required" })
    .refine((value) => Number.isFinite(value) && value >= 0, "Stage is required"),
  salespersonId: z.string().optional().or(z.literal("")),
  teamId: z.string().optional().or(z.literal("")),
  contactId: z.string().optional().or(z.literal("")),
  deadline: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  tagIds: z.array(z.number()).optional(),
});

type FormValues = z.infer<typeof schema>;

interface OpportunityFormModalProps {
  open: boolean;
  loading?: boolean;
  mode: "create" | "edit";
  stages: PipelineStageDto[];
  users: User[];
  teams: SalesTeam[];
  tags: TagDto[];
  initialOpportunity?: Opportunity | null;
  forcedStageId?: number;
  onClose: () => void;
  onSubmit: (payload: OpportunityCreateRequest | OpportunityUpdateRequest) => Promise<void>;
}

const toNumberOrUndefined = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const OpportunityFormModal = ({
  open,
  loading = false,
  mode,
  stages,
  users,
  teams,
  tags,
  initialOpportunity,
  forcedStageId,
  onClose,
  onSubmit,
}: OpportunityFormModalProps) => {
  const [contactQuery, setContactQuery] = useState("");
  const [contactResults, setContactResults] = useState<Contact[]>([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const availableStages = useMemo(
    () => stages.filter((stage) => !stage.isWon && !stage.isLost),
    [stages],
  );

  const defaultStage = useMemo(() => {
    if (forcedStageId) {
      return forcedStageId;
    }
    if (initialOpportunity?.stageId) {
      return initialOpportunity.stageId;
    }
    return availableStages[0]?.id ?? 0;
  }, [availableStages, forcedStageId, initialOpportunity?.stageId]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      name: initialOpportunity?.name ?? "",
      expectedRevenue: initialOpportunity?.expectedRevenue ?? 0,
      probability: initialOpportunity?.probability ?? 10,
      priority: initialOpportunity?.priority ?? 1,
      stageId: defaultStage,
      salespersonId: initialOpportunity?.salespersonId
        ? String(initialOpportunity.salespersonId)
        : "",
      teamId: initialOpportunity?.teamId ? String(initialOpportunity.teamId) : "",
      contactId: initialOpportunity?.contactId ? String(initialOpportunity.contactId) : "",
      deadline: initialOpportunity?.deadline ?? "",
      notes: initialOpportunity?.notes ?? "",
      tagIds: initialOpportunity?.tags?.map((tag) => tag.id) ?? [],
    },
  });

  const revenue = watch("expectedRevenue") ?? 0;
  const probability = watch("probability") ?? 0;
  const priority = watch("priority") ?? 1;
  const selectedTags = watch("tagIds") ?? [];
  const stageIdValue = watch("stageId");

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      name: initialOpportunity?.name ?? "",
      expectedRevenue: initialOpportunity?.expectedRevenue ?? 0,
      probability: initialOpportunity?.probability ?? 10,
      priority: initialOpportunity?.priority ?? 1,
      stageId: defaultStage,
      salespersonId: initialOpportunity?.salespersonId
        ? String(initialOpportunity.salespersonId)
        : "",
      teamId: initialOpportunity?.teamId ? String(initialOpportunity.teamId) : "",
      contactId: initialOpportunity?.contactId ? String(initialOpportunity.contactId) : "",
      deadline: initialOpportunity?.deadline ?? "",
      notes: initialOpportunity?.notes ?? "",
      tagIds: initialOpportunity?.tags?.map((tag) => tag.id) ?? [],
    });
    setContactQuery(initialOpportunity?.contactName ?? "");
    setContactResults([]);
    setContactError(null);
    setContactLoading(false);
  }, [defaultStage, initialOpportunity, open, reset]);

  useEffect(() => {
    if (!open || availableStages.length === 0) {
      return;
    }

    const currentStageId = Number(stageIdValue);
    const hasValidStage = availableStages.some((stage) => stage.id === currentStageId);

    if (hasValidStage) {
      return;
    }

    setValue("stageId", defaultStage, { shouldDirty: true, shouldValidate: true });
  }, [availableStages, defaultStage, open, setValue, stageIdValue]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const query = contactQuery.trim();
    if (query.length < 2) {
      setContactResults([]);
      setContactError(null);
      setContactLoading(false);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      try {
        setContactLoading(true);
        setContactError(null);
        const data = await contactService.search(query);
        if (cancelled) {
          return;
        }
        setContactResults((data ?? []).slice(0, 8));
      } catch {
        if (cancelled) {
          return;
        }
        setContactError("Failed to search contacts");
      } finally {
        if (cancelled === false) {
          setContactLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [contactQuery, open]);

  if (!open) {
    return null;
  }

  const weightedRevenue = (Number(revenue) * Number(probability || 0)) / 100;

  const toggleTag = (id: number) => {
    const set = new Set(selectedTags);
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    setValue("tagIds", Array.from(set), { shouldDirty: true });
  };

  const submit = async (values: FormValues) => {
    const payload: OpportunityCreateRequest | OpportunityUpdateRequest = {
      name: values.name.trim(),
      expectedRevenue: Number(values.expectedRevenue || 0),
      probability: Number(values.probability || 0),
      priority: Number(values.priority || 1),
      stageId: Number(values.stageId),
      salespersonId: toNumberOrUndefined(values.salespersonId),
      teamId: toNumberOrUndefined(values.teamId),
      contactId: toNumberOrUndefined(values.contactId),
      deadline: values.deadline || undefined,
      notes: values.notes || undefined,
      tagIds: values.tagIds ?? [],
    };

    await onSubmit(payload);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="app-shell-font max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {mode === "create" ? "Create New Opportunity" : "Edit Opportunity"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {mode === "create"
                ? "Fill in the information below to create a new opportunity."
                : "Update the opportunity information below."}
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
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Basic Information
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Opportunity Name *
                </label>
                <input
                  {...register("name")}
                  type="text"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] transition focus:ring-2"
                />
                {errors.name ? (
                  <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Expected Revenue ($) *
                </label>
                <input
                  {...register("expectedRevenue", { valueAsNumber: true })}
                  type="number"
                  min={0}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] transition focus:ring-2"
                />
                {errors.expectedRevenue ? (
                  <p className="mt-1 text-xs text-red-500">{errors.expectedRevenue.message}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Deadline</label>
                <input
                  {...register("deadline")}
                  type="date"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] transition focus:ring-2"
                />
              </div>
            </div>
          </section>

          <section className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Probability & Priority
            </p>
            <div className="mt-3 space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm text-slate-700">
                  <span>Probability</span>
                  <span className="font-semibold text-[#8B6FD0]">{probability}%</span>
                </div>
                <input
                  {...register("probability", { valueAsNumber: true })}
                  type="range"
                  min={0}
                  max={100}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#8B6FD0]"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Weighted Revenue: {formatCurrency(weightedRevenue)}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Priority</label>
                <PriorityStars
                  value={priority}
                  selector
                  onChange={(value) =>
                    setValue("priority", value, { shouldDirty: true, shouldValidate: true })
                  }
                />
              </div>
            </div>
          </section>

          <section className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Stage & Assignment
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Stage *</label>
                <select
                  {...register("stageId", { valueAsNumber: true })}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700"
                >
                  <option value="" disabled={availableStages.length > 0}>
                    {availableStages.length > 0 ? "Select stage" : "No pipeline stages available"}
                  </option>
                  {availableStages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
                {errors.stageId ? (
                  <p className="mt-1 text-xs text-red-500">{errors.stageId.message}</p>
                ) : null}
                {availableStages.length === 0 ? (
                  <p className="mt-1 text-xs text-amber-600">
                    Please create pipeline stages first in Pipeline settings.
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Salesperson</label>
                <select
                  {...register("salespersonId")}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700"
                >
                  <option value="">Select salesperson</option>
                  {users
                    .filter((user) => user.active)
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Team</label>
                <select
                  {...register("teamId")}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700"
                >
                  <option value="">Select team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Contact</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={contactQuery}
                    onChange={(event) => setContactQuery(event.target.value)}
                    placeholder="Search contact..."
                    className="h-10 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] transition focus:ring-2"
                  />
                </div>
                <select
                  {...register("contactId")}
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700"
                >
                  <option value="">Select contact</option>
                  {contactResults.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.fullName}
                      {contact.companyName ? ` - ${contact.companyName}` : ""}
                    </option>
                  ))}
                </select>
                {contactLoading ? (
                  <p className="mt-1 text-xs text-slate-500">Searching...</p>
                ) : null}
                {contactError ? <p className="mt-1 text-xs text-red-500">{contactError}</p> : null}
              </div>
            </div>
          </section>

          <section className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Additional Information
            </p>
            <div className="mt-3">
              <label className="mb-1 block text-sm font-medium text-slate-700">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const active = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`rounded-full border px-3 py-1 text-sm transition ${
                        active
                          ? "border-[#8B6FD0] bg-[#8B6FD0]/10 text-[#7A58BE]"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
              <textarea
                {...register("notes")}
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none ring-[#D9CFF5] transition focus:ring-2"
                placeholder="Add any additional notes..."
              />
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
              {loading ? "Saving..." : mode === "create" ? "Create Opportunity" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
