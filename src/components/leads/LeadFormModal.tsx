"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, X } from "lucide-react";
import type { Lead, LeadCreateRequest, LeadTagDto, LeadUpdateRequest } from "@/types/lead";
import type { SalesTeam } from "@/types/team";
import type { User } from "@/types/user";
import type { Contact } from "@/types/contact";
import { mediumOptions, sourceOptions } from "@/components/leads/leadConfig";
import { contactService } from "@/services/contactService";
import { getApiMessage } from "@/lib/utils";
import { CountryPhoneInput } from "@/components/shared/CountryPhoneInput";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { isAdmin, isManager, isRep } from "@/lib/auth/rbac";

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

const normalizeText = (value: string | null | undefined) =>
  (value ?? "").trim().toLowerCase();

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
  const { currentUser } = useCurrentUser();
  const admin = isAdmin(currentUser);
  const manager = isManager(currentUser);
  const rep = isRep(currentUser);
  const currentTeamId = currentUser?.teamId ?? null;

  const [contactResults, setContactResults] = useState<Contact[]>([]);
  const [contactSearchLoading, setContactSearchLoading] = useState(false);
  const [contactSearchError, setContactSearchError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactInputFocused, setContactInputFocused] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
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
  const contactNameValue = watch("contactName") ?? "";
  const phone = watch("phone") ?? "";
  const assignableUsers = useMemo(() => {
    const activeUsers = users.filter((user) => user.active);

    if (admin) {
      return activeUsers;
    }

    if (manager) {
      return activeUsers.filter((user) => user.teamId && currentTeamId && user.teamId === currentTeamId);
    }

    if (rep && currentUser) {
      return activeUsers.filter((user) => user.id === currentUser.id);
    }

    return activeUsers;
  }, [admin, currentTeamId, currentUser, manager, rep, users]);
  const assignableUserIdSet = useMemo(
    () => new Set(assignableUsers.map((user) => user.id)),
    [assignableUsers],
  );
  const visibleTeams = useMemo(() => {
    if (admin) {
      return teams;
    }

    if ((manager || rep) && currentTeamId) {
      return teams.filter((team) => String(team.id) === currentTeamId);
    }

    return teams;
  }, [admin, currentTeamId, manager, rep, teams]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (mode === "create") {
      reset({
        contactName: "",
        email: "",
        phone: "",
        companyName: "",
        website: "",
        source: "",
        medium: "",
        campaign: "",
        description: "",
        contactId: "",
        assignedTo: rep && currentUser ? String(currentUser.id) : "",
        teamId: (rep || manager) && currentTeamId ? currentTeamId : "",
        tagIds: [],
      });
      setSelectedContact(null);
    } else {
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

      setSelectedContact(
        initialLead?.contactId
          ? {
              id: initialLead.contactId,
              type: "PERSON",
              fullName: initialLead.contactName,
              email: initialLead.email,
              phone: initialLead.phone,
              mobile: null,
              jobTitle: null,
              companyName: initialLead.companyName,
              parentId: null,
              parentName: null,
              website: initialLead.website,
              linkedinUrl: null,
              twitterHandle: null,
              street: null,
              city: null,
              state: null,
              country: null,
              zipCode: null,
              notes: null,
              industry: null,
              source: null,
              assignedTo: null,
              assignedToName: null,
              teamId: null,
              active: true,
              openLeadsCount: 0,
              openOpportunitiesCount: 0,
              tags: [],
              createdAt: initialLead.createdAt,
            }
          : null,
      );
    }

    setContactResults([]);
    setContactSearchLoading(false);
    setContactSearchError(null);
    setContactInputFocused(false);
  }, [currentTeamId, currentUser, initialLead, manager, mode, open, rep, reset]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const query = contactNameValue.trim();
    if (query.length < 2) {
      setContactResults([]);
      setContactSearchError(null);
      setContactSearchLoading(false);
      return;
    }

    if (selectedContact && normalizeText(query) === normalizeText(selectedContact.fullName)) {
      setContactResults([]);
      setContactSearchError(null);
      setContactSearchLoading(false);
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

        const activeContacts = (response ?? []).filter((contact) => contact.active);
        setContactResults(activeContacts.slice(0, 8));
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
  }, [contactNameValue, open, selectedContact]);

  useEffect(() => {
    if (!assignedTo) {
      return;
    }

    const selectedUser = assignableUsers.find((user) => String(user.id) === assignedTo);
    if (!selectedUser?.teamId) {
      return;
    }

    setValue("teamId", String(selectedUser.teamId));
  }, [assignableUsers, assignedTo, setValue]);

  useEffect(() => {
    const normalized = normalizeText(contactNameValue);

    if (!selectedContact) {
      if (normalized) {
        setValue("contactId", "", { shouldDirty: true });
      }
      return;
    }

    if (normalized !== normalizeText(selectedContact.fullName)) {
      setSelectedContact(null);
      setValue("contactId", "", { shouldDirty: true });
    }
  }, [contactNameValue, selectedContact, setValue]);

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

  const handleSelectContact = (contact: Contact) => {
    const companyName =
      contact.type === "COMPANY"
        ? contact.fullName
        : contact.parentName ?? contact.companyName ?? "";

    setSelectedContact(contact);
    setContactResults([]);
    setContactSearchError(null);
    setContactInputFocused(false);

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
    let resolvedContactId = toNumberOrUndefined(values.contactId);

    if (!resolvedContactId) {
      const exactLocal = contactResults.find(
        (contact) => normalizeText(contact.fullName) === normalizeText(values.contactName),
      );

      if (exactLocal) {
        resolvedContactId = exactLocal.id;
      } else {
        try {
          const response = await contactService.search(values.contactName.trim());
          const exactRemote = (response ?? []).find(
            (contact) => normalizeText(contact.fullName) === normalizeText(values.contactName),
          );
          if (exactRemote) {
            resolvedContactId = exactRemote.id;
          }
        } catch {
          // Ignore search failure during submit and continue with free-text contact.
        }
      }
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
      contactId: resolvedContactId,
      assignedTo:
        rep && currentUser
          ? Number(currentUser.id)
          : values.assignedTo && assignableUserIdSet.has(values.assignedTo)
            ? toNumberOrUndefined(values.assignedTo)
            : undefined,
      teamId:
        (rep || manager) && currentTeamId
          ? toNumberOrUndefined(currentTeamId)
          : toNumberOrUndefined(values.teamId),
      tagIds: values.tagIds?.length ? values.tagIds : undefined,
    };

    await onSubmit(payload);
  };

  const renderError = (message?: string) =>
    message ? <p className="mt-1 text-xs text-red-600">{message}</p> : null;

  const showSuggestionBox =
    contactInputFocused &&
    (contactSearchLoading || Boolean(contactSearchError) || contactResults.length > 0 || contactNameValue.trim().length >= 2);

  const contactNameField = register("contactName");

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
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contact Information
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="text-sm font-medium text-slate-700">Contact Name *</label>
                <div className="relative mt-1">
                  <input
                    {...contactNameField}
                    onFocus={() => setContactInputFocused(true)}
                    onBlur={(event) => {
                      window.setTimeout(() => setContactInputFocused(false), 120);
                      contactNameField.onBlur(event);
                    }}
                    className="h-10 w-full rounded-md border border-slate-200 pl-3 pr-9 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                    placeholder="John Anderson"
                  />
                  <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  {showSuggestionBox ? (
                    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 rounded-md border border-slate-200 bg-white shadow-lg">
                      {contactSearchLoading ? (
                        <p className="px-3 py-2 text-xs text-slate-500">Searching contacts...</p>
                      ) : null}

                      {!contactSearchLoading && contactSearchError ? (
                        <p className="px-3 py-2 text-xs text-red-600">{contactSearchError}</p>
                      ) : null}

                      {!contactSearchLoading && !contactSearchError && contactResults.length > 0 ? (
                        <div className="max-h-44 overflow-y-auto py-1">
                          {contactResults.map((contact) => (
                            <button
                              key={contact.id}
                              type="button"
                              onMouseDown={() => handleSelectContact(contact)}
                              className="block w-full px-3 py-2 text-left text-sm transition hover:bg-slate-50"
                            >
                              <p className="font-medium text-slate-800">{contact.fullName}</p>
                              <p className="text-xs text-slate-500">
                                {contact.email || "-"}
                                {contact.companyName ? ` • ${contact.companyName}` : ""}
                              </p>
                            </button>
                          ))}
                        </div>
                      ) : null}

                      {!contactSearchLoading && !contactSearchError && contactNameValue.trim().length >= 2 && contactResults.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-slate-500">
                          No matching contact found. Lead will be created with this name.
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {selectedContact ? (
                  <p className="mt-1 text-xs text-blue-700">
                    Linked to existing contact: {selectedContact.fullName}
                  </p>
                ) : null}
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
                <CountryPhoneInput
                  label="Phone"
                  value={phone}
                  onChange={(value) => setValue("phone", value, { shouldDirty: true, shouldValidate: true })}
                  error={errors.phone?.message}
                />
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
                {rep ? (
                  <div className="mt-1 flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 text-sm text-slate-700">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-[10px] font-semibold text-slate-700">
                      {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                    </span>
                    <span>Assigned to: You</span>
                  </div>
                ) : (
                  <select
                    {...register("assignedTo")}
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                  >
                    <option value="">Select user</option>
                    {assignableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Team</label>
                {rep || manager ? (
                  <div className="mt-1 flex h-10 items-center rounded-md border border-slate-200 bg-slate-100 px-3 text-sm text-slate-700">
                    {currentUser?.teamName || "Your Team"}
                  </div>
                ) : (
                  <select
                    {...register("teamId")}
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                  >
                    <option value="">Select team</option>
                    {visibleTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                )}
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
