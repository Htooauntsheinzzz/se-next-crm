"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiMessage } from "@/lib/utils";
import { pipelineService } from "@/services/pipelineService";
import type { LostReasonDto } from "@/types/pipeline";

interface UseLostReasonsResult {
  reasons: LostReasonDto[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useLostReasons = (enabled = true): UseLostReasonsResult => {
  const [reasons, setReasons] = useState<LostReasonDto[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchReasons = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      setError(null);
      setReasons([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await pipelineService.getLostReasons();
      setReasons(response ?? []);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load lost reasons"));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void fetchReasons();
  }, [fetchReasons]);

  return {
    reasons,
    loading,
    error,
    refetch: fetchReasons,
  };
};
