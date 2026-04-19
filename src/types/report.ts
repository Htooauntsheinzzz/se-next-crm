export interface DashboardSummary {
  totalLeads: number;
  totalOpportunities: number;
  totalContacts: number;
  wonOpportunities: number;
  lostOpportunities: number;
  openOpportunities: number;
  totalRevenue: number;
  pipelineValue: number;
  weightedPipelineValue: number;
  winRate: number;
  overdueActivities: number;
}

export interface PipelineFunnel {
  stageId: number;
  stageName: string;
  displayOrder: number;
  count: number;
  totalRevenue: number;
}

export interface MonthlyRevenue {
  year: number;
  month: number;
  monthName: string;
  wonRevenue: number;
  wonCount: number;
  lostRevenue: number;
  lostCount: number;
}

export interface TopSalesperson {
  userId: number;
  fullName: string;
  wonCount: number;
  wonRevenue: number;
  activeOpportunities: number;
  activePipelineValue: number;
}

export interface LeadSource {
  source: string;
  count: number;
  convertedCount: number;
  conversionRate: number;
}

export interface TeamPerformance {
  teamId: number;
  teamName: string;
  totalOpportunities: number;
  wonOpportunities: number;
  totalRevenue: number;
  winRate: number;
}

export interface ActivitySummary {
  totalPending: number;
  totalOverdue: number;
  totalCompletedToday: number;
  totalCompletedThisWeek: number;
  byType: Record<string, number>;
}

export interface RecentActivity {
  id: number;
  type: string;
  title: string;
  description: string;
  userName: string;
  timestamp: string;
}

export interface ConversionFunnel {
  totalLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  lostLeads: number;
  leadToOpportunityRate: number;
  opportunityToWinRate: number;
}

export interface PipelineReport {
  byStage: StageRevenue[];
  bySalesperson: SalespersonRevenue[];
  totalPipelineValue: number;
  weightedPipelineValue: number;
  totalOpportunities: number;
}

export interface StageRevenue {
  stageId: number;
  stageName: string;
  count: number;
  totalRevenue: number;
  avgProbability: number;
}

export interface SalespersonRevenue {
  userId: number;
  userName: string;
  count: number;
  totalRevenue: number;
  wonCount: number;
}

export interface Forecast {
  months: MonthForecast[];
  totalForecast: number;
}

export interface MonthForecast {
  year: number;
  month: number;
  monthName: string;
  expectedRevenue: number;
  wonRevenue: number;
  count: number;
}

export interface WonLostReport {
  wonCount: number;
  lostCount: number;
  winRate: number;
  wonRevenue: number;
  lostRevenue: number;
  byLostReason: LostReasonCount[];
}

export interface LostReasonCount {
  reason: string;
  count: number;
  percentage: number;
}

export interface ActivityReport {
  totalActivities: number;
  doneCount: number;
  overdueCount: number;
  pendingCount: number;
  completionRate: number;
  byUser: UserActivitySummary[];
  byType: ActivityTypeCount[];
  trend: MonthlyActivityTrend[];
}

export interface UserActivitySummary {
  userId: number;
  userName: string;
  total: number;
  done: number;
  overdue: number;
}

export interface ActivityTypeCount {
  type: string;
  count: number;
  done: number;
  overdue: number;
}

export interface MonthlyActivityTrend {
  year: number;
  month: number;
  monthName: string;
  created: number;
  completed: number;
}

export interface LeadSourceReport {
  bySources: SourceCount[];
}

export interface SourceCount {
  source: string;
  count: number;
  convertedCount: number;
  conversionRate: number;
}

export interface SalesReport {
  totalRevenue: number;
  avgDealSize: number;
  winRate: number;
  dealsClosed: number;
  dealsLost: number;
  revenueChangePercent: number;
  avgDealSizeChangePercent: number;
  winRateChangePercent: number;
  revenueTrend: MonthlyRevenueTrend[];
  dealsByStage: DealsByStage[];
  dealSizeDistribution: DealSizeRange[];
  topOpportunities: TopOpportunity[];
}

export interface MonthlyRevenueTrend {
  year: number;
  month: number;
  monthName: string;
  revenue: number;
  target: number;
}

export interface DealsByStage {
  stageName: string;
  wonCount: number;
  lostCount: number;
}

export interface DealSizeRange {
  range: string;
  count: number;
  totalValue: number;
}

export interface TopOpportunity {
  id: number;
  name: string;
  companyName: string;
  expectedRevenue: number;
  probability: number;
  stageName: string;
}

export interface PipelineFullReport {
  pipelineValue: number;
  totalOpportunities: number;
  avgDealSize: number;
  conversionRate: number;
  avgCycleTimeDays: number;
  cycleTimeChangeFromLastQuarter: number;
  stageAnalysis: StageAnalysis[];
  conversionFunnel: StageFunnel[];
  salesVelocity: MonthlyVelocity[];
  pipelineCoverage: MonthlyCoverage[];
}

export interface StageAnalysis {
  stageId: number;
  stageName: string;
  count: number;
  totalValue: number;
  avgDaysInStage: number;
  conversionRate: number;
}

export interface StageFunnel {
  stageName: string;
  count: number;
  percentage: number;
  conversionToNext: number;
}

export interface MonthlyVelocity {
  year: number;
  month: number;
  monthName: string;
  avgDaysToClose: number;
}

export interface MonthlyCoverage {
  year: number;
  month: number;
  monthName: string;
  pipelineValue: number;
  quota: number;
  coverageRatio: number;
}

export interface LeadReport {
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  avgTimeToQualifyDays: number;
  leadsChangePercent: number;
  conversionRateChangePercent: number;
  sourcePerformance: LeadSourcePerformance[];
  leadTrends: MonthlyLeadTrend[];
  leadQuality: LeadQuality[];
  industryBreakdown: IndustryBreakdown[];
  conversionBySource: SourceConversion[];
  topLeadSources: TopLeadSource[];
}

export interface LeadSourcePerformance {
  source: string;
  totalLeads: number;
  convertedCount: number;
  conversionRate: number;
}

export interface MonthlyLeadTrend {
  year: number;
  month: number;
  monthName: string;
  newLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
}

export interface LeadQuality {
  label: string;
  count: number;
  percentage: number;
}

export interface IndustryBreakdown {
  industry: string;
  count: number;
}

export interface SourceConversion {
  source: string;
  conversionRate: number;
}

export interface TopLeadSource {
  source: string;
  totalLeads: number;
  qualifiedCount: number;
  convertedCount: number;
  conversionRate: number;
}
