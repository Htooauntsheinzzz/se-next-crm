"use client";

import { useCallback, useEffect, useState } from "react";
import { leadService } from "@/services/leadService";
import type { Lead, LeadFilters } from "@/types/lead";
import { getApiMessage } from "@/lib/utils";

interface UseLeadsResult {
  leads: Lead[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseLeadsParams {
  page: number;
  size: number;
  status?: LeadFilters["status"];
  assignedTo?: number;
  teamId?: number;
  search?: string;
}

export const useLeads = ({
  page,
  size,
  status,
  assignedTo,
  teamId,
  search,
}: UseLeadsParams): UseLeadsResult => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentPage, setCurrentPage] = useState(page);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await leadService.getAll({
        status,
        assignedTo,
        teamId,
        search: search?.trim() || undefined,
        page,
        size,
      });

      setLeads(response.content ?? []);
      setCurrentPage(response.currentPage ?? page);
      setTotalPages(response.totalPages ?? 0);
      setTotalElements(response.totalElements ?? 0);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load leads"));
    } finally {
      setLoading(false);
    }
  }, [assignedTo, page, search, size, status, teamId]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    currentPage,
    totalPages,
    totalElements,
    loading,
    error,
    refetch: fetchLeads,
  };
};
