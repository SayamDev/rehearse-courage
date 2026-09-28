"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { hidesNav } from "./no-nav-routes";

/**
 * The main content landmark. Reserves bottom space for whatever's fixed
 * below it: the bottom nav plus Panic now everywhere, or just Panic now on
 * routes from no-nav-routes.ts, which have no bottom nav (see BottomNav and
 * PanicButton). The ownership line closes every page.
 */
export function MainFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const noNav = hidesNav(pathname);

  return (
    <main id="main" className={`flex min-h-dvh flex-col ${noNav ? "pb-[var(--nav-space-start)]" : "pb-[var(--nav-space)]"}`}>
      <div className="w-full">{children}</div>
      {/* Sits at the foot of the page (mt-auto) on short pages rather than floating mid-screen. */}
      <p className="mx-auto mt-auto w-full max-w-[1100px] px-4 pt-12 text-center text-sm text-muted">© 2026 Sayam Ajmal. All rights reserved.</p>
    </main>
  );
}
