/**
 * Daily limits kept in memory, so the free AI allowances are shared fairly
 * and never run out for everyone at once. Past a limit, people get the
 * on-device or pre-written reply instead; nobody is ever blocked. Each
 * Worker instance keeps its own counts, so this is a soft guard; the free
 * plans themselves cannot bill.
 */

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export type TokenKind = "coach" | "tidy" | "transcribe";

/** Per visitor, per day. */
export const VISITOR_LIMITS: Record<TokenKind, number> = {
  coach: num(process.env.DAILY_COACH_LIMIT, 30),
  tidy: num(process.env.DAILY_TIDY_LIMIT, 30),
  transcribe: num(process.env.DAILY_TRANSCRIBE_LIMIT, 60),
};

export type BudgetKind = "groqChat" | "groqTranscribe" | "groqAudioSeconds" | "workersChat" | "workersGuard" | "workersWhisper";

/**
 * Whole site, per day. Groq's free plan allows about 1,000 chat and 2,000
 * transcription requests (8 hours of audio) a day. Workers AI's free
 * allocation is about 10,000 neurons a day, shared by chat, speech and the
 * safety guard. Most of it goes to the guard, so as many replies as
 * possible get both checks; the backup chat and speech caps stay small.
 * Once the guard's share is used, replies still pass the local filter.
 */
export const SITE_CAPS: Record<BudgetKind, number> = {
  groqChat: num(process.env.SITE_GROQ_CHAT, 900),
  groqTranscribe: num(process.env.SITE_GROQ_TRANSCRIBE, 1900),
  groqAudioSeconds: num(process.env.SITE_GROQ_AUDIO_SECONDS, 27_000),
  workersChat: num(process.env.SITE_WORKERS_CHAT, 25),
  workersGuard: num(process.env.SITE_WORKERS_GUARD, 600),
  workersWhisper: num(process.env.SITE_WORKERS_WHISPER, 25),
};

export function today(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** A fresh set of counters; the app uses one shared instance, tests make their own. */
export function createLimits(visitor = VISITOR_LIMITS, site = SITE_CAPS) {
  const buckets = new Map<string, { day: string; count: number }>();
  const siteUse = { day: "", used: {} as Partial<Record<BudgetKind, number>> };

  function takeToken(kind: TokenKind, key: string, now = new Date()): boolean {
    const d = today(now);
    const id = `${kind}:${key}`;
    const b = buckets.get(id);
    const current = b && b.day === d ? b : { day: d, count: 0 };
    if (current.count >= visitor[kind]) return false;
    current.count += 1;
    buckets.set(id, current);
    if (buckets.size > 20_000) {
      for (const [k, v] of buckets) if (v.day !== d) buckets.delete(k);
    }
    return true;
  }

  function takeSiteBudget(kind: BudgetKind, amount = 1, now = new Date()): boolean {
    const d = today(now);
    if (siteUse.day !== d) {
      siteUse.day = d;
      siteUse.used = {};
    }
    const used = siteUse.used[kind] ?? 0;
    if (used + amount > site[kind]) return false;
    siteUse.used[kind] = used + amount;
    return true;
  }

  return { takeToken, takeSiteBudget };
}

export type Limits = ReturnType<typeof createLimits>;

/** The counters shared by every request this Worker instance handles. */
export const limits: Limits = createLimits();
