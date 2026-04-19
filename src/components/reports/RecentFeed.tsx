"use client";

import { formatDistanceToNow } from "date-fns";
import { Activity, Mail, MessageSquare, Sparkles } from "lucide-react";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { WidgetState } from "@/components/dashboard/WidgetState";
import type { RecentActivity } from "@/types/report";

interface RecentFeedProps {
  data: RecentActivity[];
  loading: boolean;
  error?: string;
  onRetry: () => void;
}

const getDotClassName = (type: string) => {
  const normalized = type.toUpperCase();
  if (normalized.includes("EMAIL")) {
    return { Icon: Mail, iconClassName: "text-blue-500" };
  }
  if (normalized.includes("NOTE") || normalized.includes("CHATTER")) {
    return { Icon: MessageSquare, iconClassName: "text-purple-500" };
  }
  if (normalized.includes("SYSTEM")) {
    return { Icon: Sparkles, iconClassName: "text-slate-500" };
  }
  return { Icon: Activity, iconClassName: "text-emerald-500" };
};

export const RecentFeed = ({ data, loading, error, onRetry }: RecentFeedProps) => {
  if (error) {
    return (
      <WidgetCard title="Recent Activity Feed">
        <WidgetState mode="error" message="Failed to load recent feed" onRetry={onRetry} />
      </WidgetCard>
    );
  }

  if (loading) {
    return (
      <WidgetCard title="Recent Activity Feed">
        <div className="h-[220px] animate-pulse rounded-lg bg-slate-200" />
      </WidgetCard>
    );
  }

  if (!data.length) {
    return (
      <WidgetCard title="Recent Activity Feed">
        <WidgetState mode="empty" message="No recent activity available" />
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title="Recent Activity Feed">
      <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
        {data.slice(0, 10).map((item) => {
          const { Icon, iconClassName } = getDotClassName(item.type || "");
          const timestamp = new Date(item.timestamp);
          const timeLabel = Number.isNaN(timestamp.getTime())
            ? "just now"
            : formatDistanceToNow(timestamp, { addSuffix: true });

          return (
            <div key={item.id} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-none last:pb-0">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                <Icon className={`h-3.5 w-3.5 ${iconClassName}`} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800">{item.userName || "System"}</p>
                <p className="text-sm text-slate-600">
                  {item.title || item.description || "Activity update"}
                  {item.description ? <span className="ml-1 text-slate-500">· {item.description}</span> : null}
                </p>
                <p className="text-xs text-slate-400">{timeLabel}</p>
              </div>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
};
