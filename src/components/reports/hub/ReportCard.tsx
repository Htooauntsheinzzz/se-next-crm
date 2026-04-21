"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { ChevronRight } from "lucide-react";

interface ReportCardStat {
  label: string;
  value: string;
}

interface ReportCardProps {
  href: string;
  icon: ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  stats: ReportCardStat[];
}

export const ReportCard = ({ href, icon: Icon, iconBg, iconColor, title, subtitle, stats }: ReportCardProps) => {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-[#8B6DD0]">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-400 transition-colors group-hover:text-[#8B6DD0]" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3 sm:gap-4">
        {stats.slice(0, 3).map((item) => (
          <div key={item.label}>
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>
    </Link>
  );
};
