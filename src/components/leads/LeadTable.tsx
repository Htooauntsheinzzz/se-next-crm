import { Mail, Phone, Users2 } from "lucide-react";
import { format } from "date-fns";
import type { Lead } from "@/types/lead";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import { LeadActions } from "@/components/leads/LeadActions";
import { LeadScoreBadge } from "@/components/leads/LeadScoreBadge";

interface LeadTableProps {
  leads: Lead[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  canDelete: boolean;
  onPageChange: (page: number) => void;
  onEdit: (lead: Lead) => void;
  onAssign: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
  onViewScore: (lead: Lead) => void;
  onMerge: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

const getInitialsFromName = (value: string | null | undefined) => {
  const safe = value?.trim() ?? "";
  if (!safe) {
    return "L";
  }

  const parts = safe.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const formatCreated = (value: string | null | undefined) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return format(date, "yyyy-MM-dd");
};

const hexToRgba = (hexColor: string, alpha: number) => {
  const safe = hexColor.replace("#", "");
  if (safe.length !== 6) {
    return `rgba(100,116,139,${alpha})`;
  }

  const r = Number.parseInt(safe.slice(0, 2), 16);
  const g = Number.parseInt(safe.slice(2, 4), 16);
  const b = Number.parseInt(safe.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const renderTag = (tag: Lead["tags"][number]) => {
  const color = tag.color || "#64748B";
  return (
    <span
      key={tag.id}
      className="inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-medium"
      style={{
        backgroundColor: hexToRgba(color, 0.16),
        color,
      }}
    >
      {tag.name}
    </span>
  );
};

export const LeadTable = ({
  leads,
  loading,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  canDelete,
  onPageChange,
  onEdit,
  onAssign,
  onConvert,
  onViewScore,
  onMerge,
  onDelete,
}: LeadTableProps) => {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`lead-skeleton-${index}`} className="h-12 rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!leads.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <Users2 className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-600">No leads found</p>
      </div>
    );
  }

  const start = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const end = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3">Assigned To</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {leads.map((lead, index) => (
              <tr key={lead.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#8B6FD0] text-[11px] font-semibold text-white">
                      {getInitialsFromName(lead.contactName)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{lead.contactName}</p>
                        <LeadScoreBadge score={lead.score ?? 0} />
                      </div>
                      <p className="text-xs text-slate-500">{lead.companyName || "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={lead.email ? `mailto:${lead.email}` : undefined}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-[#8B6FD0]"
                  >
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {lead.email || "—"}
                  </a>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {lead.phone || "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-xs font-medium text-slate-700">{lead.source || "—"}</p>
                    <p className="text-xs text-slate-500">{lead.medium || "—"}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <LeadStatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex max-w-[170px] flex-wrap gap-1">
                    {lead.tags?.length ? lead.tags.map((tag) => renderTag(tag)) : <span className="text-slate-400">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {lead.assignedToName ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-medium text-slate-700">
                        {getInitialsFromName(lead.assignedToName)}
                      </span>
                      <span className="text-xs text-slate-700">{lead.assignedToName}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{formatCreated(lead.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <LeadActions
                    lead={lead}
                    canDelete={canDelete}
                    flipUp={index >= leads.length - 2}
                    onEdit={onEdit}
                    onAssign={onAssign}
                    onConvert={onConvert}
                    onViewScore={onViewScore}
                    onMerge={onMerge}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
          <p>
            Showing {start}-{end} of {totalElements} leads
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
        {leads.map((lead) => (
          <article key={`lead-mobile-${lead.id}`} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#8B6FD0] text-xs font-semibold text-white">
                  {getInitialsFromName(lead.contactName)}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{lead.contactName}</p>
                    <LeadScoreBadge score={lead.score ?? 0} />
                  </div>
                  <p className="text-xs text-slate-500">{lead.companyName || "—"}</p>
                  <div className="mt-1">
                    <LeadStatusBadge status={lead.status} />
                  </div>
                </div>
              </div>
              <LeadActions
                lead={lead}
                canDelete={canDelete}
                onEdit={onEdit}
                onAssign={onAssign}
                onConvert={onConvert}
                onViewScore={onViewScore}
                onMerge={onMerge}
                onDelete={onDelete}
              />
            </div>
          </article>
        ))}
      </div>
    </>
  );
};
