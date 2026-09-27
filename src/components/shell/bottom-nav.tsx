"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FirstAidKit, House, MapTrifold, Medal, User, type Icon } from "@phosphor-icons/react";
import { hidesNav } from "./no-nav-routes";

export type NavHref = "/" | "/map" | "/kit" | "/badges" | "/me";
export type NavLabel = "Home" | "Map" | "Kit" | "Badges" | "Me";

export type NavItem = {
  href: NavHref;
  label: NavLabel;
  icon: Icon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/map", label: "Map", icon: MapTrifold },
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
  if (pathname.startsWith("/badges")) return "/badges";
  if (pathname.startsWith("/me")) return "/me";
  return "";
}

export function BottomNav() {
  const pathname = usePathname();
  const active = activeNav(pathname);

  // Routes in no-nav-routes.ts (currently just /start) have nowhere for
  // these five tabs to lead yet: hide the nav there rather than link to
  // empty screens.
  if (hidesNav(pathname)) return null;

  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-3 z-30 px-3 sm:px-6">
      <div className="mx-auto flex h-16 max-w-[1100px] items-stretch justify-between rounded-full bg-chrome px-1 text-on-chrome shadow-card ring-1 ring-chrome-edge">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === active;
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="group flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-xs transition-colors duration-[var(--dur-ui)] ease-[var(--ease-out)] hover:bg-on-chrome/10 active:bg-on-chrome/15"
            >
              <ItemIcon
                size={24}
                weight="regular"
                aria-hidden
                className={isActive ? "text-amber" : "text-on-chrome"}
              />
              <span className={`relative pb-0.5 ${isActive ? "text-amber" : "text-on-chrome"}`}>
                {item.label}
                {isActive ? (
                  <span aria-hidden className="absolute inset-x-1 -bottom-0.5 h-0.5 rounded-full bg-amber" />
                ) : null}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
