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

/** A random secret made in memory each day and never stored, so a key cannot be turned back into an address. */
let secret: { day: string; key: CryptoKey } | null = null;

async function dailySecret(day: string): Promise<CryptoKey> {
  if (secret?.day !== day) {
    const raw = crypto.getRandomValues(new Uint8Array(32));
    secret = { day, key: await crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]) };
  }
  return secret.key;
}

/**
 * A daily key for rate limiting: an HMAC of the visitor's IP address with
 * a random secret that only lives in memory and changes every day. It is
 * never logged, cannot be reversed, and cannot be linked across days.
 * Cloudflare sets `cf-connecting-ip`; without it (local development)
 * everyone shares one key.
 */
export async function clientKey(request: Request, now = new Date()): Promise<string> {
  const ip = request.headers.get("cf-connecting-ip") ?? "local";
  const sig = await crypto.subtle.sign("HMAC", await dailySecret(today(now)), new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(sig).slice(0, 8), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** True when the body is declared and no larger than `max` bytes. Checked before anything is read. */
export function bodyWithin(request: Request, max: number): boolean {
  const n = Number(request.headers.get("content-length"));
  return Number.isFinite(n) && n > 0 && n <= max;
}

/** JSON answer that no cache or proxy keeps. */
export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
