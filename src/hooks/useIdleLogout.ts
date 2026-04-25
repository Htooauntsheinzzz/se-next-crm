"use client";

import { useEffect, useRef } from "react";

/**
 * Client-side idle watcher. If there is no user activity
 * (mouse / keyboard / touch / scroll / visibility) for
 * `idleMs` milliseconds, `onIdle` is called — typically
 * to force-logout the user.
 *
 * This complements the backend's refresh-token expiry: the
 * backend guarantees the session is *actually* dead after
 * the refresh window, and this hook makes the browser react
 * to that deadline proactively instead of waiting for the
 * next API call.
 *
 * Active users do NOT hit this timeout — every authenticated
 * API call rotates the refresh token forward, so as long as
 * the user is clicking around the app the session is renewed
 * silently. Only true idleness (no API calls AND no
 * mouse / keyboard events for the full window) triggers
 * logout.
 *
 * Pass `enabled = false` (e.g. when the user is not
 * authenticated) to disable the watcher.
 */
export function useIdleLogout(
  onIdle: () => void,
  {
    idleMs = 30 * 60 * 1000, // 30 minutes
    enabled = true,
  }: { idleMs?: number; enabled?: boolean } = {},
) {
  // Latest onIdle always called without re-subscribing listeners.
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;

    const fire = () => {
      onIdleRef.current();
    };

    const reset = () => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(fire, idleMs);
    };

    // Events that count as "user is still here".
    const windowEvents: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "wheel",
    ];

    windowEvents.forEach((evt) =>
      window.addEventListener(evt, reset, { passive: true }),
    );
    // visibilitychange lives on document, not window.
    document.addEventListener("visibilitychange", reset);
    reset();

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      windowEvents.forEach((evt) => window.removeEventListener(evt, reset));
      document.removeEventListener("visibilitychange", reset);
    };
  }, [enabled, idleMs]);
}
