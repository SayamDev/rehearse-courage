/**
 * Routes with no bottom nav: currently just first-visit setup, which has
 * nowhere for the five tabs (Home, Map, Kit, Badges, Me) to lead yet.
 * Shared by MainFrame, BottomNav and PanicButton so the three stay in sync
 * on which routes get the shorter, nav-free reserved space and offsets.
 */
export const NO_NAV_ROUTES = ["/start"];

export function hidesNav(pathname: string): boolean {
  return NO_NAV_ROUTES.includes(pathname);
}
