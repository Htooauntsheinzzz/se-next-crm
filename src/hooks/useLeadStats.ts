"use client";

import { useCallback, useEffect, useState } from "react";
import { leadService } from "@/services/leadService";
import type { LeadFilters, LeadStats, LeadStatus } from "@/types/lead";
import { getApiMessage } from "@/lib/utils";

interface UseLeadStatsResult {
  stats: LeadStats;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseLeadStatsParams {
  assignedTo?: LeadFilters["assignedTo"];
  teamId?: LeadFilters["teamId"];
  search?: LeadFilters["search"];
}

const emptyStats: LeadStats = {
  NEW: 0,
  CONTACTED: 0,
  QUALIFIED: 0,
  CONVERTED: 0,
  LOST: 0,
};

const statuses: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];

export const useLeadStats = ({ assignedTo, teamId, search }: UseLeadStatsParams = {}): UseLeadStatsResult => {
  const [stats, setStats] = useState<LeadStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const responses = await Promise.all(
        statuses.map((status) =>
          leadService.getAll({
            status,
            assignedTo,
            teamId,
            search: search?.trim() || undefined,
            page: 0,
            size: 1,
          }),
        ),
      );

      const nextStats = statuses.reduce<LeadStats>((acc, status, index) => {
        acc[status] = responses[index]?.totalElements ?? 0;
        return acc;
      }, { ...emptyStats });

      setStats(nextStats);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load lead stats"));
      setStats(emptyStats);
    } finally {
      setLoading(false);
    }
  }, [assignedTo, search, teamId]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};
