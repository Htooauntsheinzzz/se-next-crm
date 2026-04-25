"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { formatRelativeTime } from "@/lib/utils";
import type { AppNotification, NotificationType } from "@/types/notification";

interface NotificationBellProps {
  enabled: boolean;
}

const TYPE_LABEL: Record<NotificationType, string> = {
  LEAD_ASSIGNED: "Lead assigned",
  OPPORTUNITY_STAGE_CHANGED: "Stage updated",
  ACTIVITY_ASSIGNED: "Activity assigned",
  MENTIONED: "You were mentioned",
};

const resolveHref = (n: AppNotification): string | null => {
  if (n.link) return n.link;
  if (n.entityType === "LEAD" && n.entityId) return `/leads/${n.entityId}`;
  if (n.entityType === "OPPORTUNITY" && n.entityId)
    return `/opportunities/${n.entityId}`;
  if (n.entityType === "ACTIVITY") return `/activities`;
  return null;
};

export function NotificationBell({ enabled }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
  } = useNotifications({ enabled });

  // Single source of truth for "should the dot show". Coerce to a real
  // number so a NaN/undefined from a flaky API never paints a red dot.
  const hasUnread = Number.isFinite(unreadCount) && unreadCount > 0;

  // Close on outside click / ESC.
  useEffect(() => {
    if (!open) return;

    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next) void refresh();
      return next;
    });
  };

  const handleItemClick = (n: AppNotification) => {
    if (!n.read) void markRead(n.id);
    setOpen(false);
  };

  const badge = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="relative rounded-full p-1.5 text-slate-500 transition hover:text-slate-700"
        aria-label={
          hasUnread
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        onClick={handleToggle}
      >
        <Bell className="h-5 w-5" />
        {hasUnread && (
          <span
            className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white"
            aria-live="polite"
          >
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-[360px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
            <p className="text-sm font-semibold text-slate-800">
              Notifications
              {hasUnread && (
                <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
                  {unreadCount} new
                </span>
              )}
            </p>
            {hasUnread && (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#8B6FD0] transition hover:text-[#6A4E97]"
                onClick={() => void markAllRead()}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center text-sm text-red-600">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                You&apos;re all caught up.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifications.map((n) => {
                  const href = resolveHref(n);
                  const row = (
                    <div
                      className={`flex gap-3 px-4 py-3 text-sm transition ${
                        n.read ? "bg-white" : "bg-[#F5F0FC]"
                      } hover:bg-slate-50`}
                    >
                      <span
                        className={`mt-1 inline-block h-2 w-2 shrink-0 rounded-full ${
                          n.read ? "bg-transparent" : "bg-[#8B6FD0]"
                        }`}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">
                          {TYPE_LABEL[n.type] ?? n.type}
                        </p>
                        <p className="truncate font-semibold text-slate-800">
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">
                            {n.body}
                          </p>
                        )}
                        <p className="mt-1 text-[11px] text-slate-400">
                          {formatRelativeTime(n.createdAt)}
                        </p>
                      </div>
                      {!n.read && (
                        <button
                          type="button"
                          className="self-start rounded p-1 text-slate-400 transition hover:bg-white hover:text-[#8B6FD0]"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            void markRead(n.id);
                          }}
                          aria-label="Mark as read"
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );

                  return (
                    <li key={n.id}>
                      {href ? (
                        <Link
                          href={href}
                          onClick={() => handleItemClick(n)}
                          className="block"
                        >
                          {row}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleItemClick(n)}
                          className="block w-full text-left"
                        >
                          {row}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
