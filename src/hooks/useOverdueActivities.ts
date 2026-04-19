"use client";

import { useCallback, useEffect, useState } from "react";
import { activityService } from "@/services/activityService";
import { getApiMessage } from "@/lib/utils";
import type { Activity } from "@/types/activity";

interface UseOverdueActivitiesResult {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useOverdueActivities = (enabled = true): UseOverdueActivitiesResult => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await activityService.getOverdue();
      setActivities(response);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load overdue activities"));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities,
  };
};
