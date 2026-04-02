"use client";

import { useCallback, useEffect, useState } from "react";
import { teamService } from "@/services/teamService";
import type { SalesTeam } from "@/types/team";
import type { User } from "@/types/user";
import { getApiMessage } from "@/lib/utils";

interface UseTeamResult {
  team: SalesTeam | null;
  members: User[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTeam = (id: string): UseTeamResult => {
  const [team, setTeam] = useState<SalesTeam | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeam = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setTeam(null);
      setMembers([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [teamResponse, membersResponse] = await Promise.all([
        teamService.getById(id),
        teamService.getMembers(id),
      ]);

      setTeam(teamResponse);
      setMembers(membersResponse ?? []);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load team"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchTeam();
  }, [fetchTeam]);

  return { team, members, loading, error, refetch: fetchTeam };
};
