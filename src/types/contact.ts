export type ContactType = "PERSON" | "COMPANY";

export interface TagDto {
  id: number;
  name: string;
  color: string;
}

export interface Contact {
  id: number;
  type: ContactType;
  fullName: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  jobTitle: string | null;
  companyName: string | null;
  parentId: number | null;
  parentName: string | null;
  website: string | null;
  linkedinUrl: string | null;
  twitterHandle: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  notes: string | null;
  industry: string | null;
  source: string | null;
  assignedTo: number | null;
  assignedToName: string | null;
  teamId: number | null;
  active: boolean;
  openLeadsCount: number;
  openOpportunitiesCount: number;
  tags: TagDto[];
  createdAt: string;
}

export interface ContactCreateRequest {
  fullName: string;
  type: ContactType;
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  companyName?: string;
  parentId?: number;
  website?: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  notes?: string;
  industry?: string;
  source?: string;
  assignedTo?: number;
  teamId?: number;
  tagIds?: number[];
}

export interface ContactUpdateRequest {
  fullName?: string;
  type?: ContactType;
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  companyName?: string;
  parentId?: number;
  website?: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  notes?: string;
  industry?: string;
  source?: string;
  assignedTo?: number;
  teamId?: number;
  tagIds?: number[];
}

export interface MergeContactRequest {
  duplicateId: number;
}

export interface ContactLeadDto {
  id: number;
  title?: string | null;
  status?: string | null;
  value?: number | null;
  createdAt?: string | null;
}

export interface ContactHistoryDto {
  contact: Contact;
  leads: ContactLeadDto[];
  opportunities: unknown[];
  recentActivities: unknown[];
  recentMessages: unknown[];
  totalLeads: number;
  totalOpportunities: number;
  wonOpportunities: number;
  totalRevenue: number;
}

export interface ContactListResponse {
  content: Contact[];
  page?: number;
  currentPage?: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last?: boolean;
}

export interface ContactFilters {
  search?: string;
  country?: string;
  industry?: string;
  type?: ContactType;
  page?: number;
  size?: number;
}
