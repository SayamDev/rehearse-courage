"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { activeNav, NAV_ITEMS } from "./bottom-nav";
import { hidesNav } from "./no-nav-routes";
import { PanicButton } from "./panic-button";
import { ThemeToggle } from "./theme-toggle";

/**
 * The top bar on every page: the sticker wordmark (home), the five sections
 * as links from 768px up, a light or dark switch, and Need a pause, always
 * in the same corner so it is easy to find and never covers the page. On
 * /start the section links are left out.
 */
export function TopBar() {
  const pathname = usePathname();
  const active = activeNav(pathname);
  const noNav = hidesNav(pathname);

  return (
    <header data-no-print className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur supports-[backdrop-filter]:bg-canvas/80">
      <div className="mx-auto flex h-16 w-full max-w-[1100px] items-center gap-3 px-4 md:gap-3 md:px-8 lg:gap-6">
        <Link href="/" className="sticker sticker-teal shrink-0 text-[0.85rem] sm:text-base">
          Rehearse Courage
        </Link>
        {noNav ? null : (
          <nav aria-label="Sections" className="hidden md:block">
            <ul className="flex items-center gap-0.5 lg:gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = item.href === active;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`inline-flex min-h-11 items-center rounded-full px-2.5 font-semibold lg:px-3.5 transition-colors duration-[var(--dur-feedback)] ${
                        isActive ? "bg-surface-2 text-ink" : "text-muted hover:text-ink"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <PanicButton />
        </div>
      </div>
    </header>
  );
}
