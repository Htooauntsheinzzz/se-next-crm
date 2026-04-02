"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { userService } from "@/services/userService";
import type { User } from "@/types/user";
import { getApiMessage } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface UseCurrentUserResult {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCurrentUser = (): UseCurrentUserResult => {
  const { user: authUser, isAuthenticated } = useAuth();
  const authUserId = authUser?.id !== undefined && authUser?.id !== null ? String(authUser.id) : null;
  const requestIdRef = useRef(0);

  const fallbackUser = useMemo<User | null>(() => {
    if (!authUserId || !authUser) {
      return null;
    }

    return {
      id: authUserId,
      firstName: authUser.firstName,
      lastName: authUser.lastName,
      email: authUser.email,
      role: authUser.role,
      teamId:
        authUser.teamId !== undefined && authUser.teamId !== null
          ? String(authUser.teamId)
          : null,
      teamName: authUser.teamName,
      active: authUser.active,
      createdAt: authUser.createdAt,
    };
  }, [authUser, authUserId]);

  const [currentUser, setCurrentUser] = useState<User | null>(fallbackUser);
  const [loading, setLoading] = useState(Boolean(isAuthenticated && authUserId));
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    if (!isAuthenticated || !authUserId) {
      requestIdRef.current += 1;
      setCurrentUser(null);
      setLoading(false);
      setError(null);
      return;
    }

    const currentRequestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError(null);
      const response = await userService.getMe();

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setCurrentUser(response);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setError(getApiMessage(err, "Failed to load profile"));
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [authUserId, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !authUserId) {
      requestIdRef.current += 1;
      setCurrentUser(null);
      setLoading(false);
      setError(null);
      return;
    }

    setCurrentUser(fallbackUser);
    setLoading(true);
    setError(null);

    void fetchCurrentUser();
  }, [authUserId, fallbackUser, fetchCurrentUser, isAuthenticated]);

  return { currentUser, loading, error, refetch: fetchCurrentUser };
};
