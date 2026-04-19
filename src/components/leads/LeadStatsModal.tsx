"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { LeadStats } from "@/types/lead";
import { leadStatusColor, leadStatusLabel, leadStatusOrder } from "@/components/leads/leadConfig";

interface LeadStatsModalProps {
  open: boolean;
  stats: LeadStats;
  onClose: () => void;
}

export const LeadStatsModal = ({ open, stats, onClose }: LeadStatsModalProps) => {
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

  const total = leadStatusOrder.reduce((sum, status) => sum + (stats[status] ?? 0), 0);
  const converted = stats.CONVERTED ?? 0;
  const conversionRate = total > 0 ? (converted / total) * 100 : 0;
  const activeLeads = (stats.NEW ?? 0) + (stats.CONTACTED ?? 0) + (stats.QUALIFIED ?? 0);
  const closedLeads = (stats.CONVERTED ?? 0) + (stats.LOST ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Leads</p>
            <h3 className="text-3xl font-semibold text-slate-900">{total}</h3>
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
          <section className="rounded-lg border border-green-200 bg-green-50 px-3 py-2">
            <p className="text-2xl font-semibold text-green-700">{conversionRate.toFixed(1)}%</p>
            <p className="text-sm text-green-700">
              {converted} converted out of {total} total leads
            </p>
          </section>

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status Breakdown</h4>
            <div className="mt-2 flex h-8 overflow-hidden rounded-md bg-slate-100">
              {leadStatusOrder.map((status) => {
                const count = stats[status] ?? 0;
                const width = total > 0 ? `${(count / total) * 100}%` : "0%";
                if (count === 0) {
                  return null;
                }

                return (
                  <div
                    key={`segment-${status}`}
                    className="flex items-center justify-center text-[10px] font-semibold text-white"
                    style={{ width, backgroundColor: leadStatusColor[status] }}
                  >
                    {count}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 space-y-2">
              {leadStatusOrder.map((status) => {
                const count = stats[status] ?? 0;
                const percent = total > 0 ? Math.round((count / total) * 100) : 0;

                return (
                  <div key={`row-${status}`} className="flex items-center justify-between text-sm">
                    <div className="inline-flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: leadStatusColor[status] }}
                      />
                      <span className="text-slate-700">{leadStatusLabel[status]}</span>
                    </div>
                    <div className="inline-flex items-center gap-3 text-slate-600">
                      <span>{percent}%</span>
                      <span>{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <article className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-xs font-medium text-slate-500">Active Leads</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{activeLeads}</p>
            </article>
            <article className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-xs font-medium text-slate-500">Closed Leads</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{closedLeads}</p>
            </article>
          </section>
        </div>

        <div className="border-t border-slate-200 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-full items-center justify-center rounded-md border border-[#8B6FD0] text-sm font-semibold text-[#8B6FD0] transition hover:bg-purple-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
