"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "@phosphor-icons/react";
import { hidesNav } from "./no-nav-routes";

/**
 * Opens the Panic now view (built in a later task) by adding `?calm=1` to
 * the current path, so it works from any page and the back button closes it.
 */
// Tailwind needs each arbitrary-value class spelled out as a full literal to
// pick it up at build time, so the two offsets are whole strings, not
// interpolated from a shared template.
const OFFSET_CLASS = "fixed bottom-[var(--panic-offset)] right-3 z-40 flex h-11 items-center gap-2 rounded-full bg-chrome px-4 text-sm font-semibold text-on-chrome transition-colors duration-[var(--dur-ui)] ease-[var(--ease-out)] hover:bg-on-chrome/10 active:bg-on-chrome/15 sm:right-6";
const OFFSET_CLASS_START = "fixed bottom-[var(--panic-offset-start)] right-3 z-40 flex h-11 items-center gap-2 rounded-full bg-chrome px-4 text-sm font-semibold text-on-chrome transition-colors duration-[var(--dur-ui)] ease-[var(--ease-out)] hover:bg-on-chrome/10 active:bg-on-chrome/15 sm:right-6";

export function PanicButton() {
  const pathname = usePathname();
  // Routes in no-nav-routes.ts have no bottom nav to clear (see BottomNav),
  // so Panic now sits closer to the corner instead of the taller offset
  // that clears the nav.
  const className = hidesNav(pathname) ? OFFSET_CLASS_START : OFFSET_CLASS;

  return (
    <Link href={`${pathname}?calm=1`} className={className}>
      <ShieldCheck size={20} weight="regular" aria-hidden />
      Panic now
    </Link>
  );
}
