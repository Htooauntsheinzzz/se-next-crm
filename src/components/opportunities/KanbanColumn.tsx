import { Plus } from "lucide-react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { KanbanCard } from "@/components/opportunities/KanbanCard";
import { formatCurrency, getStageColor } from "@/components/opportunities/opportunityConfig";
import type { KanbanColumnDto } from "@/services/opportunityService";
import type { Opportunity } from "@/types/opportunity";

interface KanbanColumnProps {
  column: KanbanColumnDto;
  stageIndex: number;
  onCardClick: (opportunity: Opportunity) => void;
  onAddOpportunity: (stageId: number) => void;
}

export const KanbanColumn = ({
  column,
  stageIndex,
  onCardClick,
  onAddOpportunity,
}: KanbanColumnProps) => {
  const color = getStageColor(column.stage, stageIndex);
  const isDroppable = !column.stage.isLost && !column.stage.isWon;
  const canAddOpportunity = !column.stage.isLost && !column.stage.isWon;

  return (
    <div
      className="flex w-[280px] shrink-0 flex-col rounded-xl border border-slate-200 bg-[#F8FAFC] p-3"
      style={{ borderLeftWidth: 4, borderLeftColor: color }}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{column.stage.name}</p>
          <p className="text-xs font-medium text-slate-600">{formatCurrency(column.totalRevenue)}</p>
        </div>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-semibold text-slate-700">
          {column.count}
        </span>
      </div>

      <Droppable droppableId={String(column.stage.id)} isDropDisabled={!isDroppable}>
        {(dropProvided, dropSnapshot) => (
          <div
            ref={dropProvided.innerRef}
            {...dropProvided.droppableProps}
            className={`min-h-[120px] flex-1 space-y-3 rounded-lg transition ${
              dropSnapshot.isDraggingOver ? "bg-[#8B6FD0]/8 p-1" : ""
            }`}
          >
            {column.opportunities.map((opportunity, index) => (
              <Draggable key={opportunity.id} draggableId={String(opportunity.id)} index={index}>
                {(dragProvided) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                  >
                    <KanbanCard
                      opportunity={opportunity}
                      stageColor={color}
                      onClick={onCardClick}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {dropProvided.placeholder}
          </div>
        )}
      </Droppable>

      {canAddOpportunity ? (
        <button
          type="button"
          onClick={() => onAddOpportunity(column.stage.id)}
          className="mt-3 inline-flex items-center justify-center gap-1 rounded-lg border border-transparent px-2 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-200 hover:bg-white"
        >
          <Plus className="h-3.5 w-3.5" />
          Add opportunity
        </button>
      ) : null}
    </div>
  );
};
