"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { hidesNav } from "./no-nav-routes";

/**
 * The main content landmark. Reserves bottom space for whatever's fixed
 * below it: the bottom nav plus Panic now everywhere, or just Panic now on
 * routes from no-nav-routes.ts, which have no bottom nav (see BottomNav and
 * PanicButton).
 */
export function MainFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const noNav = hidesNav(pathname);

  return (
    <main id="main" className={`min-h-dvh ${noNav ? "pb-[var(--nav-space-start)]" : "pb-[var(--nav-space)]"}`}>
      {children}
      <p className="mt-12 px-4 text-sm text-muted">© 2026 Sayam Ajmal. All rights reserved.</p>
    </main>
  );
}
