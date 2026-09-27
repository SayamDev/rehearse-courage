/**
 * Only same-site paths are allowed as the "Carry on" target after a crisis
 * check. Anything with whitespace or control characters is refused
 * outright (browsers strip tabs and newlines, which can turn "/\t/x" into
 * "//x"), and the result must still resolve to this site.
 */
export function safeReturn(from: string | string[] | undefined): string | null {
  const v = Array.isArray(from) ? from[0] : from;
  if (!v || !v.startsWith("/") || /[^\x21-\x7e]/.test(v) || v.startsWith("//") || v.includes("\\")) return null;
  try {
    const url = new URL(v, "https://same.site");
    if (url.origin !== "https://same.site") return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}

/**
 * A link for a support line's contact, when it can be one: a phone number
 * ("0800 1111", "Call or text 988") becomes tel:, "Text SHOUT to 85258"
 * becomes an sms: link with the keyword filled in, and a bare domain
 * becomes a web link. Otherwise null.
 */
export function contactHref(contact: string): string | null {
  const text = contact.match(/^text (\S+) to ([\d ]+)$/i);
  if (text) return `sms:${text[2].replace(/\s/g, "")}?&body=${encodeURIComponent(text[1])}`;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(contact)) return `https://${contact}`;
  const phone = contact.match(/^(?:call or text |call )?([\d][\d\s-]*)$/i);
  if (phone) return `tel:${phone[1].replace(/[\s-]/g, "")}`;
  return null;
}

/** Splits an emergency number like "112 or 999" into callable parts; the text fallback has none. */
export function emergencyNumbers(emergency: string): string[] {
  return /^[\d\s]+(or [\d\s]+)*$/.test(emergency) ? emergency.split(/\s+or\s+/).map((n) => n.trim()) : [];
}
