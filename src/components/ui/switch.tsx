"use client";

/**
 * A real switch control (role="switch"), not a styled checkbox: keyboard
 * and screen reader operable, 44px touch target even though the visible
 * track is slimmer. `label` is the visible text next to the track and also
 * the accessible name.
 */
export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4 py-1 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
      <span className="text-ink">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative flex h-11 w-[3.25rem] shrink-0 items-center rounded-full px-1 transition-colors duration-[var(--dur-ui)] ease-[var(--ease-out)] focus-visible:outline-3 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-3 disabled:pointer-events-none ${
          checked ? "bg-amber" : "bg-surface-2"
        } ${checked ? "" : "border border-line"}`}
      >
        <span
          aria-hidden
          className={`h-6 w-6 rounded-full bg-surface shadow-card transition-transform duration-[var(--dur-ui)] ease-[var(--ease-out)] ${
            checked ? "translate-x-[1.375rem] bg-on-amber" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}
