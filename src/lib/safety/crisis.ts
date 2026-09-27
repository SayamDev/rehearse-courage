/**
 * Runs on the device before any AI call. On a match the app skips AI and shows support lines.
 * Deliberately errs towards flagging: a false alarm shows a kind screen, a miss could matter.
 */
const PATTERNS: RegExp[] = [
  /\bkill(ing)? my ?self\b/,
  /\b(want|wanna|going) to die\b/,
  /\bend(ing)? (it all|my life)\b/,
  /\bsuicid(e|al)\b/,
  /\b(hurt|hurting|harm|harming|cut|cutting) my ?self\b/,
  /\bself[ -]?harm/,
  /\b(don'?t|do not) want to (be alive|live|exist)\b/,
  /\b(better off|care if i was|care if i were) (dead|gone)\b/,
  /\bif i (was|were) gone\b/,
  /\b(hits|beats|touches) me\b/,
  /\bno reason to live\b/,
];

export function checkCrisis(text: string): { crisis: boolean } {
  const t = text.toLowerCase().replace(/['']/g, "'").replace(/\s+/g, " ");
  return { crisis: PATTERNS.some((p) => p.test(t)) };
}

export type SupportLine = { name: string; contact: string; note: string };

const LINES: Record<string, { lines: SupportLine[]; emergency: string }> = {
  GB: {
    emergency: "999",
    lines: [
      { name: "Childline", contact: "0800 1111", note: "Free, for anyone under 19." },
      { name: "Samaritans", contact: "116 123", note: "Free, any time, for anyone." },
      { name: "Shout", contact: "Text SHOUT to 85258", note: "Free text support, any time." },
    ],
  },
  IE: {
    emergency: "112 or 999",
    lines: [
      { name: "Childline", contact: "1800 66 66 66", note: "Free, for anyone under 18." },
      { name: "Samaritans", contact: "116 123", note: "Free, any time." },
    ],
  },
  US: {
    emergency: "911",
    lines: [{ name: "988 Suicide and Crisis Lifeline", contact: "Call or text 988", note: "Free, any time." }],
  },
  CA: {
    emergency: "911",
    lines: [
      { name: "Kids Help Phone", contact: "1-800-668-6868", note: "Free, for young people." },
      { name: "Suicide Crisis Helpline", contact: "Call or text 988", note: "Free, any time." },
    ],
  },
  AU: {
    emergency: "000",
    lines: [
      { name: "Kids Helpline", contact: "1800 55 1800", note: "Free, for ages 5 to 25." },
      { name: "Lifeline", contact: "13 11 14", note: "Free, any time." },
    ],
  },
};

const FALLBACK = {
  emergency: "your local emergency number",
  lines: [{ name: "Find a Helpline", contact: "findahelpline.com", note: "Free support lines in your country." }],
};

/** Country comes from the request at view time (for example Cloudflare's cf-ipcountry) and is never stored. */
export function supportLines(country: string | null): { lines: SupportLine[]; emergency: string } {
  const key = country?.toUpperCase() === "UK" ? "GB" : country?.toUpperCase();
  return (key && LINES[key]) || FALLBACK;
}
