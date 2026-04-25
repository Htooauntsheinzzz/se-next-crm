"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { notificationService } from "@/services/notificationService";
import { getApiMessage } from "@/lib/utils";
import type { AppNotification } from "@/types/notification";

interface UseNotificationsOptions {
  /** How often to poll `/unread-count`. Default 30s. */
  pollMs?: number;
  /** Disable polling & fetching (e.g. when not authenticated). */
  enabled?: boolean;
  /** Page size for the dropdown list. */
  pageSize?: number;
}

interface UseNotificationsResult {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
}

/**
 * Central hook powering the bell icon + dropdown.
 *
 * Polling strategy:
 *  - /unread-count runs on a timer (cheap, 1 integer).
 *  - The full list is fetched on mount and after any mutation.
 *  - We also refetch the list whenever the unread count diverges from
 *    what we have locally, so a newly-created notification shows up
 *    in the open dropdown within one poll tick.
 *
 * The 5-minute session timeout can force an auto-logout while the
 * timer is still live, so we guard every tick with {@link enabled}.
 */
export const useNotifications = (
  { pollMs = 30_000, enabled = true, pageSize = 10 }: UseNotificationsOptions = {},
): UseNotificationsResult => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref mirror so the polling closure can diff without
  // re-subscribing every render.
  const lastUnreadRef = useRef(0);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await notificationService.list({ page: 0, size: pageSize });
      setNotifications(res.content ?? []);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load notifications"));
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const fetchUnread = useCallback(async () => {
    try {
      const raw = await notificationService.unreadCount();
      // Coerce to a real non-negative integer; any garbage from the
      // wire (NaN, undefined, negative) collapses to 0 so the bell
      // never shows a phantom dot.
      const next = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
      const prev = lastUnreadRef.current;
      lastUnreadRef.current = next;
      setUnreadCount(next);
      // If the count grew, something new arrived — pull the list.
      if (next > prev) {
        await fetchList();
      }
    } catch {
      // Silent — the list fetch surfaces user-visible errors,
      // the poll should not spam the UI if it blips.
    }
  }, [fetchList]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchList(), fetchUnread()]);
  }, [fetchList, fetchUnread]);

  const markRead = useCallback(
    async (id: number) => {
      // Optimistic flip so the dropdown feels instant.
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id && !n.read
            ? { ...n, read: true, readAt: new Date().toISOString() }
            : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await notificationService.markRead(id);
      } catch (err) {
        // Roll back + resync from server on failure.
        setError(getApiMessage(err, "Failed to mark notification as read"));
        await refresh();
      }
    },
    [refresh],
  );

  const markAllRead = useCallback(async () => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.read ? n : { ...n, read: true, readAt: new Date().toISOString() },
      ),
    );
    setUnreadCount(0);
    lastUnreadRef.current = 0;
    try {
      await notificationService.markAllRead();
    } catch (err) {
      setError(getApiMessage(err, "Failed to mark all as read"));
      await refresh();
    }
  }, [refresh]);

  // Initial fetch + poll loop.
  useEffect(() => {
    if (!enabled) {
      return;
    }
    void refresh();
    const timer = window.setInterval(() => {
      void fetchUnread();
    }, pollMs);
    return () => window.clearInterval(timer);
  }, [enabled, pollMs, refresh, fetchUnread]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
  };
};
