"use client";

import { RankedListItem } from "@/components/reports/shared/RankedListItem";
import { formatCurrency, formatPercent } from "@/lib/reportFormat";
import type { TopOpportunity } from "@/types/report";

interface TopOpportunitiesListProps {
  data: TopOpportunity[];
}

const stageBadgeClass = "inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700";

export const TopOpportunitiesList = ({ data }: TopOpportunitiesListProps) => {
  return (
    <div>
      {data.map((item, index) => (
        <RankedListItem
          key={item.id}
          rank={index + 1}
          title={item.name}
          subtitle={item.companyName}
          rightContent={
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.expectedRevenue)}</p>
              <p className="text-xs text-slate-500">{formatPercent(item.probability, 0)} prob.</p>
              <span className={stageBadgeClass}>{item.stageName}</span>
            </div>
          }
        />
      ))}
    </div>
  );
};
