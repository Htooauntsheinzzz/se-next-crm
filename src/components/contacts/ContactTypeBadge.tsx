import { Building2, UserRound } from "lucide-react";
import type { ContactType } from "@/types/contact";

interface ContactTypeBadgeProps {
  type: ContactType;
}

export const ContactTypeBadge = ({ type }: ContactTypeBadgeProps) => {
  if (type === "COMPANY") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        <Building2 className="h-3 w-3" />
        Company
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
      <UserRound className="h-3 w-3" />
      Person
    </span>
  );
};
