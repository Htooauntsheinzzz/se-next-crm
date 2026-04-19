"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ListTodo,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import api from "@/lib/api";
import type { ApiResponse } from "@/types/auth";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { WidgetState } from "@/components/dashboard/WidgetState";

/* ───── Types ───── */

interface ActivityDto {
  id: number;
  type: string;
  title: string;
  dueDate: string;
  isDone: boolean;
  relatedEntityType?: string;
  relatedEntityName?: string;
}

interface RepDashboardData {
  activitySummary: Record<string, number>;
  todayActivities: ActivityDto[];
  overdueActivities: ActivityDto[];
  leadStats: Record<string, number>;
  myLeadCount: number;
}

/* ───── Component ───── */

export const SalesRepDashboard = () => {
  const [data, setData] = useState<RepDashboardData>({
    activitySummary: {},
    todayActivities: [],
    overdueActivities: [],
    leadStats: {},
    myLeadCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [summaryRes, todayRes, overdueRes, myLeadsRes] = await Promise.allSettled([
        api.get<ApiResponse<Record<string, number>>>("/crm/v1/activities/summary"),
        api.get<ApiResponse<ActivityDto[]>>("/crm/v1/activities/today"),
        api.get<ApiResponse<ActivityDto[]>>("/crm/v1/activities/overdue"),
        api.get<ApiResponse<{ totalElements: number }>>("/crm/v1/leads", {
          params: { size: 1, page: 0 },
        }),
      ]);

      const myLeadCount =
        myLeadsRes.status === "fulfilled"
          ? myLeadsRes.value.data.data?.totalElements ?? 0
          : 0;

      setData({
        activitySummary:
          summaryRes.status === "fulfilled" ? summaryRes.value.data.data ?? {} : {},
        todayActivities:
          todayRes.status === "fulfilled" ? todayRes.value.data.data ?? [] : [],
        overdueActivities:
          overdueRes.status === "fulfilled" ? overdueRes.value.data.data ?? [] : [],
        leadStats: {},
        myLeadCount,
      });
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="h-[300px] animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  const { activitySummary, todayActivities, overdueActivities, myLeadCount } = data;

  // Backend returns: todayCount, overdueCount, thisWeekCount
  const todayCount = activitySummary.todayCount ?? 0;
  const overdueCount = activitySummary.overdueCount ?? 0;
  const thisWeekCount = activitySummary.thisWeekCount ?? 0;

  return (
    <div className="space-y-6">
      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={ListTodo}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          title="To Do"
          value={todayCount}
          subtitle="Pending tasks"
        />
        <KpiCard
          icon={Calendar}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          title="This Week"
          value={thisWeekCount}
          subtitle="Activities this week"
        />
        <KpiCard
          icon={AlertTriangle}
          iconBg="bg-red-100"
          iconColor="text-red-600"
          title="Overdue"
          value={overdueCount}
          subtitle="Need attention"
        />
        <KpiCard
          icon={Target}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          title="My Leads"
          value={myLeadCount}
          subtitle="Assigned to you"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ─── Today's Activities ─── */}
        <WidgetCard title="Today's Activities">
          {todayActivities.length === 0 ? (
            <WidgetState mode="empty" message="No activities scheduled for today" />
          ) : (
            <div className="space-y-2">
              {todayActivities.slice(0, 8).map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
              {todayActivities.length > 8 && (
                <p className="pt-1 text-center text-xs text-slate-400">
                  +{todayActivities.length - 8} more
                </p>
              )}
            </div>
          )}
        </WidgetCard>

        {/* ─── Overdue Activities ─── */}
        <WidgetCard title="Overdue Activities">
          {overdueActivities.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
              <p className="text-sm font-medium text-green-600">All caught up!</p>
              <p className="text-xs text-slate-400">No overdue activities</p>
            </div>
          ) : (
            <div className="space-y-2">
              {overdueActivities.slice(0, 8).map((activity) => (
                <ActivityRow key={activity.id} activity={activity} isOverdue />
              ))}
              {overdueActivities.length > 8 && (
                <p className="pt-1 text-center text-xs text-slate-400">
                  +{overdueActivities.length - 8} more
                </p>
              )}
            </div>
          )}
        </WidgetCard>
      </div>

    </div>
  );
};

/* ───── Sub-components ───── */

interface KpiCardProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  value: number | string;
  subtitle: string;
}

const KpiCard = ({ icon: Icon, iconBg, iconColor, title, value, subtitle }: KpiCardProps) => (
  <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
      <Icon className={`h-6 w-6 ${iconColor}`} />
    </div>
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
  </div>
);

interface ActivityRowProps {
  activity: ActivityDto;
  isOverdue?: boolean;
}

const TYPE_ICONS: Record<string, string> = {
  CALL: "📞",
  EMAIL: "📧",
  MEETING: "📅",
  TODO: "✅",
  DOCUMENT: "📄",
};

const ActivityRow = ({ activity, isOverdue }: ActivityRowProps) => {
  const dueDate = activity.dueDate
    ? format(new Date(activity.dueDate), "MMM d, h:mm a")
    : "";

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
        isOverdue
          ? "border-red-100 bg-red-50/50 hover:bg-red-50"
          : "border-slate-100 bg-slate-50 hover:bg-slate-100"
      }`}
    >
      <span className="text-lg">{TYPE_ICONS[activity.type] ?? "📋"}</span>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-slate-800">{activity.title}</p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="h-3 w-3" />
          <span>{dueDate}</span>
          {activity.relatedEntityName && (
            <>
              <span className="text-slate-300">·</span>
              <span className="truncate">{activity.relatedEntityName}</span>
            </>
          )}
        </div>
      </div>
      {activity.isDone && (
        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
      )}
      {isOverdue && !activity.isDone && (
        <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-500" />
      )}
    </div>
  );
};
