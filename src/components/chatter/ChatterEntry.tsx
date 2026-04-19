import { format } from "date-fns";
import { ChatterTypeBadge } from "@/components/chatter/ChatterTypeBadge";
import type { ChatterMessage } from "@/types/chatter";

interface ChatterEntryProps {
  message: ChatterMessage;
  isLast: boolean;
}

const getMessageDateLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return format(date, "yyyy-MM-dd h:mm a");
};

const getInitials = (value: string | null) => {
  if (!value) {
    return "U";
  }

  const parts = value.split(" ").filter(Boolean);
  if (parts.length === 0) {
    return "U";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
};

export const ChatterEntry = ({ message, isLast }: ChatterEntryProps) => {
  const isSystemType = message.type === "SYSTEM" || message.type === "ACTIVITY_LOG";
  const authorLabel = isSystemType ? "System" : message.authorName ?? "System";
  const avatarText = isSystemType ? (message.type === "ACTIVITY_LOG" ? "A" : "S") : getInitials(authorLabel);

  return (
    <article className={`py-3 ${isLast ? "" : "border-b border-slate-100"}`}>
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
            isSystemType
              ? "bg-slate-200 text-slate-600"
              : "bg-[#8B6FD0] text-white"
          }`}
        >
          {avatarText}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <p className={`font-semibold ${isSystemType ? "text-slate-600" : "text-slate-800"}`}>
              {authorLabel}
            </p>
            <span className="text-slate-300">·</span>
            <p className="text-xs text-slate-400">{getMessageDateLabel(message.createdAt)}</p>
            <span className="text-slate-300">·</span>
            <ChatterTypeBadge type={message.type} />
          </div>

          {message.subject ? (
            <p className="mt-1 text-sm font-semibold text-slate-700">{message.subject}</p>
          ) : null}
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{message.body}</p>
        </div>
      </div>
    </article>
  );
};
