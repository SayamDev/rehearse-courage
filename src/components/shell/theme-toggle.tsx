"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { updateSettings } from "@/lib/state";
import { act, useCourage } from "@/lib/store";
import { useDarkTheme } from "@/lib/use-dark-theme";

/**
 * Light or dark, one tap away in the top bar. It switches to the other one
 * and remembers the choice (the same setting as Colours in Me, where
 * "Match my device" goes back to following the device). Shows what you
 * will get: a moon in light colours, a sun in dark.
 */
export function ThemeToggle() {
  const { hydrated } = useCourage();
  const dark = useDarkTheme();
  const label = dark ? "Switch to light colours" : "Switch to dark colours";
  const Icon = dark ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={() => act((s) => updateSettings(s, { theme: dark ? "light" : "dark" }))}
      aria-label={label}
      title={label}
      // Until the saved choice is read, the icon could be the wrong one: keep it but do not flash.
      className={`flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-ink transition-[color,background-color,opacity] duration-[var(--dur-feedback)] hover:bg-line/60 active:bg-line/80 focus-visible:outline-3 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-3 ${
        hydrated ? "" : "opacity-0"
      }`}
    >
      <Icon size={20} weight="regular" aria-hidden />
    </button>
  );
}
