"use client";

import type { ReactNode } from "react";

interface RankedListItemProps {
  rank: number;
  title: string;
  subtitle?: string;
  rightContent: ReactNode;
}

const getRankCircleClassName = (rank: number) => {
  if (rank === 1) return "bg-purple-600";
  if (rank === 2) return "bg-purple-500";
  if (rank === 3) return "bg-purple-400";
  return "bg-slate-400";
};

export const RankedListItem = ({ rank, title, subtitle, rightContent }: RankedListItemProps) => {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-4 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${getRankCircleClassName(rank)}`}>
          {rank}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{title}</p>
          {subtitle ? <p className="truncate text-xs text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      <div className="shrink-0">{rightContent}</div>
    </div>
  );
};
