import { Check, ChevronRight, X } from "lucide-react";
import { getStageColor } from "@/components/opportunities/opportunityConfig";
import type { PipelineStageDto } from "@/types/pipeline";

interface PipelinePreviewProps {
  stages: PipelineStageDto[];
}

export const PipelinePreview = ({ stages }: PipelinePreviewProps) => {
  const previewStages = stages.filter((stage) => !stage.isLost);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-slate-700">Pipeline Preview</p>
      <div className="flex flex-wrap items-center gap-2">
        {previewStages.map((stage, index) => {
          const color = getStageColor(stage, index);
          return (
            <div key={stage.id} className="flex items-center gap-2">
              <div
                className="min-w-[96px] rounded-md px-3 py-2 text-center text-xs font-semibold text-white"
                style={{ backgroundColor: color }}
              >
                <p className="flex items-center justify-center gap-1">
                  {stage.isWon ? <Check className="h-3.5 w-3.5" /> : null}
                  {stage.isLost ? <X className="h-3.5 w-3.5" /> : null}
                  {stage.name}
                </p>
                <p className="mt-1 text-[10px] font-medium text-white/90">{stage.probability}%</p>
              </div>
              {index < previewStages.length - 1 ? (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
