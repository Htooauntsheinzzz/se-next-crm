import api from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type {
  NotificationFilters,
  NotificationListResponse,
  UnreadCount,
} from "@/types/notification";

const cleanParams = (params: NotificationFilters = {}) => {
  const normalized: Record<string, string | number | boolean> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    normalized[key] = value;
  });

  return normalized;
};

export const notificationService = {
  list: async (params: NotificationFilters = {}): Promise<NotificationListResponse> => {
    const response = await api.get<ApiResponse<NotificationListResponse>>(
      "/crm/v1/notifications",
      { params: cleanParams(params) },
    );
    return response.data.data;
  },

  unreadCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<UnreadCount>>(
      "/crm/v1/notifications/unread-count",
    );
    return Number(response.data.data?.unread ?? 0);
  },

  markRead: async (id: number): Promise<void> => {
    await api.post<ApiResponse<null>>(`/crm/v1/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await api.post<ApiResponse<UnreadCount>>("/crm/v1/notifications/read-all");
  },
};
