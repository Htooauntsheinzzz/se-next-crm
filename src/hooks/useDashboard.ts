"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "@/lib/errors";
import { dashboardService } from "@/services/dashboardService";
import type {
  DashboardDataState,
  DashboardWidgetErrors,
  DashboardWidgetKey,
} from "@/types/dashboard";

const initialDashboardState: DashboardDataState = {
  summary: null,
  pipelineFunnel: [],
  monthlyRevenue: [],
  topSalespersons: [],
  leadsBySource: [],
  teamPerformance: [],
  activitySummary: [],
  recentFeed: [],
  conversionFunnel: [],
};

/** Widgets accessible by ADMIN and SALES_MANAGER only */
const managerEndpoints = [
  { key: "summary", load: dashboardService.getSummary },
  { key: "pipelineFunnel", load: dashboardService.getPipelineFunnel },
  { key: "monthlyRevenue", load: dashboardService.getMonthlyRevenue },
  { key: "topSalespersons", load: dashboardService.getTopSalespersons },
  { key: "leadsBySource", load: dashboardService.getLeadsBySource },
  { key: "teamPerformance", load: dashboardService.getTeamPerformance },
  { key: "recentFeed", load: dashboardService.getRecentFeed },
  { key: "conversionFunnel", load: dashboardService.getConversionFunnel },
] as const;

/** Widgets accessible by all roles (including SALES_REP) */
const allRoleEndpoints = [
  { key: "activitySummary", load: dashboardService.getActivitySummary },
] as const;

export const useDashboard = (role?: string) => {
  const [data, setData] = useState<DashboardDataState>(initialDashboardState);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [widgetErrors, setWidgetErrors] = useState<DashboardWidgetErrors>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const hasBootstrapped = useRef(false);

  const isManagerOrAdmin = role === "ADMIN" || role === "SALES_MANAGER";

  const fetchDashboard = useCallback(async () => {
    const showInitialLoader = !hasBootstrapped.current;

    if (showInitialLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    // Build the list of endpoints based on role
    const endpointDescriptors = [
      ...allRoleEndpoints,
      ...(isManagerOrAdmin ? managerEndpoints : []),
    ];

    const results = await Promise.allSettled(
      endpointDescriptors.map((descriptor) => descriptor.load()),
    );

    setData((previous) => {
      const nextData: DashboardDataState = { ...previous };
      const nextErrors: DashboardWidgetErrors = {};
      let successfulWidgets = 0;

      results.forEach((result, index) => {
        const descriptor = endpointDescriptors[index];
        const key = descriptor.key as DashboardWidgetKey;

        if (result.status === "fulfilled") {
          (nextData as Record<DashboardWidgetKey, unknown>)[key] = result.value;
          successfulWidgets += 1;
          return;
        }

        nextErrors[key] = getApiErrorMessage(result.reason, "Failed to load");
      });

      setWidgetErrors(nextErrors);

      if (successfulWidgets === 0) {
        setError("Failed to load dashboard data.");
      } else {
        setError(null);
        setLastUpdated(new Date());
      }

      return nextData;
    });

    hasBootstrapped.current = true;
    setLoading(false);
    setRefreshing(false);
  }, [isManagerOrAdmin]);

  useEffect(() => {
    void fetchDashboard();

    const intervalId = window.setInterval(() => {
      void fetchDashboard();
    }, 300000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchDashboard]);

  return {
    data,
    loading,
    refreshing,
    error,
    widgetErrors,
    lastUpdated,
    isManagerOrAdmin,
    refetch: fetchDashboard,
  };
};
