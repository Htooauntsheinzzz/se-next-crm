import type { PageResponse } from "@/types/common";

export type NotificationType =
  | "LEAD_ASSIGNED"
  | "OPPORTUNITY_STAGE_CHANGED"
  | "ACTIVITY_ASSIGNED"
  | "MENTIONED";

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  entityType: string | null;
  entityId: number | null;
  actorUserId: number | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export type NotificationListResponse = PageResponse<AppNotification>;

export interface UnreadCount {
  unread: number;
}

export interface NotificationFilters {
  unreadOnly?: boolean;
  page?: number;
  size?: number;
}
