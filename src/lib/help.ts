/** Only same-site paths are allowed as the "Carry on" target after a crisis check. */
export function safeReturn(from: string | string[] | undefined): string | null {
  const v = Array.isArray(from) ? from[0] : from;
  if (!v || !v.startsWith("/") || v.startsWith("//") || v.includes("\\")) return null;
  return v;
}

/** A tel: link for plain phone numbers, a web link for a bare domain, otherwise null (e.g. "Text SHOUT to 85258"). */
export function contactHref(contact: string): string | null {
  if (/^[\d\s-]+$/.test(contact)) return `tel:${contact.replace(/[\s-]/g, "")}`;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(contact)) return `https://${contact}`;
  return null;
}
