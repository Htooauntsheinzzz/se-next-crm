"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  ChevronDown,
  LogOut,
  UserCircle,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { NAV_ITEMS } from "@/components/layout/nav-config";
import { GlobalSearchBar } from "@/components/layout/GlobalSearchBar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useAuth } from "@/context/AuthContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useIdleLogout } from "@/hooks/useIdleLogout";

// Must match jwt.refresh-expiration on the backend (24 hours).
// Active users (any API call within the window) keep their session
// alive via the refresh-token rotation; this hook only fires when
// the user has truly done nothing for the full window.
const IDLE_TIMEOUT_MS = 24 * 60 * 60 * 1000;

const getInitials = (firstName?: string, lastName?: string) => {
  const first = firstName?.charAt(0) ?? "";
  const last = lastName?.charAt(0) ?? "";
  return `${first}${last}`.toUpperCase() || "U";
};

const getHeaderTitle = (pathname: string) => {
  if (pathname.startsWith("/teams/") && pathname !== "/teams/new") {
    return "Settings / Teams / Detail";
  }

  if (pathname.startsWith("/teams/new")) {
    return "Settings / Teams / New";
  }

  if (pathname.startsWith("/teams")) {
    return "Settings / Teams";
  }

  if (pathname.startsWith("/users/") && pathname !== "/users") {
    return "Users / Detail";
  }

  if (pathname.startsWith("/users")) {
    return "Users";
  }

  if (pathname.startsWith("/contacts")) {
    return "Contacts";
  }

  if (pathname.startsWith("/activities")) {
    return "Activities";
  }

  if (pathname.startsWith("/opportunities/") && pathname !== "/opportunities") {
    return "Opportunities / Detail";
  }

  if (pathname.startsWith("/opportunities")) {
    return "Opportunities";
  }

  if (pathname.startsWith("/pipeline")) {
    return "Settings / Pipeline Stages";
  }

  if (pathname.startsWith("/reports")) {
    return "Reports";
  }

  if (pathname.startsWith("/leads")) {
    return "Leads";
  }

  if (pathname.startsWith("/profile")) {
    return "My Profile";
  }

  return "Dashboard";
};

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { currentUser, loading: currentUserLoading } = useCurrentUser();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const headerTitle = useMemo(() => getHeaderTitle(pathname), [pathname]);
  const visibleNavItems = useMemo(() => {
    if (!currentUser?.role) {
      return [];
    }

    return NAV_ITEMS.filter((item) => item.roles.includes(currentUser.role));
  }, [currentUser?.role]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Auto-logout on client inactivity. The backend expires the
  // refresh token after 24h of no /auth/refresh calls, so this
  // hook mirrors that deadline in the UI — the moment it fires,
  // we blow away the local session and bounce to /login so the
  // user sees the timeout instead of waiting until their next
  // click to get a 401. Active users keep their session alive
  // forever via refresh-token rotation; only a full day of
  // idleness fires this.
  useIdleLogout(
    () => {
      void logout();
      toast.info("You have been logged out due to inactivity.");
    },
    { idleMs: IDLE_TIMEOUT_MS, enabled: isAuthenticated && !loading },
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3EFFC]">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-[#DACDF8] border-t-[#8B6FD0]" />
      </div>
    );
  }

  return (
    <div className="app-shell-font flex min-h-screen w-full bg-[#F8F8FB]">
      <aside className="sticky top-0 hidden h-screen w-60 flex-col bg-[#8963C6] text-white lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white">
            <Image src="/applogo.svg" alt="Sales Surge" width={20} height={20} priority />
          </span>
          <span className="text-xl font-semibold tracking-tight">Sales Surge</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {currentUserLoading
            ? Array.from({ length: NAV_ITEMS.length }).map((_, index) => (
                <div key={index} className="h-9 animate-pulse rounded-lg bg-white/15" />
              ))
            : visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href !== "#" && pathname.startsWith(item.href);

                if (item.href === "#") {
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-[#6A4E97] text-white"
                        : "text-white/85 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex flex-1 items-center gap-6">
            <p className="hidden text-sm font-medium text-slate-600 md:block">{headerTitle}</p>

            <GlobalSearchBar currentUser={currentUser} />
          </div>

          <div className="ml-4 flex items-center gap-2.5">
            <NotificationBell enabled={isAuthenticated && !loading} />

            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg px-1 py-1"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#8B6FD0] text-xs font-semibold text-white">
                  {getInitials(user?.firstName, user?.lastName)}
                </span>

                <div className="hidden text-left leading-tight sm:block">
                  <p className="text-sm font-semibold text-slate-800">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    {user?.role === "SALES_MANAGER"
                      ? "Sales Manager"
                      : user?.role === "SALES_REP"
                        ? "Sales Rep"
                        : "Admin"}
                  </p>
                </div>

                <ChevronDown
                  className={`hidden h-4 w-4 text-slate-500 transition sm:block ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isUserMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-[220px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <div className="border-b border-slate-200 px-4 py-2.5">
                    <p className="text-sm font-semibold text-slate-800">My Account</p>
                  </div>

                  <Link
                    href="/profile"
                    className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <UserCircle className="h-4 w-4 text-slate-500" />
                    My Profile
                  </Link>

                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-64px)] px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
