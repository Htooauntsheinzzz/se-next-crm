export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST";

export interface LeadTagDto {
  id: number;
  name: string;
  color: string;
}

export interface Lead {
  id: number;
  contactName: string;
  email: string | null;
  phone: string | null;
  companyName: string | null;
  website: string | null;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  description: string | null;
  status: LeadStatus;
  contactId: number | null;
  assignedTo: number | null;
  assignedToName: string | null;
  teamId: number | null;
  teamName: string | null;
  contactFullName: string | null;
  convertedOppId: number | null;
  convertedAt: string | null;
  score: number;
  tags: LeadTagDto[];
  createdAt: string;
}

export interface LeadCreateRequest {
  contactName: string;
  email?: string;
  phone?: string;
  companyName?: string;
  website?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  description?: string;
  contactId?: number;
  assignedTo?: number;
  teamId?: number;
  tagIds?: number[];
}

export interface LeadUpdateRequest {
  contactName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  website?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  description?: string;
  contactId?: number;
  assignedTo?: number;
  teamId?: number;
  tagIds?: number[];
}

export interface AssignRequest {
  userId: number;
}

export interface MergeRequest {
  duplicateId: number;
}

export interface LeadFilters {
  status?: LeadStatus;
  assignedTo?: number;
  teamId?: number;
  search?: string;
  page?: number;
  size?: number;
}

export interface LeadListResponse {
  content: Lead[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export type LeadStats = Partial<Record<LeadStatus, number>>;

export interface LeadScoreBreakdownDto {
  ruleName: string;
  fieldName: string;
  matched: boolean;
  points: number;
}

export interface LeadScoreResultDto {
  leadId: number;
  totalScore: number;
  breakdown: LeadScoreBreakdownDto[];
}

export interface LeadScoringRuleDto {
  id: number;
  fieldName: string;
  conditionType: string;
  conditionValue: string;
  points: number;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
