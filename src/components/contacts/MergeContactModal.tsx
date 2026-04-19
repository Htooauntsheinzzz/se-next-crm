"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, GitMerge, Search, X } from "lucide-react";
import { contactService } from "@/services/contactService";
import type { Contact } from "@/types/contact";
import { ContactTypeBadge } from "@/components/contacts/ContactTypeBadge";
import { getApiMessage } from "@/lib/utils";

interface MergeContactModalProps {
  open: boolean;
  primaryContact: Contact | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (duplicateId: number) => Promise<void>;
}

export const MergeContactModal = ({
  open,
  primaryContact,
  loading = false,
  onClose,
  onSubmit,
}: MergeContactModalProps) => {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [results, setResults] = useState<Contact[]>([]);
  const [selectedDuplicateId, setSelectedDuplicateId] = useState<number | null>(null);

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
    if (!open) {
      setQuery("");
      setResults([]);
      setSelectedDuplicateId(null);
      setSearchError(null);
      return;
    }

    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setSearchError(null);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setSearching(true);
        setSearchError(null);
        const response = await contactService.search(query.trim());
        setResults(response ?? []);
      } catch (err) {
        setSearchError(getApiMessage(err, "Failed to search contacts"));
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open, query]);

  const filteredResults = useMemo(
    () =>
      results.filter((contact) => {
        if (!primaryContact) {
          return true;
        }

        return contact.id !== primaryContact.id;
      }),
    [primaryContact, results],
  );

  const selectedContact = filteredResults.find((contact) => contact.id === selectedDuplicateId) ?? null;

  if (!open || !primaryContact) {
    return null;
  }

  const submit = async () => {
    if (!selectedDuplicateId) {
      return;
    }

    await onSubmit(selectedDuplicateId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Merge Contacts</h3>
            <p className="text-sm text-slate-500">Choose a duplicate contact to merge into the primary record.</p>
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
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="font-medium text-slate-800">Primary (kept): {primaryContact.fullName}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Search duplicate contact</label>
            <div className="relative mt-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Type name or email..."
                className="h-10 w-full rounded-md border border-slate-200 pl-10 pr-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] focus:ring-2"
              />
            </div>
            {searchError ? <p className="mt-1 text-xs text-red-600">{searchError}</p> : null}
          </div>

          <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-200">
            {searching ? (
              <div className="space-y-2 p-3">
                <div className="h-8 animate-pulse rounded bg-slate-100" />
                <div className="h-8 animate-pulse rounded bg-slate-100" />
              </div>
            ) : filteredResults.length ? (
              filteredResults.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => setSelectedDuplicateId(contact.id)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${
                    selectedDuplicateId === contact.id ? "bg-purple-50" : "hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <p className="font-medium text-slate-800">{contact.fullName}</p>
                    <p className="text-xs text-slate-500">{contact.email || "No email"}</p>
                  </div>
                  <ContactTypeBadge type={contact.type} />
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-sm text-slate-500">No contacts found</p>
            )}
          </div>

          {selectedContact ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              Duplicate (deactivated): <span className="font-semibold">{selectedContact.fullName}</span>
            </div>
          ) : null}

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <p className="inline-flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              The duplicate contact will be deactivated. Leads will be reassigned to the primary contact.
            </p>
          </div>
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
            onClick={() => void submit()}
            disabled={!selectedDuplicateId || loading}
            className="inline-flex h-9 items-center gap-1 rounded-md bg-[#8B6FD0] px-3 text-sm font-semibold text-white transition hover:bg-[#7D62C4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GitMerge className="h-4 w-4" />
            {loading ? "Merging..." : "Merge Contacts"}
          </button>
        </div>
      </div>
    </div>
  );
};
