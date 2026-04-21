"use client";

import { useEffect, useMemo, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, UserRound, X } from "lucide-react";
import type {
  Contact,
  ContactCreateRequest,
  ContactType,
  ContactUpdateRequest,
  TagDto,
} from "@/types/contact";
import type { User } from "@/types/user";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { isAdmin, isManager, isRep } from "@/lib/auth/rbac";
import type { SalesTeam } from "@/types/team";
import { CountryPhoneInput } from "@/components/shared/CountryPhoneInput";

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Education",
  "Real Estate",
];

const contactSchema = z.object({
  type: z.enum(["PERSON", "COMPANY"]),
  fullName: z.string().min(1, "Name is required").max(150),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  jobTitle: z.string().max(100).optional().or(z.literal("")),
  companyName: z.string().max(150).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  mobile: z.string().max(30).optional().or(z.literal("")),
  website: z.string().max(255).optional().or(z.literal("")),
  street: z.string().max(255).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  zipCode: z.string().max(30).optional().or(z.literal("")),
  linkedinUrl: z.string().max(255).optional().or(z.literal("")),
  twitterHandle: z.string().max(100).optional().or(z.literal("")),
  source: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
  industry: z.string().max(100).optional().or(z.literal("")),
  assignedTo: z.string().optional().or(z.literal("")),
  teamId: z.string().optional().or(z.literal("")),
  parentId: z.string().optional().or(z.literal("")),
  tagIds: z.array(z.number()).optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  loading?: boolean;
  users: User[];
  tags: TagDto[];
  companies: Contact[];
  teams: SalesTeam[];
  initialContact?: Contact | null;
  onClose: () => void;
  onSubmit: (payload: ContactCreateRequest | ContactUpdateRequest) => Promise<void>;
}

const cleanOptional = (value: string | undefined) => {
  const safe = value?.trim() ?? "";
  return safe || undefined;
};

const mapInitialValues = (contact?: Contact | null, currentUser?: User | null): ContactFormValues => {
  let defaultAssignedTo = contact?.assignedTo ? String(contact.assignedTo) : "";
  let defaultTeamId = contact?.teamId ? String(contact.teamId) : "";

  if (!contact && currentUser) {
    if (isManager(currentUser) || isRep(currentUser)) {
      defaultAssignedTo = String(currentUser.id);
      defaultTeamId = currentUser.teamId ? String(currentUser.teamId) : "";
    }
  }

  return {
    type: contact?.type ?? "PERSON",
    fullName: contact?.fullName ?? "",
    email: contact?.email ?? "",
    jobTitle: contact?.jobTitle ?? "",
    companyName: contact?.companyName ?? "",
    phone: contact?.phone ?? "",
    mobile: contact?.mobile ?? "",
    website: contact?.website ?? "",
    street: contact?.street ?? "",
    city: contact?.city ?? "",
    state: contact?.state ?? "",
    country: contact?.country ?? "",
    zipCode: contact?.zipCode ?? "",
    linkedinUrl: contact?.linkedinUrl ?? "",
    twitterHandle: contact?.twitterHandle ?? "",
    source: contact?.source ?? "",
    notes: contact?.notes ?? "",
    industry: contact?.industry ?? "",
    assignedTo: defaultAssignedTo,
    teamId: defaultTeamId,
    parentId: contact?.parentId ? String(contact.parentId) : "",
    tagIds: contact?.tags?.map((tag) => tag.id) ?? [],
  };
};

export const ContactFormModal = ({
  open,
  mode,
  loading = false,
  users,
  tags,
  companies,
  teams,
  initialContact,
  onClose,
  onSubmit,
}: ContactFormModalProps) => {
  const { currentUser } = useCurrentUser();
  const admin = isAdmin(currentUser);
  const rep = isRep(currentUser);
  const manager = isManager(currentUser);
  const initialValues = useMemo(() => mapInitialValues(initialContact, currentUser), [initialContact, currentUser]);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: initialValues,
  });

  const type = watch("type");
  const parentId = watch("parentId");
  const selectedTags = watch("tagIds") ?? [];
  const phone = watch("phone") ?? "";
  const mobile = watch("mobile") ?? "";

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

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

  const toggleTag = (id: number) => {
    const set = new Set(selectedTags);
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    setValue("tagIds", Array.from(set));
  };

  const submit = async (values: ContactFormValues) => {
    const selectedParentCompany =
      values.type === "PERSON" && values.parentId
        ? companies.find((company) => String(company.id) === values.parentId)
        : null;

    const payload: ContactCreateRequest | ContactUpdateRequest = {
      type: values.type as ContactType,
      fullName: values.fullName.trim(),
      email: cleanOptional(values.email),
      jobTitle: cleanOptional(values.jobTitle),
      companyName:
        values.type === "PERSON"
          ? cleanOptional(values.companyName) || selectedParentCompany?.fullName || undefined
          : undefined,
      parentId: values.type === "PERSON" && values.parentId ? Number(values.parentId) : undefined,
      phone: cleanOptional(values.phone),
      mobile: values.type === "PERSON" ? cleanOptional(values.mobile) : undefined,
      website: cleanOptional(values.website),
      street: cleanOptional(values.street),
      city: cleanOptional(values.city),
      state: cleanOptional(values.state),
      country: cleanOptional(values.country),
      zipCode: cleanOptional(values.zipCode),
      linkedinUrl: cleanOptional(values.linkedinUrl),
      twitterHandle: cleanOptional(values.twitterHandle),
      source: cleanOptional(values.source),
      notes: cleanOptional(values.notes),
      industry: values.type === "COMPANY" ? cleanOptional(values.industry) : undefined,
      assignedTo: rep && currentUser ? Number(currentUser.id) : (values.assignedTo ? Number(values.assignedTo) : undefined),
      teamId: (rep || manager) && currentUser?.teamId ? Number(currentUser.teamId) : (values.teamId ? Number(values.teamId) : undefined),
      tagIds: values.tagIds?.length ? values.tagIds : undefined,
    };

    await onSubmit(payload);
  };

  const onFormKeyDown = (event: ReactKeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();

    if (tagName === "textarea") {
      return;
    }

    // Prevent accidental submit while typing in inputs/selects.
    event.preventDefault();
  };

  const renderInputError = (message?: string) =>
    message ? <p className="mt-1 text-xs text-red-600">{message}</p> : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              {mode === "create" ? "Create New Contact" : "Edit Contact"}
            </h3>
            <p className="text-sm text-slate-500">Add a new person or company to your contacts</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close contact modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(submit)}
          onKeyDown={onFormKeyDown}
          className="max-h-[78vh] space-y-4 overflow-y-auto px-4 py-4"
        >
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setValue("type", "PERSON")}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-md border text-sm font-medium transition ${
                type === "PERSON"
                  ? "border-[#8B6FD0] bg-purple-50 text-[#8B6FD0]"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <UserRound className="h-4 w-4" />
              Person
            </button>
            <button
              type="button"
              onClick={() => setValue("type", "COMPANY")}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-md border text-sm font-medium transition ${
                type === "COMPANY"
                  ? "border-[#8B6FD0] bg-purple-50 text-[#8B6FD0]"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Building2 className="h-4 w-4" />
              Company
            </button>
          </div>

          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Basic Information
            </h4>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  {type === "COMPANY" ? "Company Name *" : "Full Name *"}
                </label>
                <input
                  {...register("fullName")}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                  placeholder={type === "COMPANY" ? "Acme Corporation" : "John Doe"}
                />
                {renderInputError(errors.fullName?.message)}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {type === "PERSON" ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Job Title</label>
                      <input
                        {...register("jobTitle")}
                        className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                        placeholder="CEO, Manager, etc."
                      />
                      {renderInputError(errors.jobTitle?.message)}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">Parent Company</label>
                      <select
                        {...register("parentId")}
                        className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                      >
                        <option value="">No parent company</option>
                        {companies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.fullName}
                          </option>
                        ))}
                      </select>
                      {renderInputError(errors.parentId?.message as string | undefined)}
                    </div>

                    {!parentId ? (
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-slate-700">Company Name (Optional)</label>
                        <input
                          {...register("companyName")}
                          className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                          placeholder="Company name"
                        />
                        {renderInputError(errors.companyName?.message)}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Industry</label>
                    <select
                      {...register("industry")}
                      className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                    >
                      <option value="">Select industry</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                    {renderInputError(errors.industry?.message)}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contact Information
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Email *</label>
                <input
                  {...register("email")}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                  placeholder="email@example.com"
                />
                {renderInputError(errors.email?.message)}
              </div>

              <div className={`grid grid-cols-1 gap-3 ${type === "PERSON" ? "sm:grid-cols-2" : ""}`}>
                <CountryPhoneInput
                  label="Phone"
                  value={phone}
                  onChange={(value) => setValue("phone", value, { shouldDirty: true, shouldValidate: true })}
                  error={errors.phone?.message}
                />

                {type === "PERSON" ? (
                  <CountryPhoneInput
                    label="Mobile"
                    value={mobile}
                    onChange={(value) => setValue("mobile", value, { shouldDirty: true, shouldValidate: true })}
                    error={errors.mobile?.message}
                  />
                ) : null}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Website</label>
                <input
                  {...register("website")}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                  placeholder="https://example.com"
                />
                {renderInputError(errors.website?.message)}
              </div>
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Address</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Street Address</label>
                <input
                  {...register("street")}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">City</label>
                  <input
                    {...register("city")}
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">State</label>
                  <input
                    {...register("state")}
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Country</label>
                  <input
                    {...register("country")}
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                    placeholder="Country"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Zip Code</label>
                  <input
                    {...register("zipCode")}
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                    placeholder="Zip code"
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Additional</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">LinkedIn URL</label>
                  <input
                    {...register("linkedinUrl")}
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Twitter Handle</label>
                  <input
                    {...register("twitterHandle")}
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                    placeholder="@username"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Source</label>
                  <input
                    {...register("source")}
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                    placeholder="Referral, Website..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Assigned To</label>
                  {rep ? (
                    <div className="mt-1 flex h-10 items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 border border-slate-200">
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
                      <option value="">Unassigned</option>
                      {users.map((user) => (
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
                    <div className="mt-1 flex h-10 items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 border border-slate-200">
                      <span>{currentUser?.teamName || "Your Team"}</span>
                    </div>
                  ) : (
                    <select
                      {...register("teamId")}
                      className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                    >
                      <option value="">No Team</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

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
                  {tags.length === 0 ? (
                    <p className="text-xs text-slate-500">No tags available</p>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Notes</label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
                  placeholder="Additional context..."
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
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#8B6FD0] px-4 text-sm font-semibold text-white transition hover:bg-[#7D62C4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : mode === "create" ? "Create Contact" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
