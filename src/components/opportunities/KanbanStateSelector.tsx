import { AlertCircle, CheckCircle2, Circle } from "lucide-react";
import type { KanbanState } from "@/types/opportunity";
import { mergeClassNames } from "@/lib/utils";

interface KanbanStateSelectorProps {
  value: KanbanState;
  onChange?: (value: KanbanState) => void;
  disabled?: boolean;
}

const options: Array<{
  value: KanbanState;
  label: string;
  icon: typeof Circle;
  className: string;
  activeBorder: string;
}> = [
  {
    value: "NORMAL",
    label: "Normal",
    icon: Circle,
    className: "text-slate-500",
    activeBorder: "border-slate-300",
  },
  {
    value: "BLOCKED",
    label: "Blocked",
    icon: AlertCircle,
    className: "text-red-500",
    activeBorder: "border-red-500",
  },
  {
    value: "READY",
    label: "Ready",
    icon: CheckCircle2,
    className: "text-green-500",
    activeBorder: "border-green-500",
  },
];

export const KanbanStateSelector = ({
  value,
  onChange,
  disabled = false,
}: KanbanStateSelectorProps) => {
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(option.value)}
            className={mergeClassNames(
              "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
              isActive ? option.activeBorder : "border-slate-200",
              disabled ? "cursor-not-allowed opacity-60" : "hover:bg-slate-50",
            )}
          >
            <Icon className={mergeClassNames("h-4 w-4", option.className)} />
            <span className="text-slate-700">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
