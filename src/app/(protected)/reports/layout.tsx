"use client";

import type { ReactNode } from "react";
import { BarChart3 } from "lucide-react";
import { ForbiddenState } from "@/components/ForbiddenState";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { canViewReports } from "@/lib/auth/rbac";

export default function ReportsLayout({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useCurrentUser();

  if (loading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />;
  }

  if (!canViewReports(currentUser)) {
    return (
      <ForbiddenState
        title="Reports aren't available for your role"
        subtitle="Reports are visible to admins and sales managers. If you need a specific report, ask your manager."
        ctaLabel="Back to Dashboard"
        ctaHref="/dashboard"
        icon={BarChart3}
      />
    );
  }

  return <>{children}</>;
}
