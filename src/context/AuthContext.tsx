"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/auth";
import { getApiErrorMessage } from "@/lib/errors";
import { session } from "@/lib/session";
import type { AuthResult, RegisterFormData, User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (data: RegisterFormData) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncFromSession = () => {
      setUser(session.getUser());
      setAccessToken(session.getAccessToken());
    };

    syncFromSession();

    const bootstrap = async () => {
      const refreshToken = session.getRefreshToken();

      if (!refreshToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.refresh(refreshToken);
        const payload = response.data;

        if (payload.success && payload.data) {
          session.setSession(payload.data);
          syncFromSession();
        } else {
          session.clearSession();
          syncFromSession();
        }
      } catch {
        session.clearSession();
        syncFromSession();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();

    window.addEventListener("auth:session-changed", syncFromSession);
    return () => {
      window.removeEventListener("auth:session-changed", syncFromSession);
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await authApi.login(email, password);
      const payload = response.data;

      if (!payload.success || !payload.data) {
        return {
          success: false,
          message: payload.message || "Login failed",
        };
      }

      session.setSession(payload.data);
      setUser(payload.data.user);
      setAccessToken(payload.data.accessToken);
      router.replace("/dashboard");

      return {
        success: true,
        message: payload.message,
      };
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(error, "Unable to sign in"),
      };
    }
  };

  const register = async (data: RegisterFormData): Promise<AuthResult> => {
    try {
      const response = await authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });

      const payload = response.data;

      if (!payload.success) {
        return {
          success: false,
          message: payload.message || "Registration failed",
        };
      }

      return {
        success: true,
        message: payload.message,
      };
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(error, "Unable to create account"),
      };
    }
  };

  const logout = async () => {
    const refreshToken = session.getRefreshToken();

    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Ignore logout API errors and clear client state anyway.
    } finally {
      session.clearSession();
      setUser(null);
      setAccessToken(null);
      router.replace("/login");
    }
  };

  const value: AuthContextValue = {
    user,
    accessToken,
    loading,
    isAuthenticated: Boolean(user && accessToken),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
