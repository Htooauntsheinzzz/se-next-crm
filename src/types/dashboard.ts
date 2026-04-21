export interface DashboardSummary {
  totalLeads: number;
  totalOpportunities: number;
  totalContacts?: number;
  wonOpportunities?: number;
  lostOpportunities?: number;
  openOpportunities?: number;
  totalRevenue: number;
  pipelineValue?: number;
  weightedPipelineValue?: number;
  winRate?: number;
  conversionRate: number;
  openActivities: number;
  overdueActivities: number;
}

export interface PipelineFunnelItem {
  stageName: string;
  count: number;
  totalValue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface TopSalesperson {
  salespersonName: string;
  totalRevenue: number;
  wonDeals: number;
}

export interface LeadsBySource {
  source: string;
  count: number;
}

export interface TeamPerformanceItem {
  teamName: string;
  totalLeads: number;
  totalOpportunities: number;
  totalRevenue: number;
}

export interface ActivitySummaryItem {
  type: string;
  count: number;
}

export interface RecentFeedItem {
  id: number;
  entityType: string;
  entityId: number;
  entityName: string;
  action: string;
  performedBy: string;
  timestamp: string;
}

export interface ConversionFunnelItem {
  stage: string;
  count: number;
  percentage: number;
}

export interface DashboardDataState {
  summary: DashboardSummary | null;
  pipelineFunnel: PipelineFunnelItem[];
  monthlyRevenue: MonthlyRevenue[];
  topSalespersons: TopSalesperson[];
  leadsBySource: LeadsBySource[];
  teamPerformance: TeamPerformanceItem[];
  activitySummary: ActivitySummaryItem[];
  recentFeed: RecentFeedItem[];
  conversionFunnel: ConversionFunnelItem[];
}

export type DashboardWidgetKey = keyof DashboardDataState;
export type DashboardWidgetErrors = Partial<Record<DashboardWidgetKey, string>>;
