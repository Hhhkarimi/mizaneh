"use client";

type SaveSessionControlsProps = {
  onSave: () => void;
  onClear: () => void;
  savedAt: string | null;
  justSaved: boolean;
};

/**
 * Round 2 (spec user stories 25, 28): an explicit, always-optional pair
 * of controls to save the current plan on this device, or clear anything
 * previously saved. Never triggers on mount or on plan generation —
 * only ever from a direct click here.
 */
export function SaveSessionControls({
  onSave,
  onClear,
  savedAt,
  justSaved,
}: SaveSessionControlsProps) {
  return (
    <div className="save-session-controls" role="group" aria-label="ذخیره‌سازی محلی برنامه">
      <button type="button" onClick={onSave} className="save-session-controls__save">
        ذخیره روی این دستگاه
      </button>
      {justSaved && (
        <span role="status" className="save-session-controls__status">
          ذخیره شد — فقط روی همین دستگاه، بدون ارسال به هیچ سروری.
        </span>
      )}
      {savedAt && (
        <button
          type="button"
          onClick={onClear}
          className="save-session-controls__clear"
        >
          پاک کردن داده‌های ذخیره‌شده
        </button>
      )}
    </div>
  );
}
