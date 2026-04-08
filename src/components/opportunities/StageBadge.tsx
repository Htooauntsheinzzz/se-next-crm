import type { PipelineStageDto } from "@/types/pipeline";
import { getStageColor } from "@/components/opportunities/opportunityConfig";

interface StageBadgeProps {
  stageName: string;
  stage?: PipelineStageDto;
  stageIndex?: number;
}

const toRgba = (hex: string, alpha: number) => {
  const safe = hex.replace("#", "");
  if (safe.length !== 6) {
    return `rgba(139,111,208,${alpha})`;
  }

  const r = Number.parseInt(safe.slice(0, 2), 16);
  const g = Number.parseInt(safe.slice(2, 4), 16);
  const b = Number.parseInt(safe.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const StageBadge = ({ stageName, stage, stageIndex = 0 }: StageBadgeProps) => {
  const color = stage ? getStageColor(stage, stageIndex) : "#8B6FD0";

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{
        color,
        backgroundColor: toRgba(color, 0.16),
      }}
    >
      {stageName}
    </span>
  );
};
