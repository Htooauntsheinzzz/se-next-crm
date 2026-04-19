"use client";

import { useCallback, useEffect, useState } from "react";
import { activityService } from "@/services/activityService";
import { getApiMessage } from "@/lib/utils";
import type { Activity } from "@/types/activity";

interface UseActivitiesParams {
  done?: boolean;
  page?: number;
  size?: number;
  enabled?: boolean;
  teamId?: number;
}

interface UseActivitiesResult {
  activities: Activity[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useActivities = ({
  done,
  page = 0,
  size = 20,
  enabled = true,
  teamId,
}: UseActivitiesParams): UseActivitiesResult => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentPage, setCurrentPage] = useState(page);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await activityService.getAll({ done, page, size, teamId });
      setActivities(response.content ?? []);
      setCurrentPage(Number((response as { currentPage?: number; page?: number }).currentPage ?? (response as { page?: number }).page ?? page));
      setTotalPages(Number(response.totalPages ?? 0));
      setTotalElements(Number(response.totalElements ?? 0));
    } catch (err) {
      setError(getApiMessage(err, "Failed to load activities"));
    } finally {
      setLoading(false);
    }
  }, [done, enabled, page, size, teamId]);

  useEffect(() => {
    void fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    currentPage,
    totalPages,
    totalElements,
    loading,
    error,
    refetch: fetchActivities,
  };
};
