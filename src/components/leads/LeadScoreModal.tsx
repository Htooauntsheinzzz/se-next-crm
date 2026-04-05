"use client";

import { useEffect } from "react";
import { CheckCircle2, Sparkles, X, XCircle } from "lucide-react";
import type { Lead, LeadScoreResultDto } from "@/types/lead";

interface LeadScoreModalProps {
  open: boolean;
  lead: Lead | null;
  score: LeadScoreResultDto | null;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
}

export const LeadScoreModal = ({
  open,
  lead,
  score,
  loading = false,
  error,
  onClose,
}: LeadScoreModalProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("keydown", onEscape);
    };
  }, [onClose, open]);

  if (!open || !lead) {
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
              <Sparkles className="h-4 w-4 text-[#8B6FD0]" />
              Lead Score
            </h3>
            <p className="text-sm text-slate-500">{lead.contactName}</p>
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
          {loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-16 rounded-md bg-slate-100" />
              <div className="h-8 rounded-md bg-slate-100" />
              <div className="h-8 rounded-md bg-slate-100" />
            </div>
          ) : null}

          {!loading && error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          {!loading && !error && score ? (
            <>
              <div className="rounded-md border border-purple-200 bg-purple-50 px-3 py-2">
                <p className="text-xs text-slate-500">Total Score</p>
                <p className="text-2xl font-semibold text-[#6A4E97]">{score.totalScore}</p>
              </div>

              <div className="space-y-2">
                {score.breakdown.map((item, index) => (
                  <div
                    key={`${item.ruleName}-${item.fieldName}-${index}`}
                    className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.ruleName}</p>
                      <p className="text-xs text-slate-500">Field: {item.fieldName}</p>
                    </div>
                    <div className="text-right">
                      <p className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                        {item.matched ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-slate-400" />
                        )}
                        {item.matched ? "Matched" : "Not matched"}
                      </p>
                      <p className="text-sm font-semibold text-slate-800">{item.points} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>

        <div className="border-t border-slate-200 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-full items-center justify-center rounded-md border border-[#8B6FD0] text-sm font-semibold text-[#8B6FD0] transition hover:bg-purple-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
