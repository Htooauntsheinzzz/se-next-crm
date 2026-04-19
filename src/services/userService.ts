import api from "@/lib/api";
import type { ApiResponse, PageResponse } from "@/types/common";
import type {
  ChangePasswordRequest,
  ChangeRoleRequest,
  User,
  UserUpdateRequest,
} from "@/types/user";

export const userService = {
  getAll: async (page = 0, size = 10, teamId?: string): Promise<PageResponse<User>> => {
    let url = `/crm/v1/users?page=${page}&size=${size}`;
    if (teamId) {
      url += `&teamId=${teamId}`;
    }
    const response = await api.get<ApiResponse<PageResponse<User>>>(url);
    return response.data.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>("/crm/v1/users/me");
    return response.data.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/crm/v1/users/${id}`);
    return response.data.data;
  },

  update: async (id: string, data: UserUpdateRequest): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/crm/v1/users/${id}`, data);
    return response.data.data;
  },

  deactivate: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/crm/v1/users/${id}`);
    return response.data;
  },

  activate: async (id: string) => {
    const response = await api.patch<ApiResponse<null>>(`/crm/v1/users/${id}/activate`);
    return response.data;
  },

  changeRole: async (id: string, data: ChangeRoleRequest): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(`/crm/v1/users/${id}/role`, data);
    return response.data.data;
  },

  changePassword: async (id: string, data: ChangePasswordRequest) => {
    const response = await api.put<ApiResponse<null>>(`/crm/v1/users/${id}/password`, data);
    return response.data;
  },
};
