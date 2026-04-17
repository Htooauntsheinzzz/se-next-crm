"use client";

import type { ComponentType } from "react";
import { ChangeIndicator } from "@/components/reports/shared/ChangeIndicator";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  changePercent?: number;
  icon: ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

export const KpiCard = ({
  title,
  value,
  subtitle,
  changePercent,
  icon: Icon,
  iconBg,
  iconColor,
}: KpiCardProps) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>

      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>

      {typeof changePercent === "number" ? (
        <ChangeIndicator value={changePercent} className="mt-1" />
      ) : subtitle ? (
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      ) : null}
    </article>
  );
};
