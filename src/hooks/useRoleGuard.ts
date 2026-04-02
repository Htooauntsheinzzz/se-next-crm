"use client";

import { useMemo } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const useRoleGuard = () => {
  const { currentUser, loading, error, refetch } = useCurrentUser();

  const role = currentUser?.role;

  return useMemo(
    () => ({
      role,
      loading,
      error,
      refetch,
      isAdmin: role === "ADMIN",
      isManager: role === "SALES_MANAGER",
      isRep: role === "SALES_REP",
    }),
    [role, loading, error, refetch],
  );
};
