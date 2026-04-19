import Link from "next/link";
import { AlertCircle, Check, Clock3, RotateCcw, Target, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ActivityActions } from "@/components/activities/ActivityActions";
import { ActivityTypeIcon } from "@/components/activities/ActivityTypeIcon";
import { activityTypeMeta } from "@/components/activities/activityConfig";
import { mergeClassNames } from "@/lib/utils";
import type { Activity } from "@/types/activity";

interface ActivityCardProps {
  activity: Activity;
  onMarkDone?: (activity: Activity) => void;
  onUndo?: (activity: Activity) => void;
  onEdit?: (activity: Activity) => void;
  onDelete?: (activity: Activity) => void;
}

const formatDueDate = (value: string | null) => {
  if (!value) {
    return "No due date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }

  return format(date, "yyyy-MM-dd HH:mm");
};

const getInitialsFromName = (value: string | null) => {
  if (!value) {
    return "U";
  }

  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

export const ActivityCard = ({
  activity,
  onMarkDone,
  onUndo,
  onEdit,
  onDelete,
}: ActivityCardProps) => {
  const typeMeta = activityTypeMeta[activity.type];
  const linkedOpportunity = Boolean(activity.opportunityId && activity.opportunityName);
  const linkedLead = Boolean(activity.leadId && activity.leadName);

  return (
    <article
      className={mergeClassNames(
        "rounded-xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm transition hover:shadow-md",
        typeMeta.borderClassName,
        activity.done ? "opacity-70" : "",
      )}
    >
      <div className="flex gap-3">
        <ActivityTypeIcon type={activity.type} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3
                className={mergeClassNames(
                  "text-base font-semibold text-slate-800",
                  activity.done ? "line-through text-slate-500" : "",
                )}
              >
                {activity.title}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{activity.note || "No note"}</p>
            </div>

            <div className="flex items-center gap-2">
              {activity.overdue && !activity.done ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  OVERDUE
                </span>
              ) : null}

              {onEdit && onDelete ? (
                <ActivityActions onEdit={() => onEdit(activity)} onDelete={() => onDelete(activity)} />
              ) : null}

              {activity.done ? (
                <button
                  type="button"
                  onClick={() => onUndo?.(activity)}
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Undo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onMarkDone?.(activity)}
                  className="inline-flex h-8 items-center gap-1 rounded-md bg-green-600 px-3 text-xs font-semibold text-white hover:bg-green-700"
                >
                  <Check className="h-3.5 w-3.5" />
                  Mark Done
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {linkedOpportunity ? (
              <Link
                href={`/opportunities/${activity.opportunityId}`}
                className="inline-flex items-center gap-1 text-[#8B6FD0] hover:underline"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {activity.opportunityName}
              </Link>
            ) : null}

            {linkedLead ? (
              <Link
                href={`/leads/${activity.leadId}`}
                className="inline-flex items-center gap-1 text-[#8B6FD0] hover:underline"
              >
                <Target className="h-3.5 w-3.5" />
                {activity.leadName}
              </Link>
            ) : null}

            <span
              className={mergeClassNames(
                "inline-flex items-center gap-1",
                activity.overdue && !activity.done ? "text-red-500" : "text-[#8B6FD0]",
              )}
            >
              <Clock3 className="h-3.5 w-3.5" />
              {formatDueDate(activity.dueDate)}
            </span>

            <span className="ml-auto inline-flex items-center gap-2 text-sm text-slate-600">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#E9E2FA] text-[10px] font-semibold text-[#7A58BE]">
                {getInitialsFromName(activity.assignedToName)}
              </span>
              {activity.assignedToName ?? "Unassigned"}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
