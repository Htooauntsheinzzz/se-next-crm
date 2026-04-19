import { AlertCircle } from "lucide-react";
import { summaryCardMeta } from "@/components/activities/activityConfig";
import { mergeClassNames } from "@/lib/utils";

export type ActivityQuickFilter = "all" | "today" | "overdue" | "week" | "done";

interface ActivitySummaryCardsProps {
  todayCount: number;
  overdueCount: number;
  thisWeekCount: number;
  doneCount: number;
  activeFilter: ActivityQuickFilter;
  onSelect: (filter: ActivityQuickFilter) => void;
}

export const ActivitySummaryCards = ({
  todayCount,
  overdueCount,
  thisWeekCount,
  doneCount,
  activeFilter,
  onSelect,
}: ActivitySummaryCardsProps) => {
  const cards: Array<{
    id: ActivityQuickFilter;
    label: string;
    value: number;
    iconClassName: string;
    valueClassName: string;
    Icon: (typeof summaryCardMeta)["today"]["icon"];
  }> = [
    {
      id: "today",
      label: summaryCardMeta.today.label,
      value: todayCount,
      iconClassName: summaryCardMeta.today.iconClassName,
      valueClassName: summaryCardMeta.today.valueClassName,
      Icon: summaryCardMeta.today.icon,
    },
    {
      id: "overdue",
      label: summaryCardMeta.overdue.label,
      value: overdueCount,
      iconClassName: summaryCardMeta.overdue.iconClassName,
      valueClassName: summaryCardMeta.overdue.valueClassName,
      Icon: summaryCardMeta.overdue.icon,
    },
    {
      id: "week",
      label: summaryCardMeta.week.label,
      value: thisWeekCount,
      iconClassName: summaryCardMeta.week.iconClassName,
      valueClassName: summaryCardMeta.week.valueClassName,
      Icon: summaryCardMeta.week.icon,
    },
    {
      id: "done",
      label: summaryCardMeta.done.label,
      value: doneCount,
      iconClassName: summaryCardMeta.done.iconClassName,
      valueClassName: summaryCardMeta.done.valueClassName,
      Icon: summaryCardMeta.done.icon,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map((card) => {
        const selected = activeFilter === card.id;
        const overdueSelected = card.id === "overdue" && selected;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect(card.id)}
            className={mergeClassNames(
              "rounded-xl border bg-white px-5 py-4 text-left transition hover:shadow-sm",
              overdueSelected
                ? "border-[#8B6FD0] ring-2 ring-[#8B6FD0]/15"
                : selected
                  ? "border-slate-300"
                  : "border-slate-200",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50">
                <card.Icon className={mergeClassNames("h-4 w-4", card.iconClassName)} />
                {card.id === "overdue" && overdueCount > 0 ? (
                  <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />
                ) : null}
              </span>
            </div>
            <p className={mergeClassNames("mt-4 text-4xl font-semibold leading-tight", card.valueClassName)}>
              {card.value}
            </p>
            {card.id === "overdue" && overdueCount > 0 ? (
              <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-500">
                <AlertCircle className="h-3.5 w-3.5" />
                Needs attention
              </p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};
