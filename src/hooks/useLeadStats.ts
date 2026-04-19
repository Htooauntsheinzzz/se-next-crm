"use client";

import { useCallback, useEffect, useState } from "react";
import { leadService } from "@/services/leadService";
import type { LeadStats } from "@/types/lead";
import { getApiMessage } from "@/lib/utils";

interface UseLeadStatsResult {
  stats: LeadStats;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const emptyStats: LeadStats = {
  NEW: 0,
  CONTACTED: 0,
  QUALIFIED: 0,
  CONVERTED: 0,
  LOST: 0,
};

export const useLeadStats = (): UseLeadStatsResult => {
  const [stats, setStats] = useState<LeadStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await leadService.getStats();
      setStats({
        ...emptyStats,
        ...response,
      });
    } catch (err) {
      setError(getApiMessage(err, "Failed to load lead stats"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};
