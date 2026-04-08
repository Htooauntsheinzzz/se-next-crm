import { Star } from "lucide-react";
import { mergeClassNames } from "@/lib/utils";

interface PriorityStarsProps {
  value: number;
  onChange?: (value: number) => void;
  selector?: boolean;
}

const labels = ["Low", "Medium", "High"];

export const PriorityStars = ({ value, onChange, selector = false }: PriorityStarsProps) => {
  const safeValue = Math.min(3, Math.max(1, value || 1));

  if (!selector) {
    return (
      <div className="inline-flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: 3 }).map((_, index) => (
          <Star
            key={`priority-star-${index}`}
            className={mergeClassNames(
              "h-4 w-4",
              index < safeValue ? "fill-current text-amber-400" : "text-slate-300",
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {[1, 2, 3].map((option, index) => {
        const isActive = option === safeValue;

        return (
          <button
            key={`priority-option-${option}`}
            type="button"
            onClick={() => onChange?.(option)}
            className={mergeClassNames(
              "rounded-lg border px-3 py-2 text-left transition",
              isActive
                ? "border-amber-400 bg-amber-50"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            <div className="mb-1 inline-flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: 3 }).map((_, starIndex) => (
                <Star
                  key={`priority-option-${option}-star-${starIndex}`}
                  className={mergeClassNames(
                    "h-3.5 w-3.5",
                    starIndex < option ? "fill-current text-amber-400" : "text-slate-300",
                  )}
                />
              ))}
            </div>
            <p className="text-xs font-medium text-slate-600">{labels[index]}</p>
          </button>
        );
      })}
    </div>
  );
};
