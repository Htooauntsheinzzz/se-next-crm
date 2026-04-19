import {
  AlertCircle,
  CheckCircle,
  CheckSquare,
  Clock,
  Clock3,
  FileText,
  Mail,
  Phone,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { ActivityType } from "@/types/activity";

export interface ActivityTypeMeta {
  label: string;
  icon: LucideIcon;
  iconClassName: string;
  iconBgClassName: string;
  borderClassName: string;
}

export const activityTypeMeta: Record<ActivityType, ActivityTypeMeta> = {
  CALL: {
    label: "Call",
    icon: Phone,
    iconClassName: "text-purple-600",
    iconBgClassName: "bg-purple-100",
    borderClassName: "border-l-purple-400",
  },
  EMAIL: {
    label: "Email",
    icon: Mail,
    iconClassName: "text-blue-600",
    iconBgClassName: "bg-blue-100",
    borderClassName: "border-l-blue-400",
  },
  MEETING: {
    label: "Meeting",
    icon: Video,
    iconClassName: "text-purple-600",
    iconBgClassName: "bg-purple-100",
    borderClassName: "border-l-purple-400",
  },
  TODO: {
    label: "To Do",
    icon: CheckSquare,
    iconClassName: "text-red-600",
    iconBgClassName: "bg-red-100",
    borderClassName: "border-l-red-400",
  },
  DOCUMENT: {
    label: "Document",
    icon: FileText,
    iconClassName: "text-purple-600",
    iconBgClassName: "bg-purple-100",
    borderClassName: "border-l-purple-400",
  },
};

export const summaryCardMeta = {
  today: {
    label: "Today",
    icon: Clock,
    iconClassName: "text-[#3B82F6]",
    valueClassName: "text-slate-900",
  },
  overdue: {
    label: "Overdue",
    icon: AlertCircle,
    iconClassName: "text-[#EF4444]",
    valueClassName: "text-[#EF4444]",
  },
  week: {
    label: "This Week",
    icon: Clock3,
    iconClassName: "text-[#64748B]",
    valueClassName: "text-slate-900",
  },
  done: {
    label: "Done",
    icon: CheckCircle,
    iconClassName: "text-[#10B981]",
    valueClassName: "text-[#10B981]",
  },
} as const;
