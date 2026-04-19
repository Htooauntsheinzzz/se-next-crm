"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

interface ChangeIndicatorProps {
  value: number;
  suffix?: string;
  className?: string;
}

export const ChangeIndicator = ({ value, suffix = "%", className = "" }: ChangeIndicatorProps) => {
  if (!Number.isFinite(value) || value === 0) {
    return <span className={`inline-flex items-center gap-1 text-sm text-slate-400 ${className}`}>0{suffix}</span>;
  }

  if (value > 0) {
    return (
      <span className={`inline-flex items-center gap-1 text-sm font-medium text-green-600 ${className}`}>
        <TrendingUp className="h-3.5 w-3.5" />+{value}{suffix}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium text-red-500 ${className}`}>
      <TrendingDown className="h-3.5 w-3.5" />{value}{suffix}
    </span>
  );
};
