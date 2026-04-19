import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Briefcase,
  Building2,
  Calendar,
  Contact,
  LayoutDashboard,
  Layers,
  Settings,
  Target,
  Users,
} from "lucide-react";
import type { Role } from "@/types/user";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "SALES_MANAGER", "SALES_REP"],
  },
  {
    label: "Leads",
    href: "/leads",
    icon: Target,
    roles: ["ADMIN", "SALES_MANAGER", "SALES_REP"],
  },
  {
    label: "Opportunities",
    href: "/opportunities",
    icon: Layers,
    roles: ["ADMIN", "SALES_MANAGER", "SALES_REP"],
  },
  {
    label: "Contacts",
    href: "/contacts",
    icon: Contact,
    roles: ["ADMIN", "SALES_MANAGER", "SALES_REP"],
  },
  {
    label: "Activities",
    href: "/activities",
    icon: Calendar,
    roles: ["ADMIN", "SALES_MANAGER", "SALES_REP"],
  },
  {
    label: "Pipeline",
    href: "/pipeline",
    icon: Briefcase,
    roles: ["ADMIN", "SALES_MANAGER", "SALES_REP"],
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
    roles: ["ADMIN", "SALES_MANAGER", "SALES_REP"],
  },
  {
    label: "Teams",
    href: "/teams",
    icon: Building2,
    roles: ["ADMIN", "SALES_MANAGER", "SALES_REP"],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["ADMIN", "SALES_MANAGER"],
  },
  {
    label: "Settings",
    href: "#",
    icon: Settings,
    roles: ["ADMIN", "SALES_MANAGER", "SALES_REP"],
  },
];
