import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { pingSession } from '../api/client';

// How often to silently re-check that the token is still valid server-side
// (catches revocation the client can't predict: logout on another device,
// password change, a token deleted by an admin, etc). The existing response
// interceptor in api/client.ts already redirects to /login on any 401, so
// this ping doesn't need its own error handling — it just needs to keep
// firing while the user is authenticated.
const PING_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

// setTimeout takes a 32-bit signed int (~24.8 days). Sanctum's default
// expiration is 14 days, well under that, but this keeps a long/no expiry
// from silently overflowing into an immediate timer fire.
const MAX_TIMEOUT_MS = 2_147_483_647;

function forceLogout(logout: () => Promise<void>) {
  logout().finally(() => {
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  });
}

/**
 * Proactively ends the session the moment the token expires, instead of
 * waiting for the user to trigger another API call and hit a reactive 401.
 * Mount this once near the app root (it no-ops while logged out).
 */
export function useSessionWatcher() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const expiresAt = useAuthStore((s) => s.expiresAt);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!isAuthenticated) return;

    let expiryTimer: ReturnType<typeof setTimeout> | undefined;

    if (expiresAt) {
      const msRemaining = new Date(expiresAt).getTime() - Date.now();
      if (msRemaining <= 0) {
        forceLogout(logout);
      } else {
        expiryTimer = setTimeout(() => forceLogout(logout), Math.min(msRemaining, MAX_TIMEOUT_MS));
      }
    }

    const pingIntervalId = setInterval(() => {
      pingSession().catch(() => {
        // A 401 here is already handled by the response interceptor
        // (clears storage + redirects). Anything else (offline, etc.) we
        // just ignore — no need to log the user out over a flaky network.
      });
    }, PING_INTERVAL_MS);

    return () => {
      if (expiryTimer) clearTimeout(expiryTimer);
      clearInterval(pingIntervalId);
    };
  }, [isAuthenticated, expiresAt, logout]);
}
