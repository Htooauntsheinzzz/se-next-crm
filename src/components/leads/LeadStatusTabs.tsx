import type { LeadStatus, LeadStats } from "@/types/lead";
import { leadStatusColor, leadStatusLabel, leadStatusOrder } from "@/components/leads/leadConfig";

export type LeadTabKey = "ALL" | LeadStatus;

interface LeadStatusTabsProps {
  activeTab: LeadTabKey;
  stats: LeadStats;
  onChange: (value: LeadTabKey) => void;
}

export const LeadStatusTabs = ({ activeTab, stats, onChange }: LeadStatusTabsProps) => {
  const total = leadStatusOrder.reduce((sum, status) => sum + (stats[status] ?? 0), 0);

  return (
    <div className="flex flex-wrap items-end gap-5 border-b border-slate-200">
      <button
        type="button"
        onClick={() => onChange("ALL")}
        className={`inline-flex items-center gap-1 border-b-2 px-2 pb-2 text-sm font-medium transition ${
          activeTab === "ALL"
            ? "border-[#8B6FD0] text-[#8B6FD0]"
            : "border-transparent text-slate-500 hover:text-slate-700"
        }`}
      >
        All
        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-100 px-1 text-[10px] font-semibold text-slate-600">
          {total}
        </span>
      </button>

      {leadStatusOrder.map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => onChange(status)}
          className={`inline-flex items-center gap-1 border-b-2 px-2 pb-2 text-sm font-medium transition ${
            activeTab === status
              ? "border-[#8B6FD0] text-[#8B6FD0]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          {leadStatusLabel[status]}
          <span
            className="inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white"
            style={{ backgroundColor: leadStatusColor[status] }}
          >
            {stats[status] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
};
