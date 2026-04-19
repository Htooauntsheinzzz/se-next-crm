import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "@/components/opportunities/KanbanColumn";
import type { KanbanColumnDto } from "@/services/opportunityService";
import type { Opportunity } from "@/types/opportunity";

interface KanbanBoardProps {
  columns: KanbanColumnDto[];
  onDragEnd: (result: DropResult) => void;
  onCardClick: (opportunity: Opportunity) => void;
  onAddOpportunity: (stageId: number) => void;
}

export const KanbanBoard = ({
  columns,
  onDragEnd,
  onCardClick,
  onAddOpportunity,
}: KanbanBoardProps) => {
  return (
    <div className="no-scrollbar max-h-[72vh] overflow-x-auto overflow-y-auto rounded-xl border border-slate-200 bg-white p-3">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex min-w-max items-start gap-3">
          {columns.map((column, index) => (
            <KanbanColumn
              key={column.stage.id}
              column={column}
              stageIndex={index}
              onCardClick={onCardClick}
              onAddOpportunity={onAddOpportunity}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};
