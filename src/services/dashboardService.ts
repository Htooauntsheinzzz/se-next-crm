import api from "@/lib/api";
import type { ApiResponse } from "@/types/auth";
import type {
  ActivitySummaryItem,
  ConversionFunnelItem,
  DashboardSummary,
  LeadsBySource,
  MonthlyRevenue,
  PipelineFunnelItem,
  RecentFeedItem,
  TeamPerformanceItem,
  TopSalesperson,
} from "@/types/dashboard";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  typeof value === "object" && value !== null ? (value as UnknownRecord) : {};

const toArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const toNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const toStringValue = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const toTimestampString = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return new Date(value).toISOString();
  }

  return new Date().toISOString();
};

const unwrapData = (response: ApiResponse<unknown>) => response?.data;

const normalizeSummary = (raw: unknown): DashboardSummary => {
  const item = asRecord(raw);

  return {
    totalLeads: toNumber(item.totalLeads),
    totalOpportunities: toNumber(item.totalOpportunities),
    totalContacts: toNumber(item.totalContacts),
    wonOpportunities: toNumber(item.wonOpportunities),
    lostOpportunities: toNumber(item.lostOpportunities),
    openOpportunities: toNumber(item.openOpportunities),
    totalRevenue: toNumber(item.totalRevenue),
    pipelineValue: toNumber(item.pipelineValue),
    weightedPipelineValue: toNumber(item.weightedPipelineValue),
    winRate: toNumber(item.winRate),
    conversionRate: toNumber(item.conversionRate ?? item.winRate),
    openActivities: toNumber(item.openActivities ?? item.totalPending),
    overdueActivities: toNumber(item.overdueActivities),
  };
};

const normalizePipelineFunnel = (raw: unknown): PipelineFunnelItem[] => {
  const rows = toArray(raw)
    .map((entry) => {
      const item = asRecord(entry);

      return {
        stageName: toStringValue(item.stageName, "Unknown"),
        count: toNumber(item.count),
        totalValue: toNumber(item.totalValue ?? item.totalRevenue),
        displayOrder: toNumber(item.displayOrder),
      };
    })
    .filter((item) => item.stageName.length > 0)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return rows.map(({ stageName, count, totalValue }) => ({
    stageName,
    count,
    totalValue,
  }));
};

const normalizeMonthlyRevenue = (raw: unknown): MonthlyRevenue[] => {
  return toArray(raw).map((entry) => {
    const item = asRecord(entry);
    const monthName = toStringValue(item.monthName);
    const month = toNumber(item.month);
    const year = toNumber(item.year);

    return {
      month:
        toStringValue(item.month, "") ||
        monthName ||
        (month > 0 && year > 0 ? `${month}/${year}` : "Unknown"),
      revenue: toNumber(item.revenue ?? item.wonRevenue),
    };
  });
};

const normalizeTopSalespersons = (raw: unknown): TopSalesperson[] => {
  return toArray(raw).map((entry) => {
    const item = asRecord(entry);

    return {
      salespersonName: toStringValue(item.salespersonName || item.fullName, "Unknown"),
      totalRevenue: toNumber(item.totalRevenue ?? item.wonRevenue),
      wonDeals: toNumber(item.wonDeals ?? item.wonCount),
    };
  });
};

const normalizeLeadsBySource = (raw: unknown): LeadsBySource[] => {
  return toArray(raw).map((entry) => {
    const item = asRecord(entry);

    return {
      source: toStringValue(item.source, "Unknown"),
      count: toNumber(item.count),
    };
  });
};

const normalizeTeamPerformance = (raw: unknown): TeamPerformanceItem[] => {
  return toArray(raw).map((entry) => {
    const item = asRecord(entry);

    return {
      teamName: toStringValue(item.teamName, "Unknown"),
      totalLeads: toNumber(item.totalLeads),
      totalOpportunities: toNumber(item.totalOpportunities),
      totalRevenue: toNumber(item.totalRevenue),
    };
  });
};

const normalizeActivitySummary = (raw: unknown): ActivitySummaryItem[] => {
  if (Array.isArray(raw)) {
    return raw.map((entry) => {
      const item = asRecord(entry);

      return {
        type: toStringValue(item.type, "Unknown"),
        count: toNumber(item.count),
      };
    });
  }

  const item = asRecord(raw);
  const byType = asRecord(item.byType);

  const byTypeRows = Object.entries(byType).map(([type, count]) => ({
    type,
    count: toNumber(count),
  }));

  if (byTypeRows.length > 0) {
    return byTypeRows;
  }

  return [
    { type: "Pending", count: toNumber(item.totalPending) },
    { type: "Overdue", count: toNumber(item.totalOverdue) },
    { type: "Completed Today", count: toNumber(item.totalCompletedToday) },
    { type: "Completed Week", count: toNumber(item.totalCompletedThisWeek) },
  ];
};

