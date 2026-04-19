import api from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type {
  AssignRequest,
  Lead,
  LeadCreateRequest,
  LeadFilters,
  LeadListResponse,
  LeadStats,
  LeadUpdateRequest,
  MergeRequest,
} from "@/types/lead";

const cleanParams = (params: LeadFilters) => {
  const normalized: Record<string, string | number> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    normalized[key] = value;
  });

  return normalized;
};

export const leadService = {
  getAll: async (params: LeadFilters): Promise<LeadListResponse> => {
    const response = await api.get<ApiResponse<LeadListResponse>>("/crm/v1/leads", {
      params: cleanParams(params),
    });
    return response.data.data;
  },

  getById: async (id: number): Promise<Lead> => {
    const response = await api.get<ApiResponse<Lead>>(`/crm/v1/leads/${id}`);
    return response.data.data;
  },

  create: async (data: LeadCreateRequest): Promise<Lead> => {
    const response = await api.post<ApiResponse<Lead>>("/crm/v1/leads", data);
    return response.data.data;
  },

  update: async (id: number, data: LeadUpdateRequest): Promise<Lead> => {
    const response = await api.put<ApiResponse<Lead>>(`/crm/v1/leads/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/crm/v1/leads/${id}`);
    return response.data;
  },

  convert: async (id: number): Promise<Lead> => {
    const response = await api.post<ApiResponse<Lead>>(`/crm/v1/leads/${id}/convert`);
    return response.data.data;
  },

  assign: async (id: number, data: AssignRequest): Promise<Lead> => {
    const response = await api.patch<ApiResponse<Lead>>(`/crm/v1/leads/${id}/assign`, data);
    return response.data.data;
  },

  merge: async (id: number, data: MergeRequest): Promise<Lead> => {
    const response = await api.post<ApiResponse<Lead>>(`/crm/v1/leads/${id}/merge`, data);
    return response.data.data;
  },

  getStats: async (): Promise<LeadStats> => {
    const response = await api.get<ApiResponse<Record<string, number>>>("/crm/v1/leads/stats");
    return response.data.data;
  },
};
