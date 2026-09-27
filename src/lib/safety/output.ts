import { checkCrisis } from "./crisis";

/**
 * Checks on every AI reply before anyone sees it. The local check always
 * runs; Llama Guard (Workers AI) runs as well when the binding and the free
 * budget allow. Anything uncertain is replaced by a pre-written reply.
 */

export type ReplyKind = "coach" | "tidy";
export type AiAge = "teen" | "adult";

const MAX_LENGTH: Record<ReplyKind, Record<AiAge, number>> = {
  coach: { teen: 220, adult: 320 },
  tidy: { teen: 300, adult: 300 },
};

/** Normalises model text into the app's voice: no dashes, no exclamation marks, no markdown. */
export function cleanReply(text: string): string {
  return text
    .replace(/[*_#`]/g, "")
    .replace(/\s*[—–‒―]\s*|\s+-+\s+/g, ", ")
    .replace(/\?\s*[!！]+/g, "?")
    .replace(/[!！]+/g, ".")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^["“'‘]+|["”'’]+$/g, "")
    .replace(/^,\s*/, "")
    .replace(/\.{2,}$/, ".")
    .replace(/,\s*([.?])/g, "$1")
    .trim();
}

/**
 * `coachOnly` patterns apply to Cobi's replies. A tidy is the person's own
 * sentence (the drift check keeps it that way), so it may mention being
 * calm or nervous; it still may not carry links, contact details, harm or
 * swearing.
 */
const PATTERNS: { reason: string; re: RegExp; coachOnly?: true }[] = [
  { reason: "email", re: /\S+@\S+\.\S+/ },
  { reason: "link", re: /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|org|net|io|co|uk|app|dev)\b/ },
  { reason: "phone", re: /\+?\d[\d\s().-]{6,}\d/ },
  {
    reason: "banned",
    coachOnly: true,
    re: /\bcalm\b|\byou'?(ve)? (\w+ )?got this\b|\brelax\b|\bdon'?t (be|get) (so |too )?(nervous|shy|scared|anxious|worried)\b|\bdon'?t worry\b|\bno need to (be )?(nervous|worry)\b|\b(deep )?breaths?\b|\bbreathe\b|\bslow down\b/,
  },
  // Never comment on how someone spoke or how they seemed, not even as praise.
  {
    reason: "speech",
    coachOnly: true,
    re: /\bstutter|\bstammer|\bfluen(t|cy)\b|\bfillers?\b|\bum+\b|\buh+\b|\bpaus(e|es|ed|ing)\b|\bmumbl|\btrip(ped)? over\b|\bslow(ly|er)?\b|\bclearly\b|\bsmoothly\b|\bsteady\b|\bconfident(ly)?\b|\bnerv(es|ous)\b|\banxi(ous|ety)\b|\b(loud|quiet)(ly|er)?\b|\b(seemed|sounded|looked|seem|sound|look) (a bit |so |really |very |quite )?(scared|shy|worried|unsure|tense)\b|\b(your|the way you) (voice|delivery|speaking|pace|words came out)\b/,
  },
  // No health claims or labels.
  {
    reason: "health",
    coachOnly: true,
    re: /\bdiagnos|\bdisorder\b|\bmedicat|\btherap(y|ist)\b|\bsymptom|\byou (have|may have|might have) (adhd|autism|depression)\b/,
  },
  // Never ask for anything that identifies someone.
  {
    reason: "personal",
    coachOnly: true,
    re: /\b(what'?s|what is|tell me) your (full |real |last )?name\b|\bwhere do you live\b|\bhow old are you\b|\bwhich school\b|\byour (home )?address\b|\bphone number\b|\bsend me\b|\bphotos?\b|\bsnapchat|\binstagram|\bwhatsapp|\bdiscord\b/,
  },
  { reason: "profanity", re: /\b(fuck\w*|shit\w*|bitch\w*|bastards?|dicks?|cunts?|piss(ed)?|crap|damn|wank\w*|twats?|sluts?|whores?)\b/ },
];

/** The crisis check listens for first-person words; a reply must also never talk about harm to the reader. */
const HARM = /\b(kill|hurt|harm|cut) (yo)?u?r ?sel(f|ves)\b|\bkys\b|\bsuicid|\bself[ -]?harm|\bunalive|\b(go )?die\b|\bdeath\b|\bdead\b|\bweapons?\b|\bdrugs?\b|\balcohol\b/;

const wordsOf = (t: string) => t.toLowerCase().match(/[a-z0-9']+/g) ?? [];

export type LocalCheck = { ok: true } | { ok: false; reason: string };

/**
 * The local output filter. `input` is the person's own sentence, used for
 * tidy so a "tidy" cannot drift into new content.
 */
export function checkOutputLocal(text: string, kind: ReplyKind, age: AiAge, input = ""): LocalCheck {
  const t = text.toLowerCase().replace(/[‘’ʼ`]/g, "'");
  if (!t.trim()) return { ok: false, reason: "empty" };
  if (text.length > MAX_LENGTH[kind][age]) return { ok: false, reason: "long" };
  if (checkCrisis(text).crisis || HARM.test(t)) return { ok: false, reason: "crisis" };
  for (const p of PATTERNS) {
    if (p.coachOnly && kind !== "coach") continue;
    if (p.re.test(t)) return { ok: false, reason: p.reason };
  }
  if (kind === "tidy") {
    if (text.length > input.length * 2 + 40) return { ok: false, reason: "drift" };
    const own = new Set(wordsOf(input));
    const out = wordsOf(text);
    const shared = out.filter((w) => own.has(w)).length;
    if (out.length > 0 && shared / out.length < 0.4) return { ok: false, reason: "drift" };
  }
  return { ok: true };
}

/** The part of the Workers AI binding this app uses. */
export type AiBinding = { run: (model: string, input: Record<string, unknown>) => Promise<unknown> };

export const GUARD_MODEL = "@cf/meta/llama-guard-3-8b";

export type GuardVerdict = "safe" | "unsafe" | "unavailable";

/** Reads Llama Guard's answer, which is either `{ response: { safe } }` or text starting "safe" / "unsafe". */
export function parseGuard(out: unknown): GuardVerdict {
  const r = (out as { response?: unknown } | null)?.response;
  if (r && typeof r === "object" && typeof (r as { safe?: unknown }).safe === "boolean") {
    return (r as { safe: boolean }).safe ? "safe" : "unsafe";
  }
  if (typeof r === "string") {
    const first = r.trim().toLowerCase();
    if (first.startsWith("unsafe")) return "unsafe";
    if (first.startsWith("safe")) return "safe";
  }
  return "unavailable";
}

/** Asks Llama Guard whether this reply, to this message, is safe. Any failure is "unavailable". */
export async function guardReply(ai: AiBinding, userText: string, reply: string): Promise<GuardVerdict> {
  try {
    const out = await ai.run(GUARD_MODEL, {
      messages: [
        { role: "user", content: userText.slice(0, 600) },
        { role: "assistant", content: reply },
      ],
    });
    return parseGuard(out);
  } catch {
    return "unavailable";
  }
}

export type ReplyCheckDeps = {
  ai: AiBinding | null;
  /** Takes one unit of the guard's daily budget; false once it is used up. */
  takeGuard: () => boolean;
};

/**
 * The full check: clean, local filter, then Llama Guard when it can run.
 * Returns the cleaned text, or null when it must be replaced.
 */
export async function checkReply(
  raw: string,
  opts: { kind: ReplyKind; age: AiAge; userText: string },
  deps: ReplyCheckDeps,
): Promise<string | null> {
  const text = cleanReply(raw);
  if (!checkOutputLocal(text, opts.kind, opts.age, opts.userText).ok) return null;
  if (deps.ai && deps.takeGuard()) {
    const verdict = await guardReply(deps.ai, opts.userText, text);
    if (verdict === "unsafe") return null;
  }
  return text;
}
