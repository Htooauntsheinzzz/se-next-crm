import { Medal } from "lucide-react";
import { formatCurrency, toSafeNumber } from "@/lib/format";
import type { TopSalesperson } from "@/types/dashboard";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { WidgetState } from "@/components/dashboard/WidgetState";

interface TopSalespersonsProps {
  data: TopSalesperson[];
  error?: string;
  onRetry: () => void;
}

export const TopSalespersons = ({ data, error, onRetry }: TopSalespersonsProps) => {
  if (error) {
    return (
      <WidgetCard title="Top Salespersons">
        <WidgetState mode="error" message="Failed to load top performers" onRetry={onRetry} />
      </WidgetCard>
    );
  }

  if (data.length === 0) {
    return (
      <WidgetCard title="Top Salespersons">
        <WidgetState mode="empty" message="No top salesperson data available" />
      </WidgetCard>
    );
  }

  const topFive = data.slice(0, 5);

  return (
    <WidgetCard title="Top Salespersons">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[360px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th className="pb-2">#</th>
              <th className="pb-2">Name</th>
              <th className="pb-2">Won Deals</th>
              <th className="pb-2 text-right">Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {topFive.map((person, index) => (
              <tr key={`${person.salespersonName}-${index}`} className="border-b border-slate-100 last:border-none">
                <td className="py-3">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      index === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {index === 0 ? <Medal className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                </td>
                <td className="py-3 font-medium text-slate-800">{person.salespersonName}</td>
                <td className="py-3 text-slate-600">{toSafeNumber(person.wonDeals)}</td>
                <td className="py-3 text-right font-semibold text-slate-800">
                  {formatCurrency(toSafeNumber(person.totalRevenue))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetCard>
  );
};
