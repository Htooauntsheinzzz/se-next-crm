import { Grid3X3, List, Search } from "lucide-react";

interface ContactFiltersProps {
  search: string;
  type: "" | "PERSON" | "COMPANY";
  country: string;
  countries: string[];
  viewMode: "list" | "grid";
  onSearchChange: (value: string) => void;
  onTypeChange: (value: "" | "PERSON" | "COMPANY") => void;
  onCountryChange: (value: string) => void;
  onViewModeChange: (value: "list" | "grid") => void;
}

export const ContactFilters = ({
  search,
  type,
  country,
  countries,
  viewMode,
  onSearchChange,
  onTypeChange,
  onCountryChange,
  onViewModeChange,
}: ContactFiltersProps) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-[60%]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name, email, or company..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] transition focus:ring-2"
          />
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <select
            value={type}
            onChange={(event) => onTypeChange(event.target.value as "" | "PERSON" | "COMPANY")}
            className="h-10 min-w-[120px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
          >
            <option value="">All Types</option>
            <option value="PERSON">Person</option>
            <option value="COMPANY">Company</option>
          </select>

          <select
            value={country}
            onChange={(event) => onCountryChange(event.target.value)}
            className="h-10 min-w-[120px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
          >
            <option value="">All Countries</option>
            {countries.map((countryOption) => (
              <option key={countryOption} value={countryOption}>
                {countryOption}
              </option>
            ))}
          </select>

          <div className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={
                viewMode === "list"
                  ? "inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#8B6FD0] text-white"
                  : "inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
              }
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={
                viewMode === "grid"
                  ? "inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#8B6FD0] text-white"
                  : "inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
              }
              aria-label="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
