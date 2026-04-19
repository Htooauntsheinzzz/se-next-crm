"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiMessage } from "@/lib/utils";
import { opportunityService } from "@/services/opportunityService";
import type { Opportunity } from "@/types/opportunity";

interface UseOpportunityResult {
  opportunity: Opportunity | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useOpportunity = (id: number | null): UseOpportunityResult => {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunity = useCallback(async () => {
    if (!id) {
      setOpportunity(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await opportunityService.getById(id);
      setOpportunity(response);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load opportunity"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchOpportunity();
  }, [fetchOpportunity]);

  return {
    opportunity,
    loading,
    error,
    refetch: fetchOpportunity,
  };
};
