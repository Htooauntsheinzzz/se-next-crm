export type Role = "ADMIN" | "SALES_MANAGER" | "SALES_REP";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  teamId: string | null;
  teamName: string | null;
  active: boolean;
  createdAt: string;
}

export interface UserUpdateRequest {
  firstName: string;
  lastName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeRoleRequest {
  role: Role;
}

export interface UserFilters {
  role?: Role;
  active?: boolean;
  teamId?: string;
  search?: string;
}
