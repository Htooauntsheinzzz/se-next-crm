"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiMessage } from "@/lib/utils";
import { pipelineService } from "@/services/pipelineService";
import type { PipelineStageDto } from "@/types/pipeline";

interface UsePipelineStagesResult {
  stages: PipelineStageDto[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePipelineStages = (): UsePipelineStagesResult => {
  const [stages, setStages] = useState<PipelineStageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pipelineService.getStages();
      const ordered = [...(response ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);
      setStages(ordered);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load pipeline stages"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStages();
  }, [fetchStages]);

  return {
    stages,
    loading,
    error,
    refetch: fetchStages,
  };
};
