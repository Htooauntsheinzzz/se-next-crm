import type { LucideIcon } from "lucide-react";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

interface ForbiddenStateProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  icon?: LucideIcon;
}

export const ForbiddenState = ({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  icon: Icon = ShieldAlert,
}: ForbiddenStateProps) => {
  return (
    <div className="mx-auto mt-12 flex max-w-md flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <h2 className="mt-6 text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      <Link
        href={ctaHref}
        className="mt-6 inline-flex h-9 items-center justify-center rounded-md bg-[#8B6FD0] px-4 text-sm font-semibold text-white transition hover:bg-[#7D62C4]"
      >
        {ctaLabel}
      </Link>
    </div>
  );
};
