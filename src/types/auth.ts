export interface AuthTeamRef {
  id: string;
  name: string;
  primary: boolean;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "ADMIN" | "SALES_MANAGER" | "SALES_REP";
  /** Primary team id (backward compatibility). */
  teamId: number | null;
  /** Primary team name (backward compatibility). */
  teamName: string | null;
  /** All teams this user belongs to; first entry is primary. */
  teams?: AuthTeamRef[];
  active: boolean;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
}
