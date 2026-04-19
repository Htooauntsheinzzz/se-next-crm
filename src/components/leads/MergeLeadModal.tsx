"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, GitMerge, Search, X } from "lucide-react";
import type { Lead } from "@/types/lead";
import { leadService } from "@/services/leadService";
import { getApiMessage } from "@/lib/utils";

interface MergeLeadModalProps {
  open: boolean;
  primaryLead: Lead | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (duplicateId: number) => Promise<void>;
}

export const MergeLeadModal = ({
  open,
  primaryLead,
  loading = false,
  onClose,
  onSubmit,
}: MergeLeadModalProps) => {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<Lead[]>([]);
  const [selectedDuplicateId, setSelectedDuplicateId] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !primaryLead) {
      return;
    }

    setSelectedDuplicateId("");
    setSearch("");

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("keydown", onEscape);
    };
  }, [onClose, open, primaryLead]);

  useEffect(() => {
    if (!open || !primaryLead) {
      return;
    }

    let cancelled = false;

    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        setOptionsError(null);

        const response = await leadService.getAll({
          page: 0,
          size: 100,
          search: search.trim() || undefined,
        });

        if (cancelled) {
          return;
        }

        const filtered = (response.content ?? []).filter((lead) => lead.id !== primaryLead.id);
        setOptions(filtered);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setOptionsError(getApiMessage(error, "Failed to load duplicate leads"));
        setOptions([]);
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    };

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [open, primaryLead, search]);

  const selectedDuplicate = useMemo(
    () => options.find((lead) => String(lead.id) === selectedDuplicateId) ?? null,
    [options, selectedDuplicateId],
  );

  if (!open || !primaryLead) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <GitMerge className="h-4 w-4 text-[#8B6FD0]" />
              Merge Duplicate Leads
            </h3>
            <p className="text-sm text-slate-500">
              Select a duplicate lead to merge into the primary lead.
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

        <div className="space-y-4 p-4">
          <section>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Primary Lead (Keep this one)</p>
            <div className="mt-1 rounded-md border border-amber-200 border-l-4 border-l-amber-400 bg-amber-50 px-3 py-2">
              <p className="text-sm font-semibold text-slate-900">{primaryLead.contactName}</p>
              <p className="text-xs text-slate-600">{primaryLead.companyName || "-"}</p>
              <p className="text-xs text-slate-500">{primaryLead.email || "-"}</p>
            </div>
          </section>

          <section>
            <label className="text-sm font-medium text-slate-700">Select Duplicate Lead to Merge</label>
            <div className="relative mt-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search duplicate leads"
                className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
              />
            </div>

            <select
              value={selectedDuplicateId}
              onChange={(event) => setSelectedDuplicateId(event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
            >
              <option value="">Choose a duplicate lead</option>
              {options.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.contactName} {lead.companyName ? `- ${lead.companyName}` : ""}
                </option>
              ))}
            </select>

            {loadingOptions ? <p className="mt-1 text-xs text-slate-500">Loading leads...</p> : null}
            {optionsError ? <p className="mt-1 text-xs text-red-600">{optionsError}</p> : null}
          </section>

          {selectedDuplicate ? (
            <section className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-xs text-slate-500">Duplicate (will be archived)</p>
              <p className="text-sm font-semibold text-slate-900">{selectedDuplicate.contactName}</p>
              <p className="text-xs text-slate-600">{selectedDuplicate.email || "-"}</p>
            </section>
          ) : null}

          <section className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <p className="inline-flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" />
              Warning
            </p>
            <p className="mt-1">
              This action cannot be undone. The duplicate lead will be archived and all its data will be merged into the primary lead.
            </p>
          </section>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedDuplicateId || loading}
            onClick={() => void onSubmit(Number(selectedDuplicateId))}
            className="inline-flex h-9 items-center gap-1 rounded-md bg-[#8B6FD0] px-3 text-sm font-semibold text-white transition hover:bg-[#7D62C4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Merging..." : "Merge Leads"}
          </button>
        </div>
      </div>
    </div>
  );
};
