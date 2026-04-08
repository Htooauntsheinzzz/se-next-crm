import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { getStageColor } from "@/components/opportunities/opportunityConfig";
import type { PipelineStageDto } from "@/types/pipeline";

interface PipelineStageRowProps {
  stage: PipelineStageDto;
  index: number;
  onEdit: (stage: PipelineStageDto) => void;
  onDelete: (stage: PipelineStageDto) => void;
}

export const PipelineStageRow = ({
  stage,
  index,
  onEdit,
  onDelete,
}: PipelineStageRowProps) => {
  const color = getStageColor(stage, index);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <GripVertical className="h-4 w-4 text-slate-400" />
        <span className="h-10 w-1.5 rounded-full" style={{ backgroundColor: color }} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-2xl font-semibold text-slate-900">{stage.name}</p>
            {stage.isWon ? (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Won
              </span>
            ) : null}
            {stage.isLost ? (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                Lost
              </span>
            ) : null}
          </div>
          <p className="text-sm text-slate-500">Probability: {stage.probability}%</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-32 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-[#8B6FD0]"
              style={{ width: `${stage.probability}%` }}
            />
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
            {stage.opportunityCount} opps
          </span>
          <button
            type="button"
            onClick={() => onEdit(stage)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(stage)}
            className="rounded-md p-1.5 text-red-400 hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
