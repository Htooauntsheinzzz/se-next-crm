export type Role = "ADMIN" | "SALES_MANAGER" | "SALES_REP";

export interface TeamRef {
  id: string;
  name: string;
  primary: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  /** Primary team id (backward compatibility). */
  teamId: string | null;
  /** Primary team name (backward compatibility). */
  teamName: string | null;
  /** All teams the user belongs to; first entry is primary. */
  teams?: TeamRef[];
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
