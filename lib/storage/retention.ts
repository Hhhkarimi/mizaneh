export const LOCAL_STORAGE_RETENTION_DAYS = 180;
export const LOCAL_STORAGE_RETENTION_MS = LOCAL_STORAGE_RETENTION_DAYS * 24 * 60 * 60 * 1000;

const MAX_CLOCK_SKEW_MS = 24 * 60 * 60 * 1000;

export function isPersistedDataExpired(
  savedAt: string,
  now = Date.now(),
  retentionMs = LOCAL_STORAGE_RETENTION_MS,
): boolean {
  const savedAtMs = Date.parse(savedAt);
  if (!Number.isFinite(savedAtMs)) return true;
  if (savedAtMs - now > MAX_CLOCK_SKEW_MS) return true;
  return now - savedAtMs > retentionMs;
}
