"use client";

import { useCallback, useEffect, useState } from "react";
import { leadService } from "@/services/leadService";
import type { Lead } from "@/types/lead";
import { getApiMessage } from "@/lib/utils";

interface UseLeadResult {
  lead: Lead | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useLead = (id: number | null): UseLeadResult => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const fetchLead = useCallback(async () => {
    if (!id) {
      setLead(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await leadService.getById(id);
      setLead(response);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load lead"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchLead();
  }, [fetchLead]);

  return { lead, loading, error, refetch: fetchLead };
};
