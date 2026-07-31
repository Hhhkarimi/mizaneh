"use client";

import { useEffect, useState } from "react";
import { clearSession, loadSession, type StoredSession } from "@/lib/storage/session";
import { clearWorkspace, loadWorkspace, type StoredWorkspace } from "@/lib/storage/workspace";

type PendingRestore =
  | { kind: "workspace"; value: StoredWorkspace }
  | { kind: "legacy"; value: StoredSession };

type RestoreSessionPromptProps = {
  onRestore: (session: StoredSession) => void;
  onRestoreWorkspace: (workspace: StoredWorkspace) => void;
};

/**
 * Reads local-only saved data after hydration and always asks before applying it.
 * A v2 multi-plan workspace takes precedence over the legacy single-session key.
 */
export function RestoreSessionPrompt({ onRestore, onRestoreWorkspace }: RestoreSessionPromptProps) {
  const [pending, setPending] = useState<PendingRestore | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    const workspace = loadWorkspace();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPending(workspace ? { kind: "workspace", value: workspace } : (() => {
      const legacy = loadSession();
      return legacy ? { kind: "legacy", value: legacy } : null;
    })());
  }, []);

  if (!pending || resolved) return null;

  const planCount = pending.kind === "workspace" ? pending.value.plans.length : 1;
  return (
    <div role="note" aria-label="بازیابی برنامه ذخیره‌شده" className="restore-session-prompt">
      <p>{pending.kind === "workspace" ? `${planCount.toLocaleString("fa-IR")} برنامه یا نسخهٔ ذخیره‌شده روی همین دستگاه پیدا شد. بازیابی شوند؟` : "یک برنامهٔ قدیمی ذخیره‌شده روی همین دستگاه پیدا شد. بازیابی شود؟"}</p>
      <div className="restore-session-prompt__actions">
        <button type="button" onClick={() => {
          if (pending.kind === "workspace") onRestoreWorkspace(pending.value);
          else onRestore(pending.value);
          setResolved(true);
        }}>بله، بازیابی کن</button>
        <button type="button" onClick={() => {
          clearSession();
          clearWorkspace();
          setResolved(true);
        }}>نه، پاک کن</button>
      </div>
    </div>
  );
}
