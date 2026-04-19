"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { AttachmentTab } from "@/components/attachments/AttachmentTab";
import { leadService } from "@/services/leadService";
import { getApiMessage } from "@/lib/utils";
import type { Lead } from "@/types/lead";

interface LeadDetailPageProps {
  leadId: number;
}

export const LeadDetailPage = ({ leadId }: LeadDetailPageProps) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "attachments">("details");
  const [attachmentCount, setAttachmentCount] = useState(0);

  useEffect(() => {
    const fetchLead = async () => {
      if (!leadId) {
        setError("Invalid lead id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await leadService.getById(leadId);
        setLead(response);
      } catch (fetchError) {
        const message = getApiMessage(fetchError, "Failed to load lead");
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchLead();
  }, [leadId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
        <div className="h-56 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error ?? "Lead not found"}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link href="/leads" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
        <ArrowLeft className="h-4 w-4" />
        Back to Leads
      </Link>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-3xl font-semibold text-slate-900">{lead.contactName}</h1>
        <p className="mt-1 text-sm text-slate-500">{lead.companyName || "No company"}</p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Status</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{lead.status}</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Email</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{lead.email || "—"}</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Phone</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{lead.phone || "—"}</p>
          </article>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              activeTab === "details" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("attachments")}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
              activeTab === "attachments"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Paperclip className="h-3.5 w-3.5" />
            Attachments ({attachmentCount})
          </button>
        </div>

        {activeTab === "details" ? (
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-900">Source:</span> {lead.source || "—"}
            </p>
            <p>
              <span className="font-medium text-slate-900">Assigned To:</span> {lead.assignedToName || "—"}
            </p>
            <p>
              <span className="font-medium text-slate-900">Team:</span> {lead.teamName || "—"}
            </p>
          </div>
        ) : (
          <AttachmentTab entityType="LEAD" entityId={lead.id} onCountChange={setAttachmentCount} />
        )}
      </section>
    </div>
  );
};
