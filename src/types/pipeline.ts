export interface PipelineStageDto {
  id: number;
  name: string;
  displayOrder: number;
  probability: number;
  isWon: boolean;
  isLost: boolean;
  opportunityCount: number;
}

export interface StageCreateRequest {
  name: string;
  probability?: number;
  isWon?: boolean;
  isLost?: boolean;
}

export interface StageUpdateRequest {
  name?: string;
  probability?: number;
  isWon?: boolean;
  isLost?: boolean;
}

export interface ReorderRequest {
  stageIds: number[];
}

export interface LostReasonDto {
  id: number;
  name: string;
  active: boolean;
}

export interface CreateLostReasonRequest {
  name: string;
}
