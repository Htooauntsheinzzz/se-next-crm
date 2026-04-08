import api from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type {
  LostReasonDto,
  PipelineStageDto,
  StageCreateRequest,
  StageUpdateRequest,
} from "@/types/pipeline";

type RawPipelineStage = Partial<PipelineStageDto> & {
  won?: boolean;
  lost?: boolean;
  is_won?: boolean | number | string | null;
  is_lost?: boolean | number | string | null;
  display_order?: number | string | null;
  opportunity_count?: number | string | null;
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: unknown) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes") {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no") {
      return false;
    }
  }

  return false;
};

const normalizeStage = (raw: RawPipelineStage): PipelineStageDto => ({
  id: toNumber(raw.id, 0),
  name: String(raw.name ?? ""),
  displayOrder: toNumber(raw.displayOrder ?? raw.display_order, 0),
  probability: toNumber(raw.probability, 0),
  isWon: toBoolean(raw.isWon ?? raw.won ?? raw.is_won),
  isLost: toBoolean(raw.isLost ?? raw.lost ?? raw.is_lost),
  opportunityCount: toNumber(raw.opportunityCount ?? raw.opportunity_count, 0),
});

export const pipelineService = {
  getStages: async (): Promise<PipelineStageDto[]> => {
    const response = await api.get<ApiResponse<RawPipelineStage[]>>("/crm/v1/pipeline/stages");
    return (response.data.data ?? []).map(normalizeStage);
  },

  createStage: async (data: StageCreateRequest): Promise<PipelineStageDto> => {
    const response = await api.post<ApiResponse<RawPipelineStage>>("/crm/v1/pipeline/stages", data);
    return normalizeStage(response.data.data ?? {});
  },

  updateStage: async (id: number, data: StageUpdateRequest): Promise<PipelineStageDto> => {
    const response = await api.put<ApiResponse<RawPipelineStage>>(`/crm/v1/pipeline/stages/${id}`, data);
    return normalizeStage(response.data.data ?? {});
  },

  deleteStage: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/crm/v1/pipeline/stages/${id}`);
    return response.data;
  },

  reorderStages: async (stageIds: number[]) => {
    const response = await api.put<ApiResponse<null>>("/crm/v1/pipeline/stages/reorder", {
      stageIds,
    });
    return response.data;
  },

  getLostReasons: async (): Promise<LostReasonDto[]> => {
    const response = await api.get<ApiResponse<LostReasonDto[]>>("/crm/v1/pipeline/lost-reasons");
    return response.data.data;
  },

  createLostReason: async (name: string): Promise<LostReasonDto> => {
    const response = await api.post<ApiResponse<LostReasonDto>>(
      "/crm/v1/pipeline/lost-reasons",
      {
        name,
      },
    );
    return response.data.data;
  },

  deleteLostReason: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/crm/v1/pipeline/lost-reasons/${id}`);
    return response.data;
  },
};
