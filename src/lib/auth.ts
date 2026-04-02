import api from "@/lib/api";
import type { ApiResponse, LoginResponse } from "@/types/auth";

export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<LoginResponse>>("/crm/v1/auth/login", {
      email,
      password,
    }),

  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => api.post<ApiResponse<string>>("/crm/v1/auth/register", data),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<LoginResponse>>("/crm/v1/auth/refresh", {
      refreshToken,
    }),

  logout: (refreshToken: string) =>
    api.post<ApiResponse<string>>("/crm/v1/auth/logout", {
      refreshToken,
    }),

  requestPasswordReset: (email: string) =>
    api.post<ApiResponse<string>>("/crm/v1/auth/password-reset/request", {
      email,
    }),

  confirmPasswordReset: (token: string, newPassword: string) =>
    api.post<ApiResponse<string>>("/crm/v1/auth/password-reset/confirm", {
      token,
      newPassword,
    }),
};
