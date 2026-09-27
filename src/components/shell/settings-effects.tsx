"use client";

import { useEffect } from "react";
import { act, useCourage } from "@/lib/store";
import { visit } from "@/lib/state";

/**
 * Mirrors reduced motion, large text and theme onto <html>, and records the
 * visit once per app load. Renders nothing.
 */
export function SettingsEffects() {
  const { settings } = useCourage();

  useEffect(() => {
    act((s) => visit(s, new Date()).state);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (settings.reduceMotion) root.setAttribute("data-motion", "reduce");
    else root.removeAttribute("data-motion");

    if (settings.textSize !== "normal") root.setAttribute("data-text", settings.textSize);
    else root.removeAttribute("data-text");

    if (settings.theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", settings.theme);
  }, [settings.reduceMotion, settings.textSize, settings.theme]);

  return null;
}
