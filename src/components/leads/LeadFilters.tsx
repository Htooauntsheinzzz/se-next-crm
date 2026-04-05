import { Search } from "lucide-react";
import type { LeadStatus } from "@/types/lead";
import { leadStatusLabel, leadStatusOrder } from "@/components/leads/leadConfig";
import type { User } from "@/types/user";

interface LeadFiltersProps {
  search: string;
  status?: LeadStatus;
  assignedTo?: number;
  users: User[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: LeadStatus | undefined) => void;
  onAssignedToChange: (value: number | undefined) => void;
}

export const LeadFilters = ({
  search,
  status,
  assignedTo,
  users,
  onSearchChange,
  onStatusChange,
  onAssignedToChange,
}: LeadFiltersProps) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-[55%]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name, company, or email..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] transition focus:ring-2"
          />
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <select
            value={status ?? ""}
            onChange={(event) => onStatusChange((event.target.value || undefined) as LeadStatus | undefined)}
            className="h-10 min-w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
          >
            <option value="">All Status</option>
            {leadStatusOrder.map((item) => (
              <option key={item} value={item}>
                {leadStatusLabel[item]}
              </option>
            ))}
          </select>

          <select
            value={assignedTo ?? ""}
            onChange={(event) =>
              onAssignedToChange(event.target.value ? Number(event.target.value) : undefined)
            }
            className="h-10 min-w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
          >
            <option value="">All Users</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
