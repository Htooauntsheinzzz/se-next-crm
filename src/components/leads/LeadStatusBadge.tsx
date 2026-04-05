import type { LeadStatus } from "@/types/lead";
import { leadStatusLabel } from "@/components/leads/leadConfig";

interface LeadStatusBadgeProps {
  status: LeadStatus;
}

const statusClassMap: Record<LeadStatus, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-amber-100 text-amber-700",
  QUALIFIED: "bg-green-100 text-green-700",
  CONVERTED: "bg-purple-100 text-purple-700",
  LOST: "bg-red-100 text-red-700",
};

export const LeadStatusBadge = ({ status }: LeadStatusBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusClassMap[status]}`}
    >
      {leadStatusLabel[status]}
    </span>
  );
};
