import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";
import { PanicButton } from "./panic-button";
import { SettingsEffects } from "./settings-effects";
import { SkipLink } from "./skip-link";

/**
 * Global page frame: skip link, main content landmark, the ownership
 * footer, Panic now, and the bottom nav. Space is reserved below the
 * content so the fixed nav and Panic button never cover the last thing
 * on the page.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SettingsEffects />
      <SkipLink />
      <main id="main" className="min-h-dvh pb-40">
        {children}
        <p className="mt-12 px-4 text-sm text-muted">© 2026 Sayam Ajmal. All rights reserved.</p>
      </main>
      <PanicButton />
      <BottomNav />
    </>
  );
}
