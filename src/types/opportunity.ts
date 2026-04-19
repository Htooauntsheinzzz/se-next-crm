import type { TagDto } from "@/types/contact";

export type KanbanState = "NORMAL" | "BLOCKED" | "READY";

export interface Opportunity {
  id: number;
  name: string;
  expectedRevenue: number;
  probability: number;
  priority: number;
  kanbanState: KanbanState;
  deadline: string | null;
  stageId: number;
  salespersonId: number | null;
  teamId: number | null;
  leadId: number | null;
  contactId: number | null;
  lostReasonId: number | null;
  lostNote: string | null;
  notes: string | null;
  wonAt: string | null;
  lostAt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  stageName: string;
  salespersonName: string | null;
  teamName: string | null;
  contactName: string | null;
  weightedRevenue: number;
  tags: TagDto[];
}

export interface OpportunityCreateRequest {
  name: string;
  expectedRevenue?: number;
  probability?: number;
  priority?: number;
  stageId: number;
  salespersonId?: number;
  teamId?: number;
  leadId?: number;
  contactId?: number;
  deadline?: string;
  tagIds?: number[];
}

export interface OpportunityUpdateRequest {
  name?: string;
  expectedRevenue?: number;
  probability?: number;
  priority?: number;
  stageId?: number;
  salespersonId?: number;
  teamId?: number;
  contactId?: number;
  deadline?: string;
  notes?: string;
  tagIds?: number[];
}

export interface MoveStageRequest {
  stageId: number;
}

export interface MarkLostRequest {
  lostReasonId?: number;
  lostNote?: string;
}

export interface UpdateKanbanStateRequest {
  state: KanbanState;
}

export interface OpportunityFilters {
  stageId?: number;
  salespersonId?: number;
  teamId?: number;
  kanbanState?: KanbanState;
  active?: boolean;
  search?: string;
  page?: number;
  size?: number;
}

export interface OpportunityListResponse {
  content: Opportunity[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}
