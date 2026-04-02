import { formatDistanceToNow } from "date-fns";
import { Briefcase, Circle, UserRound, Users } from "lucide-react";
import type { RecentFeedItem } from "@/types/dashboard";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { WidgetState } from "@/components/dashboard/WidgetState";

interface RecentActivityFeedProps {
  data: RecentFeedItem[];
  error?: string;
  onRetry: () => void;
}

const getEntityAppearance = (entityType: string) => {
  const key = entityType.toLowerCase();

  if (key.includes("opportunity")) {
    return { Icon: Briefcase, color: "text-[#8B5CF6]", bg: "bg-[#F5F3FF]" };
  }

  if (key.includes("contact")) {
    return { Icon: Users, color: "text-[#10B981]", bg: "bg-[#ECFDF5]" };
  }

  return { Icon: UserRound, color: "text-[#3B82F6]", bg: "bg-[#EFF6FF]" };
};

const getRelativeTime = (timestamp: string) => {
  const parsedDate = new Date(timestamp);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Just now";
  }

  return formatDistanceToNow(parsedDate, { addSuffix: true });
};

export const RecentActivityFeed = ({ data, error, onRetry }: RecentActivityFeedProps) => {
  if (error) {
    return (
      <WidgetCard title="Recent Activity Feed">
        <WidgetState mode="error" message="Failed to load recent activity" onRetry={onRetry} />
      </WidgetCard>
    );
  }

  if (data.length === 0) {
    return (
      <WidgetCard title="Recent Activity Feed">
        <WidgetState mode="empty" message="No activity feed entries available" />
      </WidgetCard>
    );
  }

  const visibleItems = data.slice(0, 10);

  return (
    <WidgetCard
      title="Recent Activity Feed"
      action={
        <button type="button" className="text-sm font-medium text-[#6366F1] hover:underline">
          View All
        </button>
      }
    >
      <ul className="space-y-3">
        {visibleItems.map((item, index) => {
          const appearance = getEntityAppearance(item.entityType);
          const Icon = appearance.Icon;

          return (
            <li key={item.id + index} className="relative rounded-lg border border-slate-100 px-4 py-3 hover:bg-slate-50/60">
              <div className="flex items-start gap-3">
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${appearance.bg}`}>
                  <Icon className={`h-4 w-4 ${appearance.color}`} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700">
                    <a href="#" className="font-semibold text-slate-900 hover:text-[#6366F1]">
                      {item.entityName}
                    </a>{" "}
                    {item.action}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span>By {item.performedBy}</span>
                    <Circle className="h-1.5 w-1.5 fill-current" />
                    <span>{getRelativeTime(item.timestamp)}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </WidgetCard>
  );
};
