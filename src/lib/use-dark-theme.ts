"use client";

import { useSyncExternalStore } from "react";
import { useCourage } from "./store";

const QUERY = "(prefers-color-scheme: dark)";

function subscribe(fn: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", fn);
  return () => mq.removeEventListener("change", fn);
}

/** True when dark colours are showing: chosen in the app, or the device is dark and the app follows it. False on the server. */
export function useDarkTheme(): boolean {
  const { settings } = useCourage();
  const system = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
  if (settings.theme === "dark") return true;
  if (settings.theme === "light") return false;
  return system;
}
