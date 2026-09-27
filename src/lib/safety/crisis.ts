/**
 * Runs on the device before any AI call. On a match the app skips AI and shows support lines.
 * Deliberately errs towards flagging: a false alarm shows a kind screen, a miss could matter.
 */
const PATTERNS: RegExp[] = [
  /\bkill(ing)? my ?self\b/,
  /\b(want|wanna|going|gonna) ?(to|2)? die\b(?! laughing| (of|from) (embarrassment|shame|laughing|boredom|nerves|cringe))/,
  /\bend(ing)? (it all|my life)\b/,
  /\b(end|ending) it\b(?! (all )?(on|with|here|there|early|quickly|soon|nicely|properly|well|by|at|in)\b)/,
  /\bsu[a-z]{0,3}c+i+d(e|al)\b|\bsuiside\b|\bsui?[cs]i?d(e|al)\b/,
  /\b(hurt|hurting|harm|harming|cut|cutting) my ?self\b/,
  /\bself[ -]?harm/,
  /\b(don'?t|do not) (want|wanna) (to )?(be alive|live|exist|be here)\b/,
  /\b(better off|care if i was|care if i were) (dead|gone)\b/,
  /\b(better off|be fine|be happier) without me\b/,
  /\bif i (was|were) gone\b/,
  /\bwish (i|id) (was|were|wasn'?t|weren'?t|was not|were not) (dead|alive|here|born)\b/,
  /\b(kms|kys|killmyself|unalive)\b/,
  /\b(nobody|no one|noone) (would|will|wud) (miss me|care if i (died|was dead|was gone|were gone|disappeared))\b/,
  /\b(no|isn'?t|not) (point|worth) (in )?(living|being alive)\b|\blife (isn'?t|is not|aint) worth living\b|\bpoint of living\b/,
  /\b(can'?t|cant|cannot) (go on|do this anymore|take (it|this) anymore)\b(?! (stage|the|a|with|to|holiday))/,
  /\b(i'?ve been|i keep|started|keep|been) cutting\b(?! (people|someone|him|her|them|in|off|out|back|down|up|across|through|corners?|class|classes|school|lessons?|it|things|words|sentences|the|a|an|some|my (notes|hair|nails|speech|script|slides|words|sentences|talk|time))\b)|\b(cut|cutting|slit|slitting) (my )?(wrists?|arms?|legs?|thighs?)\b/,
  /\b(overdose|od on|take all (my|the) pills)\b/,
  /\b(hang|hanging|drown|drowning) my ?self\b|\bjump(ing)? off (a|the) (bridge|building|roof)\b/,
  /\bno reason to live\b/,
  /\b(want|wanna) (to )?be dead\b|\b(should|might as well) (just )?die\b/,
  /\b(don'?t|do not) (want|wanna) (to )?(wake up|ever wake up)\b(?! (early|at|so|for|in time))|\b(want|wanna) (to )?(not|never) wake up\b/,
  /\bhate my ?self\b|\b(being|getting) bullied\b|\bwant to disappear\b/,
  // abuse
  /\b(my|his|her|our) (mum|mom|mam|dad|stepdad|stepmum|stepmom|mother|father|brother|sister|uncle|aunt|auntie|cousin|grandad|grandpa|nan|parents?|carer|foster (mum|mom|dad|parent)|teacher|coach|boyfriend|girlfriend) (keeps |always |still )?(hits|hit|hitting|beats|beat|beating|hurts|hurt|hurting|touches|touched|touching|kicks|kicked|punches|punched|slaps|slapped) me\b(?! (at|in) (chess|fifa|games?|football|the (race|game|debate|quiz))| on the (shoulder|arm|back) (to|and|for|when)| (at|in) (everything|sports?))/,
  /\b(he|she|they|someone|somebody) ((?!it\b|that\b|this\b)\w+ ){0,3}(hurts|hits|beats) me\b/,
  /\b(he|she|they|someone|somebody) ((?!it\b|that\b|this\b)\w+ ){0,3}(hit|hurt|beat|kicked|punched|slapped|hitting|hurting|beating|kicking|punching|slapping) me\b(?! (at|in) (chess|fifa|games?|football|cards|the (race|game|debate|quiz|match))| up\b| with (a|the|that|this|some|his|her|their) (question|questions|joke|jokes|look|idea|news))/,
  /(?<!\b(it|nerves?|this|that|panic|anxiety|fear|feelings?|thoughts?|doubts?|reality|words?) )\b(keeps?|always|keeps on) (hitting|hurting|beating|kicking|punching|slapping|touching) me\b/,
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
