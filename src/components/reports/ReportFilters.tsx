"use client";

import { Filter, RefreshCcw } from "lucide-react";
import type { SalesTeam } from "@/types/team";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { isRep } from "@/lib/auth/rbac";

interface ReportFiltersProps {
  teams: SalesTeam[];
  teamId?: number;
  from?: string;
  to?: string;
  months: number;
  loading?: boolean;
  onTeamChange: (value?: number) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onMonthsChange: (value: number) => void;
  onApply: () => void;
}

export const ReportFilters = ({
  teams,
  teamId,
  from,
  to,
  months,
  loading = false,
  onTeamChange,
  onFromChange,
  onToChange,
  onMonthsChange,
  onApply,
}: ReportFiltersProps) => {
  const { currentUser } = useCurrentUser();
  const rep = isRep(currentUser);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {!rep && (
          <label className="xl:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Team</span>
            <select
              value={teamId ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                onTeamChange(value ? Number(value) : undefined);
              }}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#8B6DD0] transition focus:ring-2"
            >
              <option value="">All Teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">From</span>
          <input
            type="date"
            value={from ?? ""}
            onChange={(event) => onFromChange(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#8B6DD0] transition focus:ring-2"
          />
        </label>

        <label>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">To</span>
          <input
            type="date"
            value={to ?? ""}
            onChange={(event) => onToChange(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#8B6DD0] transition focus:ring-2"
          />
        </label>

        <label>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Forecast</span>
          <select
            value={months}
            onChange={(event) => onMonthsChange(Number(event.target.value))}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#8B6DD0] transition focus:ring-2"
          >
            <option value={3}>3 months</option>
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onApply}
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#8B6DD0] px-3 text-sm font-semibold text-white transition hover:bg-[#7F61C6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />}
            {loading ? "Applying..." : "Apply"}
          </button>
        </div>
      </div>
    </section>
  );
};
