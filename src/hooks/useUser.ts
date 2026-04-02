"use client";

import { useCallback, useEffect, useState } from "react";
import { userService } from "@/services/userService";
import type { User } from "@/types/user";
import { getApiMessage } from "@/lib/utils";

interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUser = (id: string): UseUserResult => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!id) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await userService.getById(id);
      setUser(response);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load user"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser };
};
