import api from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type { SalesTeam, TeamCreateRequest, TeamUpdateRequest } from "@/types/team";
import type { User } from "@/types/user";

export const teamService = {
  getAll: async (): Promise<SalesTeam[]> => {
    const response = await api.get<ApiResponse<SalesTeam[]>>("/crm/v1/teams");
    return response.data.data;
  },

  getById: async (id: string): Promise<SalesTeam> => {
    const response = await api.get<ApiResponse<SalesTeam>>(`/crm/v1/teams/${id}`);
    return response.data.data;
  },

  create: async (data: TeamCreateRequest): Promise<SalesTeam> => {
    const response = await api.post<ApiResponse<SalesTeam>>("/crm/v1/teams", data);
    return response.data.data;
  },

  update: async (id: string, data: TeamUpdateRequest): Promise<SalesTeam> => {
    const response = await api.put<ApiResponse<SalesTeam>>(`/crm/v1/teams/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/crm/v1/teams/${id}`);
    return response.data;
  },

  getMembers: async (id: string): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>(`/crm/v1/teams/${id}/members`);
    return response.data.data;
  },

  assignMember: async (teamId: string, userId: string) => {
    const response = await api.post<ApiResponse<null>>(
      `/crm/v1/teams/${teamId}/members/${userId}`,
    );
    return response.data;
  },

  removeMember: async (teamId: string, userId: string) => {
    const response = await api.delete<ApiResponse<null>>(
      `/crm/v1/teams/${teamId}/members/${userId}`,
    );
    return response.data;
  },

  setLeader: async (teamId: string, userId: string): Promise<SalesTeam> => {
    const response = await api.patch<ApiResponse<SalesTeam>>(
      `/crm/v1/teams/${teamId}/leader/${userId}`,
    );
    return response.data.data;
  },
};
