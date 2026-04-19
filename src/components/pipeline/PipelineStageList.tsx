import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { PipelineStageRow } from "@/components/pipeline/PipelineStageRow";
import type { PipelineStageDto } from "@/types/pipeline";

interface PipelineStageListProps {
  stages: PipelineStageDto[];
  onEdit: (stage: PipelineStageDto) => void;
  onDelete: (stage: PipelineStageDto) => void;
  onReorder: (nextIds: number[]) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canReorder?: boolean;
}

export const PipelineStageList = ({
  stages,
  onEdit,
  onDelete,
  onReorder,
  canEdit = true,
  canDelete = true,
  canReorder = true,
}: PipelineStageListProps) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) {
      return;
    }

    const next = [...stages];
    const [moved] = next.splice(from, 1);
    if (!moved) {
      return;
    }
    next.splice(to, 0, moved);
    onReorder(next.map((stage) => stage.id));
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="pipeline-stage-list">
        {(dropProvided) => (
          <div
            ref={dropProvided.innerRef}
            {...dropProvided.droppableProps}
            className="space-y-3"
          >
            {stages.map((stage, index) => (
              <Draggable key={stage.id} draggableId={String(stage.id)} index={index} isDragDisabled={!canReorder}>
                {(dragProvided) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                  >
                    <PipelineStageRow
                      stage={stage}
                      index={index}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      canReorder={canReorder}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {dropProvided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
