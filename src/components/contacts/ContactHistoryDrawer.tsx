"use client";

import { useEffect, useState } from "react";
import { BarChart3, DollarSign, Trophy, UserRound, X } from "lucide-react";
import { contactService } from "@/services/contactService";
import type { ContactHistoryDto } from "@/types/contact";
import { ContactTypeBadge } from "@/components/contacts/ContactTypeBadge";
import { formatCurrency, formatDateLabel, getApiMessage } from "@/lib/utils";

interface ContactHistoryDrawerProps {
  open: boolean;
  contactId: number | null;
  onClose: () => void;
}

export const ContactHistoryDrawer = ({ open, contactId, onClose }: ContactHistoryDrawerProps) => {
  const [history, setHistory] = useState<ContactHistoryDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const loadHistory = async () => {
      if (!open || !contactId) {
        setHistory(null);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await contactService.getHistory(contactId);
        setHistory(response);
      } catch (err) {
        setError(getApiMessage(err, "Failed to load contact history"));
      } finally {
        setLoading(false);
      }
    };

    void loadHistory();
  }, [contactId, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" onClick={onClose}>
      <aside
        className="ml-auto h-full w-full max-w-[480px] overflow-y-auto bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="text-lg font-semibold text-slate-900">Contact History</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {loading ? (
          <div className="space-y-3 p-4">
            <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : error ? (
          <div className="p-4">
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          </div>
        ) : history ? (
          <div className="space-y-4 p-4">
            <section className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#8B6FD0] text-xs font-semibold text-white">
                    {history.contact.fullName.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-base font-semibold text-slate-900">{history.contact.fullName}</p>
                    <p className="text-sm text-slate-500">{history.contact.email || "No email"}</p>
                    <p className="text-sm text-slate-500">{history.contact.phone || history.contact.mobile || "No phone"}</p>
                    <p className="text-xs text-slate-500">
                      {history.contact.city || history.contact.country
                        ? `${history.contact.city || ""}${history.contact.city && history.contact.country ? ", " : ""}${history.contact.country || ""}`
                        : "No location"}
                    </p>
                  </div>
                </div>
                <ContactTypeBadge type={history.contact.type} />
              </div>
            </section>

            <section className="grid grid-cols-2 gap-2">
              <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="inline-flex items-center gap-2 text-slate-500">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-xs font-medium">Total Leads</span>
                </div>
                <p className="mt-1 text-xl font-semibold text-slate-900">{history.totalLeads || 0}</p>
              </article>
              <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="inline-flex items-center gap-2 text-slate-500">
                  <UserRound className="h-4 w-4" />
                  <span className="text-xs font-medium">Opportunities</span>
                </div>
                <p className="mt-1 text-xl font-semibold text-slate-900">{history.totalOpportunities || 0}</p>
              </article>
              <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="inline-flex items-center gap-2 text-slate-500">
                  <Trophy className="h-4 w-4" />
                  <span className="text-xs font-medium">Won</span>
                </div>
                <p className="mt-1 text-xl font-semibold text-slate-900">{history.wonOpportunities || 0}</p>
              </article>
              <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="inline-flex items-center gap-2 text-slate-500">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs font-medium">Revenue</span>
                </div>
                <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(history.totalRevenue || 0)}</p>
              </article>
            </section>

            <section className="rounded-xl border border-slate-200">
              <div className="border-b border-slate-200 px-4 py-3">
                <h4 className="text-sm font-semibold text-slate-900">Leads</h4>
              </div>
              {history.leads?.length ? (
                <div className="divide-y divide-slate-100">
                  {history.leads.map((lead) => (
                    <div key={lead.id} className="px-4 py-3 text-sm">
                      <p className="font-medium text-slate-900">{lead.title || `Lead #${lead.id}`}</p>
                      <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                        <span>{lead.status || "Unknown status"}</span>
                        <span>{formatDateLabel(lead.createdAt ?? null)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-6 text-sm text-slate-500">No leads yet</p>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 px-4 py-6 text-center">
              <p className="text-sm font-medium text-slate-700">Activity Timeline</p>
              <p className="mt-1 text-xs text-slate-500">No activities yet</p>
            </section>
          </div>
        ) : null}
      </aside>
    </div>
  );
};
