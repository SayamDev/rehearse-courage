"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { act, useCourage } from "@/lib/store";
import { stopSpeaking } from "@/lib/voice/speak";
import { visit } from "@/lib/state";

/**
 * Mirrors reduced motion, large text and theme onto <html>, records the
 * visit once per app load, and stops any line read aloud when the page
 * changes. Renders nothing.
 */
export function SettingsEffects() {
  const { settings } = useCourage();
  const pathname = usePathname();

  // A line never follows you to another screen.
  useEffect(() => () => stopSpeaking(), [pathname]);

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
