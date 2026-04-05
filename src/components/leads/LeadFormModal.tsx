"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, UserRound, X } from "lucide-react";
import type { Lead, LeadCreateRequest, LeadTagDto, LeadUpdateRequest } from "@/types/lead";
import type { SalesTeam } from "@/types/team";
import type { User } from "@/types/user";
import type { Contact } from "@/types/contact";
import { mediumOptions, sourceOptions } from "@/components/leads/leadConfig";
import { contactService } from "@/services/contactService";
import { getApiMessage } from "@/lib/utils";

const leadSchema = z.object({
  contactName: z.string().min(1, "Contact name is required").max(150),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  companyName: z.string().max(150).optional().or(z.literal("")),
  website: z.string().max(255).optional().or(z.literal("")),
  source: z.string().max(100).optional().or(z.literal("")),
  medium: z.string().max(80).optional().or(z.literal("")),
  campaign: z.string().max(80).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  contactId: z.string().optional().or(z.literal("")),
  assignedTo: z.string().optional().or(z.literal("")),
  teamId: z.string().optional().or(z.literal("")),
  tagIds: z.array(z.number()).optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface LeadFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  loading?: boolean;
  users: User[];
  teams: SalesTeam[];
  tags: LeadTagDto[];
  initialLead?: Lead | null;
  onClose: () => void;
  onSubmit: (payload: LeadCreateRequest | LeadUpdateRequest) => Promise<void>;
}

const cleanOptional = (value: string | undefined) => {
  const safe = value?.trim() ?? "";
  return safe || undefined;
};

const toNumberOrUndefined = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const LeadFormModal = ({
  open,
  mode,
  loading = false,
  users,
  teams,
  tags,
  initialLead,
  onClose,
  onSubmit,
}: LeadFormModalProps) => {
  const [contactMode, setContactMode] = useState<"existing" | "new">("new");
  const [contactSearch, setContactSearch] = useState("");
  const [contactResults, setContactResults] = useState<Contact[]>([]);
  const [contactSearchLoading, setContactSearchLoading] = useState(false);
  const [contactSearchError, setContactSearchError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      contactName: initialLead?.contactName ?? "",
      email: initialLead?.email ?? "",
      phone: initialLead?.phone ?? "",
      companyName: initialLead?.companyName ?? "",
      website: initialLead?.website ?? "",
      source: initialLead?.source ?? "",
      medium: initialLead?.medium ?? "",
      campaign: initialLead?.campaign ?? "",
      description: initialLead?.description ?? "",
      contactId: initialLead?.contactId ? String(initialLead.contactId) : "",
      assignedTo: initialLead?.assignedTo ? String(initialLead.assignedTo) : "",
      teamId: initialLead?.teamId ? String(initialLead.teamId) : "",
      tagIds: initialLead?.tags?.map((tag) => tag.id) ?? [],
    },
  });

  const selectedTags = watch("tagIds") ?? [];
  const assignedTo = watch("assignedTo");

  useEffect(() => {
    reset({
      contactName: initialLead?.contactName ?? "",
      email: initialLead?.email ?? "",
      phone: initialLead?.phone ?? "",
      companyName: initialLead?.companyName ?? "",
      website: initialLead?.website ?? "",
      source: initialLead?.source ?? "",
      medium: initialLead?.medium ?? "",
      campaign: initialLead?.campaign ?? "",
      description: initialLead?.description ?? "",
      contactId: initialLead?.contactId ? String(initialLead.contactId) : "",
      assignedTo: initialLead?.assignedTo ? String(initialLead.assignedTo) : "",
      teamId: initialLead?.teamId ? String(initialLead.teamId) : "",
      tagIds: initialLead?.tags?.map((tag) => tag.id) ?? [],
    });
    setContactMode(initialLead?.contactId ? "existing" : "new");
    setContactSearch("");
    setContactResults([]);
    setContactSearchError(null);
    setSelectedContact(null);
  }, [initialLead, reset]);

  useEffect(() => {
    if (!open || contactMode !== "existing") {
      return;
    }

    const query = contactSearch.trim();
    if (!query) {
      setContactResults([]);
      setContactSearchError(null);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      try {
        setContactSearchLoading(true);
        setContactSearchError(null);
        const response = await contactService.search(query);

        if (cancelled) {
          return;
        }

        setContactResults((response ?? []).filter((contact) => contact.active));
      } catch (error) {
        if (cancelled) {
          return;
        }
        setContactSearchError(getApiMessage(error, "Failed to search contacts"));
        setContactResults([]);
      } finally {
        if (!cancelled) {
          setContactSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [contactMode, contactSearch, open]);

  useEffect(() => {
    if (!assignedTo) {
      return;
    }

    const selectedUser = users.find((user) => String(user.id) === assignedTo);
    if (!selectedUser?.teamId) {
      return;
    }

    setValue("teamId", String(selectedUser.teamId));
  }, [assignedTo, setValue, users]);

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

  if (!open) {
    return null;
  }

  const handleContactModeChange = (mode: "existing" | "new") => {
    setContactMode(mode);
    clearErrors("contactId");

    if (mode === "new") {
      setValue("contactId", "");
      setSelectedContact(null);
      setContactSearch("");
      setContactResults([]);
      setContactSearchError(null);
    }
  };

  const handleSelectContact = (contact: Contact) => {
    const companyName =
      contact.type === "COMPANY"
        ? contact.fullName
        : contact.parentName ?? contact.companyName ?? "";

    setSelectedContact(contact);
    setContactSearch(contact.fullName);
    setContactResults([]);
    setContactSearchError(null);
    clearErrors("contactId");

    setValue("contactId", String(contact.id), { shouldDirty: true });
    setValue("contactName", contact.fullName ?? "", { shouldDirty: true, shouldValidate: true });
    setValue("email", contact.email ?? "", { shouldDirty: true });
    setValue("phone", contact.phone ?? contact.mobile ?? "", { shouldDirty: true });
    setValue("companyName", companyName, { shouldDirty: true });
    setValue("website", contact.website ?? "", { shouldDirty: true });
  };

  const toggleTag = (id: number) => {
    const set = new Set(selectedTags);
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    setValue("tagIds", Array.from(set));
  };

  const submit = async (values: LeadFormValues) => {
    if (contactMode === "existing" && !values.contactId) {
      setError("contactId", {
        type: "manual",
        message: "Please select an existing contact",
      });
      return;
    }

    const payload: LeadCreateRequest | LeadUpdateRequest = {
      contactName: values.contactName.trim(),
      email: cleanOptional(values.email),
      phone: cleanOptional(values.phone),
      companyName: cleanOptional(values.companyName),
      website: cleanOptional(values.website),
      source: cleanOptional(values.source),
      medium: cleanOptional(values.medium),
      campaign: cleanOptional(values.campaign),
      description: cleanOptional(values.description),
      contactId: toNumberOrUndefined(values.contactId),
      assignedTo: toNumberOrUndefined(values.assignedTo),
      teamId: toNumberOrUndefined(values.teamId),
      tagIds: values.tagIds?.length ? values.tagIds : undefined,
    };

    await onSubmit(payload);
  };

  const renderError = (message?: string) =>
    message ? <p className="mt-1 text-xs text-red-600">{message}</p> : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              {mode === "create" ? "Create New Lead" : "Edit Lead"}
            </h3>
            <p className="text-sm text-slate-500">
              Fill in the information below to {mode === "create" ? "create a new lead" : "update this lead"}.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="max-h-[78vh] space-y-4 overflow-y-auto px-4 py-4">
          <input type="hidden" {...register("contactId")} />

          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Contact Source</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleContactModeChange("existing")}
                className={`inline-flex h-10 items-center justify-center rounded-md border text-sm font-medium transition ${
                  contactMode === "existing"
                    ? "border-[#8B6FD0] bg-purple-50 text-[#8B6FD0]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Select Existing
              </button>
              <button
                type="button"
                onClick={() => handleContactModeChange("new")}
                className={`inline-flex h-10 items-center justify-center rounded-md border text-sm font-medium transition ${
                  contactMode === "new"
                    ? "border-[#8B6FD0] bg-purple-50 text-[#8B6FD0]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Create New
              </button>
            </div>

            {contactMode === "existing" ? (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <label className="text-sm font-medium text-slate-700">Search Contact</label>
                <div className="relative mt-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={contactSearch}
                    onChange={(event) => setContactSearch(event.target.value)}
                    placeholder="Search by contact name, email, company..."
                    className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                  />
                </div>

                {contactSearchLoading ? (
                  <p className="mt-2 text-xs text-slate-500">Searching contacts...</p>
                ) : null}
                {contactSearchError ? (
                  <p className="mt-2 text-xs text-red-600">{contactSearchError}</p>
                ) : null}

                {!contactSearchLoading && contactSearch.trim() && contactResults.length > 0 ? (
                  <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-md border border-slate-200 bg-white p-1">
                    {contactResults.map((contact) => (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => handleSelectContact(contact)}
                        className="w-full rounded-md px-2 py-1.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        <p className="font-medium text-slate-800">{contact.fullName}</p>
                        <p className="text-xs text-slate-500">
                          {contact.email || "-"} {contact.companyName ? `• ${contact.companyName}` : ""}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : null}

                {selectedContact ? (
                  <div className="mt-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2">
                    <p className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                      <UserRound className="h-3.5 w-3.5" />
                      Selected Contact
                    </p>
                    <p className="text-sm font-semibold text-blue-800">{selectedContact.fullName}</p>
                    <p className="text-xs text-blue-700">{selectedContact.email || "-"}</p>
                  </div>
                ) : null}

                {renderError(errors.contactId?.message)}
              </div>
            ) : null}
          </section>

          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contact Information
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Contact Name *</label>
                <input
                  {...register("contactName")}
                  disabled={contactMode === "existing"}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100"
                  placeholder={
                    contactMode === "existing" ? "Select contact from above" : "John Anderson"
                  }
                />
                {renderError(errors.contactName?.message)}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Company</label>
                <input
                  {...register("companyName")}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                  placeholder="TechStart Solutions"
                />
                {renderError(errors.companyName?.message)}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Email *</label>
                <input
                  {...register("email")}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                  placeholder="john@example.com"
                />
                {renderError(errors.email?.message)}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <input
                  {...register("phone")}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                  placeholder="+1 (555) 123-4567"
                />
                {renderError(errors.phone?.message)}
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-slate-700">Website</label>
                <input
                  {...register("website")}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                  placeholder="https://example.com"
                />
                {renderError(errors.website?.message)}
              </div>
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Source Tracking
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Source</label>
                <select
                  {...register("source")}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                >
                  <option value="">Select source</option>
                  {sourceOptions.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Medium</label>
                <select
                  {...register("medium")}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                >
                  <option value="">Select medium</option>
                  {mediumOptions.map((medium) => (
                    <option key={medium} value={medium}>
                      {medium}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Campaign</label>
                <input
                  {...register("campaign")}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                  placeholder="Summer 2024 Campaign"
                />
              </div>
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Assignment</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Assign To</label>
                <select
                  {...register("assignedTo")}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                >
                  <option value="">Select user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Team</label>
                <select
                  {...register("teamId")}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                >
                  <option value="">Select team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Additional Information
            </h4>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Tags</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const selected = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`rounded-full border px-2 py-1 text-xs font-medium transition ${
                          selected
                            ? "border-[#8B6FD0] bg-purple-100 text-purple-700"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Notes</label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                  placeholder="Add any additional notes about this lead..."
                />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center rounded-md bg-[#8B6FD0] px-4 text-sm font-semibold text-white transition hover:bg-[#7D62C4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : mode === "create" ? "Create Lead" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
