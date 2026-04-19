"use client";

import { ReportHeader } from "@/components/reports/shared/ReportHeader";

export default function LeadSourcesReportsPage() {
  return (
    <div className="space-y-4">
      <ReportHeader
        title="Lead Source Reports"
        subtitle="Source-level conversion and quality analysis"
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        This report view is reserved for the next iteration.
      </div>
    </div>
  );
}
