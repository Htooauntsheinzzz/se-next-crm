"use client";

import { AlertTriangle, CheckCircle2, Clock3, ListTodo } from "lucide-react";
import type { ComponentType } from "react";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { WidgetState } from "@/components/dashboard/WidgetState";
import type { ActivitySummary } from "@/types/report";

interface ActivityOverviewProps {
  data: ActivitySummary | null;
  loading: boolean;
  error?: string;
  onRetry: () => void;
}

interface MiniCardProps {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
}

const MiniCard = ({ label, value, icon: Icon, iconClassName }: MiniCardProps) => (
  <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
    <div className="flex items-center justify-between">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <Icon className={`h-4 w-4 ${iconClassName}`} />
    </div>
    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
  </article>
);

export const ActivityOverview = ({ data, loading, error, onRetry }: ActivityOverviewProps) => {
  if (error) {
    return (
      <WidgetCard title="Activity Overview">
        <WidgetState mode="error" message="Failed to load activity overview" onRetry={onRetry} />
      </WidgetCard>
    );
  }

  if (loading) {
    return (
      <WidgetCard title="Activity Overview">
        <div className="h-[240px] animate-pulse rounded-lg bg-slate-200" />
      </WidgetCard>
    );
  }

  if (!data) {
    return (
      <WidgetCard title="Activity Overview">
        <WidgetState mode="empty" message="No activity data available" />
      </WidgetCard>
    );
  }

  const typeRows = Object.entries(data.byType ?? {}).sort((left, right) => right[1] - left[1]);
  const maxTypeCount = Math.max(...typeRows.map((row) => row[1]), 1);

  return (
    <WidgetCard title="Activity Overview">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MiniCard label="Pending" value={data.totalPending ?? 0} icon={ListTodo} iconClassName="text-amber-600" />
        <MiniCard label="Overdue" value={data.totalOverdue ?? 0} icon={AlertTriangle} iconClassName="text-red-600" />
        <MiniCard
          label="Done Today"
          value={data.totalCompletedToday ?? 0}
          icon={CheckCircle2}
          iconClassName="text-green-600"
        />
        <MiniCard
          label="Done Week"
          value={data.totalCompletedThisWeek ?? 0}
          icon={Clock3}
          iconClassName="text-blue-600"
        />
      </div>

      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-semibold text-slate-800">By Type</h4>
        {typeRows.length === 0 ? (
          <p className="text-sm text-slate-500">No type breakdown available.</p>
        ) : (
          typeRows.map(([type, count]) => (
            <div key={type}>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                <span>{type}</span>
                <span>{count}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-[#8B6DD0]"
                  style={{ width: `${Math.max((count / maxTypeCount) * 100, 8)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </WidgetCard>
  );
};
