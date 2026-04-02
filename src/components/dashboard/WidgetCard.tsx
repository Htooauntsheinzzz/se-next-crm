import type { ReactNode } from "react";

interface WidgetCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export const WidgetCard = ({ title, children, className = "", action }: WidgetCardProps) => {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {action}
      </header>
      {children}
    </section>
  );
};
