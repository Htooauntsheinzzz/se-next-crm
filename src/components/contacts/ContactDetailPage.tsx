"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useContact } from "@/hooks/useContact";
import { ContactTypeBadge } from "@/components/contacts/ContactTypeBadge";
import { formatCurrency, formatDateLabel } from "@/lib/utils";

interface ContactDetailPageProps {
  contactId: number;
}

export const ContactDetailPage = ({ contactId }: ContactDetailPageProps) => {
  const { history, loading, error } = useContact(contactId);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
        <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-72 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (!history) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error ?? "Contact not found"}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link href="/contacts" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
        <ArrowLeft className="h-4 w-4" />
        Back to Contacts
      </Link>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{history.contact.fullName}</h1>
            <p className="text-sm text-slate-500">{history.contact.email || "No email"}</p>
          </div>
          <ContactTypeBadge type={history.contact.type} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Total Leads</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{history.totalLeads || 0}</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Opportunities</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{history.totalOpportunities || 0}</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Won</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{history.wonOpportunities || 0}</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Revenue</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(history.totalRevenue || 0)}</p>
          </article>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-900">Leads History</h2>
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
          <p className="px-4 py-5 text-sm text-slate-500">No leads found for this contact.</p>
        )}
      </section>
    </div>
  );
};
