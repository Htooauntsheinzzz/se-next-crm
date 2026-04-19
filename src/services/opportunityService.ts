import api from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type {
  KanbanState,
  MarkLostRequest,
  Opportunity,
  OpportunityCreateRequest,
  OpportunityFilters,
  OpportunityListResponse,
  OpportunityUpdateRequest,
} from "@/types/opportunity";
import type { PipelineStageDto } from "@/types/pipeline";

export interface KanbanColumnDto {
  stage: PipelineStageDto;
  opportunities: Opportunity[];
  count: number;
  totalRevenue: number;
}

export interface KanbanViewDto {
  columns: KanbanColumnDto[];
  totalPipelineValue: number;
}

type RawPipelineStage = Partial<PipelineStageDto> & {
  won?: boolean | number | string | null;
  lost?: boolean | number | string | null;
  is_won?: boolean | number | string | null;
  is_lost?: boolean | number | string | null;
  display_order?: number | string | null;
  opportunity_count?: number | string | null;
};

type RawKanbanColumn = {
  stage?: RawPipelineStage | null;
  opportunities?: Opportunity[] | null;
  count?: number | string | null;
  totalRevenue?: number | string | null;
  total_revenue?: number | string | null;
};

type RawKanbanView = {
  columns?: RawKanbanColumn[] | null;
  totalPipelineValue?: number | string | null;
  total_pipeline_value?: number | string | null;
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

const normalizeStage = (raw: RawPipelineStage | null | undefined): PipelineStageDto => ({
  id: toNumber(raw?.id, 0),
  name: String(raw?.name ?? ""),
  displayOrder: toNumber(raw?.displayOrder ?? raw?.display_order, 0),
  probability: toNumber(raw?.probability, 0),
  isWon: toBoolean(raw?.isWon ?? raw?.won ?? raw?.is_won),
  isLost: toBoolean(raw?.isLost ?? raw?.lost ?? raw?.is_lost),
  opportunityCount: toNumber(raw?.opportunityCount ?? raw?.opportunity_count, 0),
});

const normalizeKanban = (raw: RawKanbanView | null | undefined): KanbanViewDto => ({
  columns: (raw?.columns ?? []).map((column) => ({
    stage: normalizeStage(column.stage),
    opportunities: column.opportunities ?? [],
    count: toNumber(column.count, 0),
    totalRevenue: toNumber(column.totalRevenue ?? column.total_revenue, 0),
  })),
  totalPipelineValue: toNumber(raw?.totalPipelineValue ?? raw?.total_pipeline_value, 0),
});

const cleanParams = (params: OpportunityFilters) => {
  const normalized: Record<string, string | number | boolean> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    normalized[key] = value;
  });

  return normalized;
};

export const opportunityService = {
  getKanban: async (teamId?: number): Promise<KanbanViewDto> => {
    const response = await api.get<ApiResponse<RawKanbanView>>("/crm/v1/opportunities/kanban", {
      params: { teamId },
    });
    return normalizeKanban(response.data.data);
  },

  getAll: async (params: OpportunityFilters): Promise<OpportunityListResponse> => {
    const response = await api.get<ApiResponse<OpportunityListResponse>>("/crm/v1/opportunities", {
      params: cleanParams(params),
    });
    return response.data.data;
  },

  getById: async (id: number): Promise<Opportunity> => {
    const response = await api.get<ApiResponse<Opportunity>>(`/crm/v1/opportunities/${id}`);
    return response.data.data;
  },

  create: async (data: OpportunityCreateRequest): Promise<Opportunity> => {
    const response = await api.post<ApiResponse<Opportunity>>("/crm/v1/opportunities", data);
    return response.data.data;
  },

  update: async (id: number, data: OpportunityUpdateRequest): Promise<Opportunity> => {
    const response = await api.put<ApiResponse<Opportunity>>(`/crm/v1/opportunities/${id}`, data);
    return response.data.data;
  },

  moveStage: async (id: number, stageId: number): Promise<Opportunity> => {
    const response = await api.patch<ApiResponse<Opportunity>>(`/crm/v1/opportunities/${id}/stage`, {
      stageId,
    });
    return response.data.data;
  },

  markWon: async (id: number): Promise<Opportunity> => {
    const response = await api.post<ApiResponse<Opportunity>>(`/crm/v1/opportunities/${id}/won`);
    return response.data.data;
  },

  markLost: async (id: number, data: MarkLostRequest): Promise<Opportunity> => {
    const response = await api.post<ApiResponse<Opportunity>>(`/crm/v1/opportunities/${id}/lost`, data);
    return response.data.data;
  },

  restore: async (id: number): Promise<Opportunity> => {
    const response = await api.post<ApiResponse<Opportunity>>(`/crm/v1/opportunities/${id}/restore`);
    return response.data.data;
  },

  updateKanbanState: async (id: number, state: KanbanState): Promise<Opportunity> => {
    const response = await api.patch<ApiResponse<Opportunity>>(
      `/crm/v1/opportunities/${id}/kanban-state`,
      { state },
    );
    return response.data.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/crm/v1/opportunities/${id}`);
    return response.data;
  },
};
