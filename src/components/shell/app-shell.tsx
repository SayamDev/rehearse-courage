import type { ReactNode } from "react";
import { PanicLayer } from "@/components/calm/panic-view";
import { Popups } from "@/components/popups/popups";
import { BottomNav } from "./bottom-nav";
import { MainFrame } from "./main-frame";
import { RegisterServiceWorker } from "./pwa";
import { SettingsEffects } from "./settings-effects";
import { SkipLink } from "./skip-link";
import { TopBar } from "./top-bar";

/**
 * Global page frame: skip link, the top bar (wordmark, sections from 768px,
 * Need a pause), the main content landmark with the ownership footer, and
 * the phone tabs. Space is reserved below the content on phones so the
 * fixed tabs never cover the last thing on the page. /start has no tabs.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SettingsEffects />
      <RegisterServiceWorker />
      <SkipLink />
      <TopBar />
      <MainFrame>{children}</MainFrame>
      <BottomNav />
      <PanicLayer />
      <Popups />
    </>
  );
}
