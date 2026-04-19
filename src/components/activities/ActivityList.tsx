import { ActivityCard } from "@/components/activities/ActivityCard";
import type { Activity } from "@/types/activity";

interface ActivityListProps {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  onMarkDone: (activity: Activity) => void;
  onUndo: (activity: Activity) => void;
  onEdit?: (activity: Activity) => void;
  onDelete?: (activity: Activity) => void;
}

export const ActivityList = ({
  activities,
  loading,
  error,
  onMarkDone,
  onUndo,
  onEdit,
  onDelete,
}: ActivityListProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
        No activities found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onMarkDone={onMarkDone}
          onUndo={onUndo}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
