"use client";

import { useEffect, useState } from "react";
import { clearSession, loadSession, type StoredSession } from "@/lib/storage/session";

type RestoreSessionPromptProps = {
  onRestore: (session: StoredSession) => void;
};

/**
 * Round 2 (spec user story 26): if a previously saved session exists on
 * this device, show an explicit prompt to restore or discard it — the
 * form is never silently repopulated. The `useEffect` here only *reads*
 * from storage to decide whether to show the prompt; it never applies
 * anything until the user clicks "بله، بازیابی کن".
 */
export function RestoreSessionPrompt({ onRestore }: RestoreSessionPromptProps) {
  const [pending, setPending] = useState<StoredSession | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    // One-time read from an external system (localStorage) after mount —
    // this can't happen during render because localStorage isn't
    // available during Next.js's server render, and there's no
    // subscription API for "did this key appear" to use instead.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPending(loadSession());
  }, []);

  if (!pending || resolved) return null;

  return (
    <div
      role="note"
      aria-label="بازیابی برنامه ذخیره‌شده"
      className="restore-session-prompt"
    >
      <p>یک برنامه‌ی ذخیره‌شده روی همین دستگاه پیدا شد. بازیابی شود؟</p>
      <div className="restore-session-prompt__actions">
        <button
          type="button"
          onClick={() => {
            onRestore(pending);
            setResolved(true);
          }}
        >
          بله، بازیابی کن
        </button>
        <button
          type="button"
          onClick={() => {
            clearSession();
            setResolved(true);
          }}
        >
          نه، پاک کن
        </button>
      </div>
    </div>
  );
}
