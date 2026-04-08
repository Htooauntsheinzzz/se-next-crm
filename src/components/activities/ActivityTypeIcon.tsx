import { activityTypeMeta } from "@/components/activities/activityConfig";
import type { ActivityType } from "@/types/activity";
import { mergeClassNames } from "@/lib/utils";

interface ActivityTypeIconProps {
  type: ActivityType;
  className?: string;
}

export const ActivityTypeIcon = ({ type, className }: ActivityTypeIconProps) => {
  const meta = activityTypeMeta[type];
  const Icon = meta.icon;

  return (
    <span
      className={mergeClassNames(
        "inline-flex h-10 w-10 items-center justify-center rounded-lg",
        meta.iconBgClassName,
        className,
      )}
    >
      <Icon className={mergeClassNames("h-5 w-5", meta.iconClassName)} />
    </span>
  );
};
