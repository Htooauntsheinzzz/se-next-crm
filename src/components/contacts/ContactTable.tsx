import { Mail, MapPin, Phone, Users2 } from "lucide-react";
import type { Contact, TagDto } from "@/types/contact";
import type { User } from "@/types/user";
import { ContactTypeBadge } from "@/components/contacts/ContactTypeBadge";
import { ContactActions } from "@/components/contacts/ContactActions";

interface ContactTableProps {
  contacts: Contact[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  currentUser?: User | null;
  onPageChange: (page: number) => void;
  onCreate?: () => void;
  onEdit: (contact: Contact) => void;
  onViewHistory: (contact: Contact) => void;
  onMerge?: (contact: Contact) => void;
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
  const fallbackClass = tag.color ? "bg-slate-100 text-slate-700" : "bg-slate-100 text-slate-700";
  const className = tagClassByName[tag.name] ?? fallbackClass;

  return (
    <span
      key={tag.id}
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium ${className}`}
    >
      {tag.name}
    </span>
  );
};

export const ContactTable = ({
  contacts,
  loading,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  currentUser,
  onPageChange,
  onCreate,
  onEdit,
  onViewHistory,
  onMerge,
  onDeactivate,
}: ContactTableProps) => {
  const rep = currentUser?.role === "SALES_REP";
  const manager = currentUser?.role === "SALES_MANAGER";
  const admin = currentUser?.role === "ADMIN";

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`contact-skeleton-${index}`} className="h-12 rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!contacts.length) {
    let emptyMsg = "No contacts found. Try adjusting filters or create a new contact.";
    if (manager) emptyMsg = "No contacts for your team yet. Create one or ask an admin to assign contacts to your team.";
    if (rep) emptyMsg = "You don't have any contacts assigned. Ask your manager to assign contacts to you.";

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <Users2 className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-600">{emptyMsg}</p>
        {onCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-[#8B6FD0] px-4 text-sm font-semibold text-white transition hover:bg-[#7D62C4]"
          >
            New Contact
          </button>
        )}
      </div>
    );
  }

  const start = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const end = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="w-[20%] px-4 py-3">Contact</th>
              <th className="w-[8%] px-4 py-3">Type</th>
              <th className="w-[18%] px-4 py-3">Email</th>
              <th className="w-[12%] px-4 py-3">Phone</th>
              <th className="w-[12%] px-4 py-3">Location</th>
              <th className="w-[12%] px-4 py-3">Tags</th>
              <th className="w-[10%] px-4 py-3">Assigned To</th>
              <th className="w-[5%] px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {contacts.map((contact, index) => (
              <tr key={contact.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#8B6FD0] text-[11px] font-semibold text-white">
                      {getInitialsFromName(contact.fullName)}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{contact.fullName}</p>
                      {contact.type === "PERSON" ? (
                        <>
                          <p className="text-xs text-slate-500">
                            {contact.parentName || contact.companyName || "—"}
                          </p>
                          <p className="text-xs text-slate-500">{contact.jobTitle || "—"}</p>
                        </>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <ContactTypeBadge type={contact.type} />
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {contact.email || "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {contact.phone || contact.mobile || "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {getLocationLabel(contact)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex max-w-[170px] flex-wrap gap-1">
                    {contact.tags?.length ? contact.tags.map((tag) => renderTag(tag)) : <span className="text-slate-400">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {contact.assignedToName ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-medium text-slate-700">
                        {getInitialsFromName(contact.assignedToName)}
                      </span>
                      <span className="text-xs text-slate-700">{contact.assignedToName}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <ContactActions
                    contact={contact}
                    currentUser={currentUser}
                    flipUp={index >= contacts.length - 2}
                    onEdit={onEdit}
                    onViewHistory={onViewHistory}
                    onMerge={onMerge}
                    onDeactivate={onDeactivate}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
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

      <div className="space-y-3 md:hidden">
        {contacts.map((contact) => (
          <div key={`mobile-contact-${contact.id}`} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#8B6FD0] text-xs font-semibold text-white">
                  {getInitialsFromName(contact.fullName)}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{contact.fullName}</p>
                  <p className="text-xs text-slate-500">{contact.email || "—"}</p>
                </div>
              </div>
              <ContactActions
                contact={contact}
                currentUser={currentUser}
                onEdit={onEdit}
                onViewHistory={onViewHistory}
                onMerge={onMerge}
                onDeactivate={onDeactivate}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ContactTypeBadge type={contact.type} />
              <span className="text-xs text-slate-500">{getLocationLabel(contact)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
