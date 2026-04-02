import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiResponse, LoginResponse } from "@/types/auth";
import { session } from "@/lib/session";

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const redirectToLogin = () => {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = session.getRefreshToken();

  if (!refreshToken) {
    session.clearSession();
    return null;
  }

  try {
    const response = await axios.post<ApiResponse<LoginResponse>>(
      `${baseURL}/crm/v1/auth/refresh`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const payload = response.data;

    if (!payload.success || !payload.data?.accessToken) {
      throw new Error(payload.message || "Unable to refresh session");
    }

    session.setSession(payload.data);
    return payload.data.accessToken;
  } catch {
    session.clearSession();
    return null;
  }
};

api.interceptors.request.use((config) => {
  const token = session.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isUnauthorized = error.response?.status === 401;
    const requestUrl = String(originalRequest.url ?? "");
    const isRefreshRequest = requestUrl.includes("/crm/v1/auth/refresh");
    const shouldSkipRefresh = [
      "/crm/v1/auth/login",
      "/crm/v1/auth/register",
      "/crm/v1/auth/password-reset/request",
      "/crm/v1/auth/password-reset/confirm",
    ].some((path) => requestUrl.includes(path));

    if (
      !isUnauthorized ||
      originalRequest._retry ||
      isRefreshRequest ||
      shouldSkipRefresh
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newAccessToken = await refreshPromise;

    if (!newAccessToken) {
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    return api(originalRequest);
  },
);

export default api;
