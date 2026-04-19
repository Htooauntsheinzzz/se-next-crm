import api from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type {
  ActivityReport,
  ActivitySummary,
  ConversionFunnel,
  DashboardSummary,
  Forecast,
  LeadSource,
  LeadSourceReport,
  LeadReport,
  MonthlyRevenue,
  PipelineFullReport,
  PipelineFunnel,
  PipelineReport,
  RecentActivity,
  SalesReport,
  TeamPerformance,
  TopSalesperson,
  WonLostReport,
} from "@/types/report";

const DASHBOARD_BASE = "/crm/v1/dashboard";
const REPORT_BASE = "/crm/v1/reports";

export const reportService = {
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const { data } = await api.get<ApiResponse<DashboardSummary>>(`${DASHBOARD_BASE}/summary`);
    return data.data;
  },

  getPipelineFunnel: async (teamId?: number): Promise<PipelineFunnel[]> => {
    const { data } = await api.get<ApiResponse<PipelineFunnel[]>>(`${DASHBOARD_BASE}/pipeline-funnel`, {
      params: { teamId },
    });
    return data.data ?? [];
  },

  getMonthlyRevenue: async (params?: {
    months?: number;
    teamId?: number;
  }): Promise<MonthlyRevenue[]> => {
    const { data } = await api.get<ApiResponse<MonthlyRevenue[]>>(`${DASHBOARD_BASE}/monthly-revenue`, {
      params: {
        months: params?.months,
        teamId: params?.teamId,
      },
    });
    return data.data ?? [];
  },

  getTopSalespersons: async (params?: {
    limit?: number;
    teamId?: number;
  }): Promise<TopSalesperson[]> => {
    const { data } = await api.get<ApiResponse<TopSalesperson[]>>(`${DASHBOARD_BASE}/top-salespersons`, {
      params: {
        limit: params?.limit,
        teamId: params?.teamId,
      },
    });
    return data.data ?? [];
  },

  getLeadsBySource: async (teamId?: number): Promise<LeadSource[]> => {
    const { data } = await api.get<ApiResponse<LeadSource[]>>(`${DASHBOARD_BASE}/leads-by-source`, {
      params: { teamId },
    });
    return data.data ?? [];
  },

  getTeamPerformance: async (): Promise<TeamPerformance[]> => {
    const { data } = await api.get<ApiResponse<TeamPerformance[]>>(
      `${DASHBOARD_BASE}/team-performance`,
    );
    return data.data ?? [];
  },

  getActivitySummary: async (): Promise<ActivitySummary> => {
    const { data } = await api.get<ApiResponse<ActivitySummary>>(`${DASHBOARD_BASE}/activity-summary`);
    return data.data;
  },

  getRecentFeed: async (): Promise<RecentActivity[]> => {
    const { data } = await api.get<ApiResponse<RecentActivity[]>>(`${DASHBOARD_BASE}/recent-feed`);
    return data.data ?? [];
  },

  getConversionFunnel: async (teamId?: number): Promise<ConversionFunnel> => {
    const { data } = await api.get<ApiResponse<ConversionFunnel>>(`${DASHBOARD_BASE}/conversion-funnel`, {
      params: { teamId },
    });
    return data.data;
  },

  getDashboard: async (params?: { userId?: number; teamId?: number }): Promise<DashboardSummary> => {
    const { data } = await api.get<ApiResponse<DashboardSummary>>(`${REPORT_BASE}/dashboard`, { params });
    return data.data;
  },

  getPipeline: async (teamId?: number): Promise<PipelineReport> => {
    const { data } = await api.get<ApiResponse<PipelineReport>>(`${REPORT_BASE}/pipeline`, {
      params: { teamId },
    });
    return data.data;
  },

  getForecast: async (months = 3): Promise<Forecast> => {
    const { data } = await api.get<ApiResponse<Forecast>>(`${REPORT_BASE}/forecast`, {
      params: { months },
    });
    return data.data;
  },

  getWonLost: async (params?: {
    from?: string;
    to?: string;
    teamId?: number;
  }): Promise<WonLostReport> => {
    const { data } = await api.get<ApiResponse<WonLostReport>>(`${REPORT_BASE}/won-lost`, { params });
    return data.data;
  },

  getActivities: async (params?: { teamId?: number; from?: string; to?: string }): Promise<ActivityReport> => {
    const { data } = await api.get<ApiResponse<ActivityReport>>(`${REPORT_BASE}/activities`, {
      params,
    });
    return data.data;
  },

  getLeadSources: async (teamId?: number): Promise<LeadSourceReport> => {
    const { data } = await api.get<ApiResponse<LeadSourceReport>>(`${REPORT_BASE}/lead-sources`, {
      params: { teamId },
    });
    return data.data;
  },

  getSalesReport: async (months = 6, teamId?: number): Promise<SalesReport> => {
    const { data } = await api.get<ApiResponse<SalesReport>>(`${REPORT_BASE}/sales`, {
      params: { months, teamId },
    });
    return data.data;
  },

  getPipelineFullReport: async (teamId?: number): Promise<PipelineFullReport> => {
    const { data } = await api.get<ApiResponse<PipelineFullReport>>(`${REPORT_BASE}/pipeline-full`, {
      params: { teamId },
    });
    return data.data;
  },

  getLeadReport: async (months = 6, teamId?: number): Promise<LeadReport> => {
    const { data } = await api.get<ApiResponse<LeadReport>>(`${REPORT_BASE}/leads`, {
      params: { months, teamId },
    });
    return data.data;
  },
};
