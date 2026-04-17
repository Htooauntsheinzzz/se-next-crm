"use client";

import { Download } from "lucide-react";

interface ExportButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const ExportButton = ({ onClick, disabled = false }: ExportButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download className="h-4 w-4" />
      Export
    </button>
  );
};
