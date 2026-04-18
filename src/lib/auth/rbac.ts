import type { User } from "@/types/user";
import type { Contact } from "@/types/contact";
import type { SalesTeam } from "@/types/team";

export const isAdmin = (u?: User | null) => u?.role === "ADMIN";
export const isManager = (u?: User | null) => u?.role === "SALES_MANAGER";
export const isRep = (u?: User | null) => u?.role === "SALES_REP";

export const canEditContact = (u: User, c: Contact) =>
  isAdmin(u) || isManager(u) || (isRep(u) && c.assignedTo === Number(u.id));

export const canMergeContacts = (u: User) => !isRep(u);

// Team RBAC Helpers
export const canCreateTeam = (u: User | null) => isAdmin(u);
export const canEditTeam = (u: User | null) => isAdmin(u);
export const canDeleteTeam = (u: User | null) => isAdmin(u);
export const canManageMembers = (u: User | null, team: SalesTeam) =>
  isAdmin(u) || (isManager(u) && team.leaderId === String(u?.id));
