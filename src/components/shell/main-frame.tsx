"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * The main content landmark. Reserves bottom space for whatever's fixed
 * below it: the bottom nav plus Panic now everywhere, or just Panic now on
 * /start, which has no bottom nav (see BottomNav and PanicButton).
 */
export function MainFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isStart = pathname === "/start";

  return (
    <main id="main" className={`min-h-dvh ${isStart ? "pb-[var(--nav-space-start)]" : "pb-[var(--nav-space)]"}`}>
      {children}
      <p className="mt-12 px-4 text-sm text-muted">© 2026 Sayam Ajmal. All rights reserved.</p>
    </main>
  );
}
