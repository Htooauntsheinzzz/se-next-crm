export interface SalesTeam {
  id: string;
  name: string;
  description: string | null;
  leaderId: string | null;
  leaderName: string | null;
  targetRevenue: number;
  memberCount: number;
  createdAt: string;
}

export interface TeamCreateRequest {
  name: string;
  leaderId?: string;
  targetRevenue?: number;
  description?: string;
}

export interface TeamUpdateRequest {
  name?: string;
  leaderId?: string;
  targetRevenue?: number;
  description?: string;
}
