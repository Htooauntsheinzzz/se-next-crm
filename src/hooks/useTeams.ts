"use client";

import { useCallback, useEffect, useState } from "react";
import { teamService } from "@/services/teamService";
import type { SalesTeam } from "@/types/team";
import { getApiMessage } from "@/lib/utils";

interface UseTeamsResult {
  teams: SalesTeam[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTeams = (): UseTeamsResult => {
  const [teams, setTeams] = useState<SalesTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teamService.getAll();
      setTeams(response ?? []);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load teams"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTeams();
  }, [fetchTeams]);

  return { teams, loading, error, refetch: fetchTeams };
};
