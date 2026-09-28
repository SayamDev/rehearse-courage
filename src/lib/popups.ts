import type { CourageState } from "./state";

/**
 * Pop-ups take turns: at most one per visit, so people read it instead of
 * closing everything, and never on pages where it would get in the way
 * (first visit, a practice step, support, or while Panic now is open).
 */
const KEY = "courage:popup";

/** Steps finished before "keep your progress safe" appears: by then there is something worth keeping. */
export const SAVE_AFTER_STEPS = 3;
/** A backup newer than this counts as safe enough. */
export const BACKUP_FRESH_DAYS = 30;

const QUIET_PAGES = ["/start", "/step/", "/help", "/privacy"];

export function quietPage(pathname: string, search: string): boolean {
  return QUIET_PAGES.some((p) => pathname.startsWith(p)) || new URLSearchParams(search).has("calm");
}

/** First visit only: after naming the firefly, on Home, before any practice. */
export function welcomeDue(s: Pick<CourageState, "companion" | "welcomed" | "records">, pathname: string): boolean {
  return !!s.companion && !s.welcomed && s.records.length === 0 && pathname === "/";
}

export function saveNudgeDue(
  s: Pick<CourageState, "records" | "lastBackup" | "welcomed"> & { settings: { saveNudgeOff: boolean } },
  now: Date,
): boolean {
  if (s.settings.saveNudgeOff || !s.welcomed || s.records.length < SAVE_AFTER_STEPS) return false;
  if (!s.lastBackup) return true;
  return now.getTime() - new Date(s.lastBackup).getTime() > BACKUP_FRESH_DAYS * 864e5;
}

export function popupShownThisVisit(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function markPopupShown() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    // Storage blocked: another pop-up may show on the next page, which is harmless.
  }
}

/** True when another dialog is open (including Panic now) or a pop-up already had its turn. */
export function popupBlocked(): boolean {
  return popupShownThisVisit() || !!document.querySelector("dialog[open], [role=dialog]");
}

/**
 * Asks the browser not to clear this site's data on its own (Safari can
 * after about a week away). Firefox asks the person first, so there it
 * only runs after a tap.
 */
export async function askToKeepData(fromTap = false) {
  try {
    const storage = navigator.storage;
    if (!storage?.persist || (await storage.persisted())) return;
    if (!fromTap && /firefox/i.test(navigator.userAgent)) return;
    await storage.persist();
  } catch {
    // Not supported: nothing to do.
  }
}
