"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FirstAidKit, House, MapTrifold, Medal, User, type Icon } from "@phosphor-icons/react";
import { hidesNav } from "./no-nav-routes";

export type NavHref = "/" | "/map" | "/kit" | "/badges" | "/me";
export type NavLabel = "Home" | "Areas" | "Kit" | "Badges" | "Me";

export type NavItem = {
  href: NavHref;
  label: NavLabel;
  icon: Icon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/map", label: "Areas", icon: MapTrifold },
  { href: "/kit", label: "Kit", icon: FirstAidKit },
  { href: "/badges", label: "Badges", icon: Medal },
  { href: "/me", label: "Me", icon: User },
];

/**
 * The href of the currently active nav item for a pathname.
 * Room and step routes belong to the map ladder. `/help` and anything
 * else outside the five sections has no active item.
 */
export function activeNav(pathname: string): string {
  if (pathname === "/") return "/";
  if (pathname.startsWith("/map") || pathname.startsWith("/room/") || pathname.startsWith("/step/")) {
    return "/map";
  }
  if (pathname.startsWith("/kit")) return "/kit";
  if (pathname.startsWith("/badges") || pathname.startsWith("/journey")) return "/badges";
  if (pathname.startsWith("/me")) return "/me";
  return "";
}

/**
 * Phone tabs (below 768px): a flat bar on the canvas, the active tab's icon
 * in a small teal sticker. Laptops and tablets use the top bar's links instead.
 */
export function BottomNav() {
  const pathname = usePathname();
  const active = activeNav(pathname);

  // Routes in no-nav-routes.ts (currently just /start) have nowhere for
  // these five tabs to lead yet: hide the nav there rather than link to
  // empty screens.
  if (hidesNav(pathname)) return null;

  return (
    <nav
      data-no-print
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === active;
          const ItemIcon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-[64px] flex-col items-center justify-center gap-0.5 text-center text-xs font-semibold leading-tight ${
                  isActive ? "text-ink" : "text-muted"
                }`}
              >
                <span
                  className={`flex size-9 items-center justify-center rounded-full transition-transform duration-[var(--dur-ui)] ease-[var(--ease-out)] ${
                    isActive ? "-rotate-6 border-[3px] border-die bg-accent text-on-accent shadow-sticker" : ""
                  }`}
                >
                  <ItemIcon size={20} weight={isActive ? "fill" : "regular"} aria-hidden />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
