"use client";

import { ReportHeader } from "@/components/reports/shared/ReportHeader";

export default function WonLostReportsPage() {
  return (
    <div className="space-y-4">
      <ReportHeader
        title="Won/Lost Reports"
        subtitle="Win ratio and loss reason analysis"
        backHref="/reports"
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        This report view is reserved for the next iteration.
      </div>
    </div>
  );
}
