"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiMessage } from "@/lib/utils";
import { opportunityService } from "@/services/opportunityService";
import type { Opportunity, OpportunityFilters } from "@/types/opportunity";

interface UseOpportunitiesResult {
  opportunities: Opportunity[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseOpportunitiesParams {
  page: number;
  size: number;
  stageId?: number;
  salespersonId?: number;
  teamId?: number;
  kanbanState?: OpportunityFilters["kanbanState"];
  active?: boolean;
  search?: string;
}

export const useOpportunities = ({
  page,
  size,
  stageId,
  salespersonId,
  teamId,
  kanbanState,
  active,
  search,
}: UseOpportunitiesParams): UseOpportunitiesResult => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [currentPage, setCurrentPage] = useState(page);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await opportunityService.getAll({
        page,
        size,
        stageId,
        salespersonId,
        teamId,
        kanbanState,
        active,
        search: search?.trim() || undefined,
      });

      setOpportunities(response.content ?? []);
      setCurrentPage(response.currentPage ?? page);
      setTotalPages(response.totalPages ?? 0);
      setTotalElements(response.totalElements ?? 0);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load opportunities"));
    } finally {
      setLoading(false);
    }
  }, [active, kanbanState, page, search, size, salespersonId, stageId, teamId]);

  useEffect(() => {
    void fetchOpportunities();
  }, [fetchOpportunities]);

  return {
    opportunities,
    currentPage,
    totalPages,
    totalElements,
    loading,
    error,
    refetch: fetchOpportunities,
  };
};
