"use client";

import { useSyncExternalStore } from "react";
import { useCourage } from "./store";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(fn: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", fn);
  return () => mq.removeEventListener("change", fn);
}

/** True when the system asks for reduced motion or the person turned it on in settings. False on the server. */
export function useReducedMotion(): boolean {
  const { settings } = useCourage();
  const system = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
  return settings.reduceMotion || system;
}
