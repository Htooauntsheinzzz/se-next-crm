import type { PipelineStageDto } from "@/types/pipeline";
import { getStageColor } from "@/components/opportunities/opportunityConfig";

interface OpportunityStageProgressProps {
  stages: PipelineStageDto[];
  currentStageId: number;
  disabled?: boolean;
  onStageClick?: (stageId: number) => void;
}

export const OpportunityStageProgress = ({
  stages,
  currentStageId,
  disabled = false,
  onStageClick,
}: OpportunityStageProgressProps) => {
  const filtered = stages.filter((stage) => !stage.isLost && !stage.isWon);
  const currentIndex = filtered.findIndex((stage) => stage.id === currentStageId);

  return (
    <div className="overflow-x-auto pb-1">
      <div className="inline-flex min-w-max items-center gap-2">
        {filtered.map((stage, index) => {
          const isCurrent = stage.id === currentStageId;
          const isBeforeCurrent = currentIndex > -1 && index < currentIndex;
          const canClick = !disabled && !isCurrent;

          let backgroundColor = "#E5E7EB";
          let textColor = "#475569";
          let borderColor = "#E2E8F0";

          if (isBeforeCurrent) {
            backgroundColor = "#8B6FD0";
            textColor = "#FFFFFF";
            borderColor = "#8B6FD0";
          } else if (isCurrent) {
            backgroundColor = "#8B6FD0";
            textColor = "#FFFFFF";
            borderColor = "#8B6FD0";
          }

          return (
            <div key={stage.id}>
              <button
                type="button"
                disabled={!canClick}
                onClick={() => {
                  if (canClick) {
                    onStageClick?.(stage.id);
                  }
                }}
                className={`h-10 min-w-[150px] rounded-md border px-3 text-center text-xs font-semibold leading-tight transition ${
                  canClick ? "cursor-pointer hover:brightness-95" : "cursor-default"
                }`}
                style={{
                  backgroundColor,
                  color: textColor,
                  borderColor,
                }}
              >
                <span className="block">{stage.name}</span>
                <span className="block text-[10px] opacity-90">{stage.probability}%</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
