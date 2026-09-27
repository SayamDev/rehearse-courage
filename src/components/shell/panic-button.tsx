"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "@phosphor-icons/react";

/**
 * Opens the Panic now view (built in a later task) by adding `?calm=1` to
 * the current path, so it works from any page and the back button closes it.
 */
export function PanicButton() {
  const pathname = usePathname();

  return (
    <Link
      href={`${pathname}?calm=1`}
      className="fixed bottom-[5.75rem] right-3 z-40 flex h-11 items-center gap-2 rounded-full bg-chrome px-4 text-sm font-semibold text-on-chrome transition-colors duration-[var(--dur-ui)] ease-[var(--ease-out)] hover:bg-on-chrome/10 active:bg-on-chrome/15 sm:right-6"
    >
      <ShieldCheck size={20} weight="regular" aria-hidden />
      Panic now
    </Link>
  );
}
