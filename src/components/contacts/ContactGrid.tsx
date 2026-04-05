import { Mail, MapPin, Phone, Users2 } from "lucide-react";
import type { Contact, TagDto } from "@/types/contact";
import { ContactActions } from "@/components/contacts/ContactActions";
import { ContactTypeBadge } from "@/components/contacts/ContactTypeBadge";

interface ContactGridProps {
  contacts: Contact[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEdit: (contact: Contact) => void;
  onViewHistory: (contact: Contact) => void;
  onMerge: (contact: Contact) => void;
  onDeactivate: (contact: Contact) => void;
}

const getInitialsFromName = (value: string | null | undefined) => {
  const safe = value?.trim() ?? "";
  if (!safe) {
    return "C";
  }

  const parts = safe.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const getLocationLabel = (contact: Contact) => {
  const parts = [contact.city, contact.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
};

const tagClassByName: Record<string, string> = {
  VIP: "bg-purple-100 text-purple-700",
  Enterprise: "bg-blue-100 text-blue-700",
  Partner: "bg-green-100 text-green-700",
  "Hot Lead": "bg-red-100 text-red-700",
  "Decision Maker": "bg-amber-100 text-amber-700",
  International: "bg-teal-100 text-teal-700",
  Large: "bg-indigo-100 text-indigo-700",
};

const renderTag = (tag: TagDto) => {
  const className = tagClassByName[tag.name] ?? "bg-slate-100 text-slate-700";

  return (
    <span key={tag.id} className={`inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-medium ${className}`}>
      {tag.name}
    </span>
  );
};

export const ContactGrid = ({
  contacts,
  loading,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onEdit,
  onViewHistory,
  onMerge,
  onDeactivate,
}: ContactGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`contact-grid-skeleton-${index}`} className="h-56 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (!contacts.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <Users2 className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-600">No contacts found</p>
      </div>
    );
  }

  const start = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const end = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {contacts.map((contact) => (
          <article key={`contact-card-${contact.id}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#8B6FD0] text-xs font-semibold text-white">
                  {getInitialsFromName(contact.fullName)}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{contact.fullName}</p>
                  <p className="text-xs text-slate-500">
                    {contact.type === "PERSON"
                      ? `${contact.parentName || contact.companyName || "—"}${contact.jobTitle ? ` · ${contact.jobTitle}` : ""}`
                      : contact.industry || "Company"}
                  </p>
                </div>
              </div>
              <ContactActions
                contact={contact}
                onEdit={onEdit}
                onViewHistory={onViewHistory}
                onMerge={onMerge}
                onDeactivate={onDeactivate}
              />
            </div>

            <div className="mt-3">
              <ContactTypeBadge type={contact.type} />
            </div>

            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p className="inline-flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {contact.email || "—"}
              </p>
              <p className="inline-flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {contact.phone || contact.mobile || "—"}
              </p>
              <p className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {getLocationLabel(contact)}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {contact.tags?.length ? contact.tags.map((tag) => renderTag(tag)) : <span className="text-xs text-slate-400">No tags</span>}
            </div>

            <div className="mt-4 border-t border-slate-200 pt-3">
              <p className="text-xs text-slate-500">Assigned To</p>
              {contact.assignedToName ? (
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-medium text-slate-700">
                    {getInitialsFromName(contact.assignedToName)}
                  </span>
                  <span className="text-sm font-medium text-slate-700">{contact.assignedToName}</span>
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-400">Unassigned</p>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <p>
          Showing {start}-{end} of {totalElements} contacts
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 0}
            onClick={() => onPageChange(currentPage - 1)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-[#8B6FD0] px-2 text-xs font-semibold text-white">
            {currentPage + 1}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages - 1 || totalPages === 0}
            onClick={() => onPageChange(currentPage + 1)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
