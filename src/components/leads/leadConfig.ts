import type { LeadStatus } from "@/types/lead";

export const leadStatusOrder: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "CONVERTED",
  "LOST",
];

export const leadStatusLabel: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CONVERTED: "Converted",
  LOST: "Lost",
};

export const leadStatusColor: Record<LeadStatus, string> = {
  NEW: "#3B82F6",
  CONTACTED: "#F59E0B",
  QUALIFIED: "#10B981",
  CONVERTED: "#8B5CF6",
  LOST: "#EF4444",
};

export const sourceOptions = [
  "Website",
  "Referral",
  "Social Media",
  "Cold Call",
  "Event",
  "LinkedIn",
  "Email Campaign",
  "Direct",
  "Partner",
  "Other",
];

export const mediumOptions = [
  "Google",
  "Organic",
  "LinkedIn",
  "Direct",
  "Partner",
  "Conference",
  "Email",
  "Paid Ad",
  "Other",
];
