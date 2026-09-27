import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";
import { MainFrame } from "./main-frame";
import { PanicButton } from "./panic-button";
import { SettingsEffects } from "./settings-effects";
import { SkipLink } from "./skip-link";

/**
 * Global page frame: skip link, main content landmark, the ownership
 * footer, Panic now, and the bottom nav. Space is reserved below the
 * content so the fixed nav and Panic button never cover the last thing
 * on the page. BottomNav and PanicButton each hide/reposition themselves
 * on /start, which has no nav yet during first-visit setup (see MainFrame).
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SettingsEffects />
      <SkipLink />
      <MainFrame>{children}</MainFrame>
      <PanicButton />
      <BottomNav />
    </>
  );
}
