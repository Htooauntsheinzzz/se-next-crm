import type { KanbanState } from "@/types/opportunity";
import type { PipelineStageDto } from "@/types/pipeline";

export const stageColors = [
  "#F59E0B",
  "#3B82F6",
  "#8B5CF6",
  "#EF4444",
  "#6366F1",
  "#14B8A6",
  "#EC4899",
];

export const wonColor = "#10B981";
export const lostColor = "#EF4444";

export const stateMeta: Record<
  KanbanState,
  { label: string; icon: "normal" | "blocked" | "ready"; className: string }
> = {
  NORMAL: {
    label: "Normal",
    icon: "normal",
    className: "text-slate-500 border-slate-200",
  },
  BLOCKED: {
    label: "Blocked",
    icon: "blocked",
    className: "text-red-500 border-red-200",
  },
  READY: {
    label: "Ready",
    icon: "ready",
    className: "text-green-500 border-green-200",
  },
};

export const getStageColor = (stage: PipelineStageDto, index: number) => {
  if (stage.isWon) {
    return wonColor;
  }

  if (stage.isLost) {
    return lostColor;
  }

  return stageColors[index % stageColors.length];
};

export const formatCompactCurrency = (value: number | null | undefined) => {
  const safeValue = Number.isFinite(value) ? Number(value) : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(safeValue);
};

export const formatCurrency = (value: number | null | undefined) => {
  const safeValue = Number.isFinite(value) ? Number(value) : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(safeValue);
};

export const toSafeNumber = (value: unknown) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
