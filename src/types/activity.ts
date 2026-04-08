import type { PageResponse } from "@/types/common";

export type ActivityType = "CALL" | "EMAIL" | "MEETING" | "TODO" | "DOCUMENT";

export interface Activity {
  id: number;
  type: ActivityType;
  title: string;
  note: string | null;
  dueDate: string | null;
  doneAt: string | null;
  done: boolean;
  overdue: boolean;
  opportunityId: number | null;
  opportunityName: string | null;
  leadId: number | null;
  leadName: string | null;
  assignedTo: number | null;
  assignedToName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityCreateRequest {
  type: ActivityType;
  title: string;
  note?: string;
  dueDate?: string;
  opportunityId?: number;
  leadId?: number;
  assignedTo?: number;
}

export interface ActivityUpdateRequest {
  type?: ActivityType;
  title?: string;
  note?: string;
  dueDate?: string;
  opportunityId?: number;
  leadId?: number;
  assignedTo?: number;
}

export interface ActivitySummary {
  todayCount: number;
  overdueCount: number;
  thisWeekCount: number;
}

export interface ActivityFilters {
  done?: boolean;
  page?: number;
  size?: number;
  teamId?: number;
}

export type ActivityListResponse = PageResponse<Activity>;
