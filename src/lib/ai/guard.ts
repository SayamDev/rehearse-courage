import { today } from "./limits";

/**
 * Only this site's own pages may use the AI routes, so other sites cannot
 * spend the free allowance. Browsers always send `Sec-Fetch-Site` or
 * `Origin` on a POST from script.
 */
export function sameOrigin(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === (request.headers.get("host") ?? new URL(request.url).host);
  } catch {
    return false;
  }
}

/**
 * A daily key for rate limiting: a hash of the visitor's IP address and
 * today's date, shortened. It stays in memory, is never logged, and cannot
 * be linked from one day to the next.
 */
export async function clientKey(request: Request, now = new Date()): Promise<string> {
  const ip =
    request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const bytes = new TextEncoder().encode(`${ip}|${today(now)}`);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return Array.from(digest.slice(0, 8), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** JSON answer that no cache or proxy keeps. */
export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
