import type { User } from "@/types/user";

export type GlobalSearchEntityType =
  | "user"
  | "contact"
  | "lead"
  | "opportunity"
  | "team"
  | "activity";

export interface GlobalSearchItem {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  type: GlobalSearchEntityType;
}

export interface GlobalSearchGroup {
  key: GlobalSearchEntityType;
  label: string;
  items: GlobalSearchItem[];
}

export interface GlobalSearchResult {
  groups: GlobalSearchGroup[];
}

export interface GlobalSearchParams {
  query: string;
  currentUser?: User | null;
  limitPerGroup?: number;
}
