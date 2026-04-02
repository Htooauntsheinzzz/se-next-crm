import type { LoginResponse, User } from "@/types/auth";

const REFRESH_TOKEN_KEY = "crm_refresh_token";
const USER_KEY = "crm_user";

let accessToken: string | null = null;

const isBrowser = () => typeof window !== "undefined";

const notifySessionChange = () => {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event("auth:session-changed"));
};

export const session = {
  getAccessToken: () => accessToken,

  setAccessToken: (token: string | null) => {
    accessToken = token;
    notifySessionChange();
  },

  getRefreshToken: (): string | null => {
    if (!isBrowser()) {
      return null;
    }

    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: (token: string | null) => {
    if (!isBrowser()) {
      return;
    }

    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    notifySessionChange();
  },

  getUser: (): User | null => {
    if (!isBrowser()) {
      return null;
    }

    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  setUser: (user: User | null) => {
    if (!isBrowser()) {
      return;
    }

    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }

    notifySessionChange();
  },

  setSession: ({ accessToken: newAccessToken, refreshToken, user }: LoginResponse) => {
    accessToken = newAccessToken;

    if (isBrowser()) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      notifySessionChange();
    }
  },

  clearSession: () => {
    accessToken = null;

    if (!isBrowser()) {
      return;
    }

    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    notifySessionChange();
  },
};
