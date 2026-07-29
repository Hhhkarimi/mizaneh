"use client";

import { useEffect } from "react";

/**
 * Registers the offline service worker (round 2, spec user story 29).
 * Renders nothing — this is a side-effect-only component.
 *
 * Guards:
 * - Only runs in the browser (`"serviceWorker" in navigator`), never
 *   during Next.js's server render.
 * - Only registers in production. In development, a cached service
 *   worker can serve stale bundles over Turbopack's HMR websocket
 *   updates, which is confusing to develop against and not worth the
 *   offline benefit in a dev environment.
 * - A registration failure (unsupported browser, disabled by the user,
 *   blocked by policy, etc.) is swallowed — the app works fully without
 *   it; offline support is a progressive enhancement, not a requirement.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Non-fatal — see guard notes above.
    });
  }, []);

  return null;
}
