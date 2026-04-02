import { Search } from "lucide-react";
import type { Role, UserFilters as UserFiltersType } from "@/types/user";

interface UserFiltersProps {
  filters: UserFiltersType;
  showInactiveFilter: boolean;
  onChange: (next: UserFiltersType) => void;
}

const roles: Array<{ label: string; value: Role | "ALL" }> = [
  { label: "All Roles", value: "ALL" },
  { label: "Admin", value: "ADMIN" },
  { label: "Sales Manager", value: "SALES_MANAGER" },
  { label: "Sales Rep", value: "SALES_REP" },
];

export const UserFilters = ({ filters, showInactiveFilter, onChange }: UserFiltersProps) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="relative md:col-span-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search ?? ""}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            placeholder="Search by name or email..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-[#F9FAFB] pl-10 pr-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] transition focus:ring-2"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={filters.role ?? "ALL"}
            onChange={(event) => {
              const value = event.target.value as Role | "ALL";
              onChange({ ...filters, role: value === "ALL" ? undefined : value });
            }}
            className="h-11 w-full rounded-lg border border-slate-200 bg-[#F9FAFB] px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] transition focus:ring-2"
          >
            {roles.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={
              typeof filters.active === "boolean" ? (filters.active ? "ACTIVE" : "INACTIVE") : "ALL"
            }
            onChange={(event) => {
              const value = event.target.value;
              onChange({
                ...filters,
                active:
                  value === "ACTIVE"
                    ? true
                    : value === "INACTIVE"
                      ? false
                      : undefined,
              });
            }}
            className="h-11 w-full rounded-lg border border-slate-200 bg-[#F9FAFB] px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] transition focus:ring-2"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            {showInactiveFilter ? <option value="INACTIVE">Inactive</option> : null}
          </select>
        </div>
      </div>
    </div>
  );
};
