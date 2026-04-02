import type { Role } from "@/types/user";
import { mergeClassNames, roleToLabel } from "@/lib/utils";

interface RoleBadgeProps {
  role: Role;
}

const roleStyles: Record<Role, string> = {
  ADMIN: "bg-[#F3E8FF] text-[#7E22CE]",
  SALES_MANAGER: "bg-[#DBEAFE] text-[#2563EB]",
  SALES_REP: "bg-[#DCFCE7] text-[#15803D]",
};

export const RoleBadge = ({ role }: RoleBadgeProps) => {
  return (
    <span
      className={mergeClassNames(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
        roleStyles[role],
      )}
    >
      {roleToLabel(role)}
    </span>
  );
};
