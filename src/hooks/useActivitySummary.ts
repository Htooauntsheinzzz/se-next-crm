"use client";

import { useCallback, useEffect, useState } from "react";
import { activityService } from "@/services/activityService";
import { getApiMessage } from "@/lib/utils";
import type { ActivitySummary } from "@/types/activity";

interface UseActivitySummaryResult {
  summary: ActivitySummary;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const EMPTY_SUMMARY: ActivitySummary = {
  todayCount: 0,
  overdueCount: 0,
  thisWeekCount: 0,
};

export const useActivitySummary = (): UseActivitySummaryResult => {
  const [summary, setSummary] = useState<ActivitySummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await activityService.getSummary();
      setSummary(response);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load activity summary"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
  };
};
