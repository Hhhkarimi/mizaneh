// Opt-in, device-local session persistence (round 2 — CONTEXT.md §9.3).
//
// Nothing here is ever called automatically on page load in a way that
// writes or silently restores data — every function is only invoked from
// an explicit user action in the UI (save button, restore-prompt choice,
// clear button). This module never makes a network request; it only
// wraps `window.localStorage`, and every call is defensively wrapped so a
// disabled/unavailable storage API degrades to "nothing saved" rather
// than throwing.

import type { DayPlan, PlanMode, PlannerForm } from "@/lib/types";

const STORAGE_KEY = "mizaneh:session:v1";
const SESSION_VERSION = 1 as const;

export type StoredSession = {
  version: typeof SESSION_VERSION;
  form: PlannerForm;
  planMode: PlanMode;
  variationSeed: number;
  substitutions: Record<number, DayPlan>;
  savedAt: string;
};

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    // Some browsers throw synchronously when storage is disabled
    // (private mode, enterprise policy, etc.) rather than returning null.
    return null;
  }
}

/** Explicit save — only ever called from the "ذخیره روی این دستگاه" button. */
export function saveSession(
  session: Omit<StoredSession, "version" | "savedAt">,
): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    const payload: StoredSession = {
      version: SESSION_VERSION,
      savedAt: new Date().toISOString(),
      ...session,
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads any saved session without applying it to anything. The UI is
 * expected to use this only to decide whether to show a "restore or
 * discard?" prompt — never to silently repopulate the form.
 */
export function loadSession(): StoredSession | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      (parsed as { version?: unknown }).version !== SESSION_VERSION ||
      typeof (parsed as { variationSeed?: unknown }).variationSeed !== "number" ||
      !(parsed as { form?: unknown }).form
    ) {
      // Unknown/incompatible shape (e.g. a future version, or corrupted
      // data) — discard rather than risk applying something malformed.
      storage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed as StoredSession;
  } catch {
    return null;
  }
}

export function clearSession(): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function hasSavedSession(): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    return storage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
