import { mergeClassNames } from "@/lib/utils";
import type { MessageType } from "@/types/chatter";

interface ChatterTypeBadgeProps {
  type: MessageType;
}

const typeMeta: Record<MessageType, { label: string; className: string }> = {
  NOTE: {
    label: "note",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
  EMAIL_SENT: {
    label: "email",
    className: "border-blue-200 bg-blue-50 text-blue-600",
  },
  EMAIL_RECEIVED: {
    label: "email",
    className: "border-green-200 bg-green-50 text-green-600",
  },
  SYSTEM: {
    label: "system",
    className: "border-slate-200 bg-slate-100 text-slate-500",
  },
  ACTIVITY_LOG: {
    label: "activity",
    className: "border-purple-200 bg-purple-50 text-purple-600",
  },
};

export const ChatterTypeBadge = ({ type }: ChatterTypeBadgeProps) => {
  const meta = typeMeta[type];

  return (
    <span
      className={mergeClassNames(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
};
