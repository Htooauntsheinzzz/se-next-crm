"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiMessage } from "@/lib/utils";
import {
  opportunityService,
  type KanbanColumnDto,
  type KanbanViewDto,
} from "@/services/opportunityService";

const EMPTY_COLUMNS: KanbanColumnDto[] = [];

interface UseKanbanViewResult {
  columns: KanbanColumnDto[];
  totalPipelineValue: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useKanbanView = (teamId?: number): UseKanbanViewResult => {
  const [data, setData] = useState<KanbanViewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKanban = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await opportunityService.getKanban(teamId);
      setData(response);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load kanban view"));
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    void fetchKanban();
  }, [fetchKanban]);

  return {
    columns: data?.columns ?? EMPTY_COLUMNS,
    totalPipelineValue: data?.totalPipelineValue ?? 0,
    loading,
    error,
    refetch: fetchKanban,
  };
};