const normalizeRecentFeed = (raw: unknown): RecentFeedItem[] => {
  return toArray(raw).map((entry, index) => {
    const item = asRecord(entry);

    return {
      id: toNumber(item.id) || index + 1,
      entityType: toStringValue(item.entityType || item.type, "Activity"),
      entityId: toNumber(item.entityId || item.id),
      entityName: toStringValue(item.entityName || item.title, "Activity"),
      action: toStringValue(item.action || item.description || item.type, "updated"),
      performedBy: toStringValue(item.performedBy || item.userName, "System"),
      timestamp: toTimestampString(item.timestamp),
    };
  });
};

const normalizeConversionFunnel = (raw: unknown): ConversionFunnelItem[] => {
  if (Array.isArray(raw)) {
    return raw.map((entry) => {
      const item = asRecord(entry);

      return {
        stage: toStringValue(item.stage, "Unknown"),
        count: toNumber(item.count),
        percentage: toNumber(item.percentage),
      };
    });
  }

  const item = asRecord(raw);
  const totalLeads = toNumber(item.totalLeads);
  const contactedLeads = toNumber(item.contactedLeads);
  const qualifiedLeads = toNumber(item.qualifiedLeads);
  const convertedLeads = toNumber(item.convertedLeads);
  const lostLeads = toNumber(item.lostLeads);

  if (totalLeads === 0 && contactedLeads === 0 && qualifiedLeads === 0 && convertedLeads === 0 && lostLeads === 0) {
    return [];
  }

  const percentOfTotal = (count: number) =>
    totalLeads > 0 ? Number(((count / totalLeads) * 100).toFixed(2)) : 0;

  return [
    { stage: "Leads", count: totalLeads, percentage: totalLeads > 0 ? 100 : 0 },
    { stage: "Contacted", count: contactedLeads, percentage: percentOfTotal(contactedLeads) },
    { stage: "Qualified", count: qualifiedLeads, percentage: percentOfTotal(qualifiedLeads) },
    {
      stage: "Converted",
      count: convertedLeads,
      percentage: toNumber(item.leadToOpportunityRate) || percentOfTotal(convertedLeads),
    },
    { stage: "Lost", count: lostLeads, percentage: percentOfTotal(lostLeads) },
  ];
};

export const dashboardService = {
  getSummary: (teamId?: number) =>
    api
      .get<ApiResponse<unknown>>("/crm/v1/dashboard/summary", { params: { teamId } })
      .then((response) => normalizeSummary(unwrapData(response.data))),

  getPipelineFunnel: () =>
    api
      .get<ApiResponse<unknown>>("/crm/v1/dashboard/pipeline-funnel")
      .then((response) => normalizePipelineFunnel(unwrapData(response.data))),

  getMonthlyRevenue: () =>
    api
      .get<ApiResponse<unknown>>("/crm/v1/dashboard/monthly-revenue")
      .then((response) => normalizeMonthlyRevenue(unwrapData(response.data))),

  getTopSalespersons: () =>
    api
      .get<ApiResponse<unknown>>("/crm/v1/dashboard/top-salespersons")
      .then((response) => normalizeTopSalespersons(unwrapData(response.data))),

  getLeadsBySource: () =>
    api
      .get<ApiResponse<unknown>>("/crm/v1/dashboard/leads-by-source")
      .then((response) => normalizeLeadsBySource(unwrapData(response.data))),

  getTeamPerformance: () =>
    api
      .get<ApiResponse<unknown>>("/crm/v1/dashboard/team-performance")
      .then((response) => normalizeTeamPerformance(unwrapData(response.data))),

  getActivitySummary: () =>
    api
      .get<ApiResponse<unknown>>("/crm/v1/dashboard/activity-summary")
      .then((response) => normalizeActivitySummary(unwrapData(response.data))),

  getRecentFeed: () =>
    api
      .get<ApiResponse<unknown>>("/crm/v1/dashboard/recent-feed")
      .then((response) => normalizeRecentFeed(unwrapData(response.data))),

  getConversionFunnel: () =>
    api
      .get<ApiResponse<unknown>>("/crm/v1/dashboard/conversion-funnel")
      .then((response) => normalizeConversionFunnel(unwrapData(response.data))),
};
