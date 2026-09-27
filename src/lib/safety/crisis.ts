/**
 * Runs on the device before any AI call. On a match the app skips AI and shows support lines.
 * Deliberately errs towards flagging: a false alarm shows a kind screen, a miss could matter.
 */
const PATTERNS: RegExp[] = [
  /\bkill(ing)? my ?self\b/,
  /\b(want|wanna|going|gonna) ?(to|2)? die\b(?! laughing| (of|from) (embarrassment|shame|laughing|boredom|nerves|cringe))/,
  /\bend(ing)? (it all|my life)\b/,
  /\b(end|ending) it\b(?! (all )?(on|with)\b)/,
  /\bsuicid(e|al)\b/,
  /\bsu[ie]?c[ie]?de|\bsuiside|\bsuic?idal\b/,
  /\b(hurt|hurting|harm|harming|cut|cutting) my ?self\b/,
  /\bself[ -]?harm/,
  /\b(don'?t|dont|do not) (want|wanna) (to )?(be alive|live|exist|be here)\b/,
  /\b(better off|care if i was|care if i were) (dead|gone)\b/,
  /\b(better off|be fine|be happier) without me\b/,
  /\bif i (was|were) gone\b/,
  /\bwish (i|id) (was|were|wasn'?t|weren'?t|was not|were not) (dead|alive|here|born)\b/,
  /\b(kms|kys|killmyself|unalive)\b/,
  /\b(nobody|no one|noone) (would|will|wud) (miss me|care if i (died|was dead|was gone|were gone|disappeared))\b/,
  /\b(no|isn'?t|not) (point|worth) (in )?(living|being alive)\b|\blife (isn'?t|is not|aint) worth living\b|\bpoint of living\b/,
  /\b(can'?t|cant|cannot) (go on|do this anymore|take (it|this) anymore)\b(?! (stage|the|a|with|to|holiday))/,
  /\b(i'?ve been|been|i keep|started|keep) cutting\b|\b(cut|cutting|slit|slitting) (my )?(wrists?|arms?|legs?|thighs?)\b/,
  /\b(overdose|od on|take all (my|the) pills)\b/,
  /\b(hang|hanging|drown|drowning) my ?self\b|\bjump(ing)? off (a|the) (bridge|building|roof)\b/,
  /\bno reason to live\b/,
  // abuse
  /\b(my|his|her|our) (mum|mom|dad|stepdad|stepmum|stepmom|mother|father|brother|sister|uncle|parents?|carer|boyfriend|girlfriend) (hits|hit|beats|hurts|hurt|touches|touched|kicks|kicked|punches|punched) me\b(?! (at|in|on the (shoulder|arm|back)))/,
  /\b(he|she|they|someone|somebody) (\w+ ){0,3}(hurts|hits|beats) me\b/,
  /\b(being|been|was|got) (abused|molested|raped)\b/,
  /\b(touched|touching|touches) me (where|down there|when i didn'?t)\b/,
  /\bscared to go home\b/,
];

export function checkCrisis(text: string): { crisis: boolean } {
  const t = text
    .toLowerCase()
    .replace(/[‘’ʼ`]/g, "'")
    .replace(/\s+/g, " ");
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
    lines: [
      { name: "988 Suicide and Crisis Lifeline", contact: "Call or text 988", note: "Free, any time." },
      { name: "Childhelp", contact: "1-800-422-4453", note: "Free, for children and teens facing abuse." },
    ],
  },
  NZ: {
    emergency: "111",
    lines: [
      { name: "Need to talk?", contact: "Call or text 1737", note: "Free, any time." },
      { name: "Youthline", contact: "0800 376 633", note: "Free, for young people." },
    ],
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
