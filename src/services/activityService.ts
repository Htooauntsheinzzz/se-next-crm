import api from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type {
  Activity,
  ActivityCreateRequest,
  ActivityFilters,
  ActivityListResponse,
  ActivitySummary,
  ActivityUpdateRequest,
} from "@/types/activity";

const cleanParams = (params: ActivityFilters = {}) => {
  const normalized: Record<string, string | number | boolean> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    normalized[key] = value;
  });

  return normalized;
};

export const activityService = {
  getAll: async (params: ActivityFilters): Promise<ActivityListResponse> => {
    const response = await api.get<ApiResponse<ActivityListResponse>>("/crm/v1/activities", {
      params: cleanParams(params),
    });
    return response.data.data;
  },

  getMy: async (params: ActivityFilters): Promise<ActivityListResponse> => {
    const response = await api.get<ApiResponse<ActivityListResponse>>("/crm/v1/activities/my", {
      params: cleanParams(params),
    });
    return response.data.data;
  },

  getToday: async (): Promise<Activity[]> => {
    const response = await api.get<ApiResponse<Activity[]>>("/crm/v1/activities/today");
    return response.data.data ?? [];
  },

  getOverdue: async (): Promise<Activity[]> => {
    const response = await api.get<ApiResponse<Activity[]>>("/crm/v1/activities/overdue");
    return response.data.data ?? [];
  },

  getSummary: async (): Promise<ActivitySummary> => {
    const response = await api.get<ApiResponse<Partial<ActivitySummary>>>("/crm/v1/activities/summary");
    return {
      todayCount: Number(response.data.data?.todayCount ?? 0),
      overdueCount: Number(response.data.data?.overdueCount ?? 0),
      thisWeekCount: Number(response.data.data?.thisWeekCount ?? 0),
    };
  },

  getForOpportunity: async (id: number): Promise<Activity[]> => {
    const response = await api.get<ApiResponse<Activity[]>>(`/crm/v1/activities/opportunity/${id}`);
    return response.data.data ?? [];
  },

  getForLead: async (id: number): Promise<Activity[]> => {
    const response = await api.get<ApiResponse<Activity[]>>(`/crm/v1/activities/lead/${id}`);
    return response.data.data ?? [];
  },

  create: async (data: ActivityCreateRequest): Promise<Activity> => {
    const response = await api.post<ApiResponse<Activity>>("/crm/v1/activities", data);
    return response.data.data;
  },

  update: async (id: number, data: ActivityUpdateRequest): Promise<Activity> => {
    const response = await api.put<ApiResponse<Activity>>(`/crm/v1/activities/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/crm/v1/activities/${id}`);
    return response.data;
  },

  markDone: async (id: number): Promise<Activity> => {
    const response = await api.patch<ApiResponse<Activity>>(`/crm/v1/activities/${id}/done`);
    return response.data.data;
  },

  undoDone: async (id: number): Promise<Activity> => {
    const response = await api.patch<ApiResponse<Activity>>(`/crm/v1/activities/${id}/undo`);
    return response.data.data;
  },
};
