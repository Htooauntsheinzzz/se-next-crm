"use client";

import { useCallback, useEffect, useState } from "react";
import { userService } from "@/services/userService";
import type { User } from "@/types/user";
import { getApiMessage } from "@/lib/utils";

interface UseUsersResult {
  users: User[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUsers = (page = 0, size = 10): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(page);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.getAll(page, size);
      setUsers(response.content ?? []);
      setCurrentPage(response.currentPage ?? page);
      setTotalPages(response.totalPages ?? 0);
      setTotalElements(response.totalElements ?? 0);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    currentPage,
    totalPages,
    totalElements,
    loading,
    error,
    refetch: fetchUsers,
  };
};
