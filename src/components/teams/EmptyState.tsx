import { Users2 } from "lucide-react";

interface EmptyStateProps {
  message: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ message, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-16 text-center shadow-sm mt-8">
      <Users2 className="h-12 w-12 text-slate-300" />
      <p className="mt-4 text-sm font-medium text-slate-600 max-w-md">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
