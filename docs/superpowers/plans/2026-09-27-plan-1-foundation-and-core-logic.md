# Rehearse Courage, Plan 1: Foundation and Core Logic

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A deployable Next.js shell for Rehearse Courage plus every piece of core logic (age rules, content, ladder, courage points, achievements, quests, companion, crisis check, on-device store, backup) fully unit tested, with no UI decisions made yet.

**Architecture:** Pure TypeScript modules in `src/lib/` hold all rules and are tested with Vitest. A single serialisable `CourageState` is changed only through pure functions in `src/lib/state.ts`; `src/lib/store.ts` binds it to React and localStorage. Screens, AI, voices, games and creatures come in later plans (Plan 2 is the design phase with ultimate-frontend and 12ui).

**Tech Stack:** Next.js 16.3.6 (App Router), React 19.2.8, TypeScript 5, Tailwind v4, Vitest 5, `@opennextjs/cloudflare` + `wrangler` (Cloudflare Workers free plan).

**Spec:** `docs/superpowers/specs/2026-09-27-rehearse-courage-design.md`

## Global Constraints

- Free forever: no paid services, no card on any account, no analytics, trackers or ads.
- No accounts. All progress on the device, localStorage key `courage:v1`.
- Skipped age band means `"under13"` (safest). Under 13 never uses generative AI or server speech to text.
- Never score fluency, fillers, pauses or stutters. Never punish: no streak resets, no losing, badges never removed.
- Points reward courage, not quality: same base points for a 5-second or a 60-second answer.
- Visible copy: no em dashes or en dashes as separators; no "Oops"; no exclamation marks in success messages; plain, kind words.
- Ownership: LICENSE all rights reserved, `package.json` `"license": "UNLICENSED"`, `"author": "Sayam Ajmal"`, footer "© 2026 Sayam Ajmal. All rights reserved."
- Keep the Rehearse headers: COOP `same-origin`, COEP `credentialless`, `Referrer-Policy: no-referrer`.
- Never commit `.env*` files.
- Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## File map

| File | Responsibility |
|---|---|
| `next.config.ts`, `wrangler.jsonc`, `open-next.config.ts`, `scripts/cf.sh`, `vitest.config.mts` | Build, headers, Cloudflare deploy, tests (copied from Rehearse, renamed) |
| `src/app/layout.tsx`, `src/app/page.tsx` | Holding shell with footer |
| `src/lib/types.ts` | Shared types |
| `src/lib/age.ts` | Age band rules and wording choice |
| `src/lib/content/situations.ts` | Pre-written situations for the three rooms |
| `src/lib/content/phrases.ts` | Rescue phrases and sentence frames |
| `src/lib/ladder.ts` | Levels, progress per situation, suggestions, map light, custom steps |
| `src/lib/dates.ts` | Local day keys and week start |
| `src/lib/courage.ts` | Courage points and brave days |
| `src/lib/achievements.ts` | Badge list and evaluation |
| `src/lib/quests.ts` | Daily quests and progress |
| `src/lib/companion.ts` | Species and growth stage |
| `src/lib/safety/crisis.ts` | Crisis check and regional support lines |
| `src/lib/state.ts` | `CourageState`, defaults, normalise, pure actions |
| `src/lib/backup.ts` | Export and import backup text |
| `src/lib/store.ts` | React + localStorage binding |

---

### Task 1: Scaffold, config, holding page, deploy shell

**Files:**
- Create: whole Next.js app in `~/code/rehearse-courage` (existing `docs/` and `.git` stay)
- Create: `LICENSE`, `README.md`, `src/test/empty.ts`, `scripts/cf.sh`, `wrangler.jsonc`, `open-next.config.ts`, `vitest.config.mts`, `src/lib/smoke.test.ts`
- Modify: `next.config.ts`, `package.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

**Interfaces:**
- Consumes: nothing
- Produces: `npm test`, `npm run build`, `npm run typecheck`, `npm run cf:deploy`; alias `@/` to `src/`

- [ ] **Step 1: Create the app**

```bash
cd ~/code/rehearse-courage
npx create-next-app@16.3.6 . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

Expected: "Success! Created rehearse-courage". `docs/` still present.

- [ ] **Step 2: Add dependencies matching Rehearse**

```bash
npm install @phosphor-icons/react@^2.1.10 motion@^13.4.1 lottie-web@^5.13.0 zod@^4.6.5 @opennextjs/cloudflare@^1.20.6
npm install -D vitest@^5.0.1 wrangler@^4.138.0 @playwright/test@^1.63.0 @axe-core/playwright@^4.13.0
```

- [ ] **Step 3: Set scripts and ownership in `package.json`**

Replace the `scripts` block and add fields so these keys read exactly:

```json
  "scripts": {
    "dev": "next dev --port 3330",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "typecheck": "next typegen && tsc --noEmit",
    "test:e2e": "playwright test",
    "cf:build": "sh scripts/cf.sh build-only",
    "cf:preview": "sh scripts/cf.sh preview",
    "cf:deploy": "sh scripts/cf.sh deploy"
  },
  "author": "Sayam Ajmal",
  "license": "UNLICENSED",
```

- [ ] **Step 4: Write `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Cross-origin isolation lets on-device voices and models use several CPU threads.
  // "credentialless" keeps plain cross-origin model downloads working.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
          // Hugging Face refuses model downloads referred from workers.dev.
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 5: Cloudflare files**

`wrangler.jsonc`:

```jsonc
{
	"$schema": "node_modules/wrangler/config-schema.json",
	// Free Cloudflare Workers plan. No R2, KV or paid bindings, so nothing here can bill.
	"main": ".open-next/worker.js",
	"name": "rehearse-courage",
	"compatibility_date": "2026-09-01",
	"compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
	"assets": {
		"directory": ".open-next/assets",
		"binding": "ASSETS"
	},
	"services": [
		{
			// Self-reference, required by the adapter. Must match "name" above.
			"binding": "WORKER_SELF_REFERENCE",
			"service": "rehearse-courage"
		}
	],
	"observability": { "enabled": false }
}
```

`open-next.config.ts`:

```ts
// No incremental static regeneration, so no cache storage (R2) is needed.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig();
```

`scripts/cf.sh`:

```sh
#!/bin/sh
# Builds for Cloudflare without local-only settings. The adapter bundles any .env files into
# the worker, so .env.local is moved aside during the build. Keys online come from `wrangler secret put`.
# Usage: scripts/cf.sh deploy | preview | build-only
set -e
cd "$(dirname "$0")/.."
if [ -f .env.local ]; then
  mv .env.local .env.local.deploying
  trap 'mv .env.local.deploying .env.local' EXIT INT TERM
fi
npx opennextjs-cloudflare build
if [ "${1:-deploy}" != "build-only" ]; then npx opennextjs-cloudflare "${1:-deploy}"; fi
```

Append to `.gitignore`:

```
# cloudflare
/.open-next/
/.wrangler/
```

- [ ] **Step 6: Vitest config and stub**

`vitest.config.mts`:

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Browser tests in e2e/ run with Playwright (npm run test:e2e).
  test: { include: ["src/**/*.test.ts"] },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Next.js guards server modules with this import; it has no meaning in tests.
      "server-only": fileURLToPath(new URL("./src/test/empty.ts", import.meta.url)),
    },
  },
});
```

`src/test/empty.ts`:

```ts
export {};
```

`src/lib/smoke.test.ts`:

```ts
import { expect, test } from "vitest";

test("test runner works", () => {
  expect(1 + 1).toBe(2);
});
```

- [ ] **Step 7: Holding shell**

`src/app/globals.css` (replace entirely; real tokens arrive in Plan 2):

```css
@import "tailwindcss";

:root {
  color-scheme: light dark;
}

body {
  margin: 0;
  font-family: ui-sans-serif, system-ui, sans-serif;
  background: Canvas;
  color: CanvasText;
}
```

`src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rehearse Courage",
  description: "Free, private practice for speaking up in class, with friends and in front of a group.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="px-4 py-8 text-sm">
          <p>Rehearse Courage, a Rehearse project, by Sayam Ajmal.</p>
          <p>© 2026 Sayam Ajmal. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
```

`src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24">
      <h1 className="text-4xl font-bold">Rehearse Courage</h1>
      <p className="mt-4">A calm place to practise speaking up. Coming soon.</p>
    </main>
  );
}
```

- [ ] **Step 8: LICENSE and README**

`LICENSE`:

```
Copyright (c) 2026 Sayam Ajmal. All rights reserved.

Rehearse Courage, including its source code, design, text, situations, characters,
companion creatures, badges, animations and all other content, is the property of
Sayam Ajmal. No part of it may be copied, modified, distributed or used without
written permission from Sayam Ajmal.
```

`README.md`:

```md
# Rehearse Courage

Free, private practice for speaking up in class, with friends and in front of a group.
A Rehearse project, by Sayam Ajmal.

- Dev: `npm run dev` (port 3330)
- Tests: `npm test`
- Deploy: `npm run cf:deploy` (needs `wrangler login` once)

© 2026 Sayam Ajmal. All rights reserved. See LICENSE.
```

- [ ] **Step 9: Verify**

```bash
npm test && npm run typecheck && npm run build
```

Expected: 1 test passed; typecheck clean; build ends with the route table and no errors.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Scaffold Rehearse Courage shell with Cloudflare deploy setup

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 11: Deploy shell (needs the maker's Cloudflare login)**

```bash
npm run cf:deploy
```

Expected: "Deployed rehearse-courage" and URL `https://rehearse-courage.sayamdev.workers.dev`. If wrangler asks to log in, stop and ask the maker to run `npx wrangler login`. A custom `courage.` subdomain is a later decision; workers.dev uses the worker name.

---

### Task 2: Shared types and age rules

**Files:**
- Create: `src/lib/types.ts`, `src/lib/age.ts`, `src/lib/age.test.ts`

**Interfaces:**
- Produces: types `AgeBand`, `Words`, `RoomId`, `Level`, `HardThing`, `Species`, `StepRecord`, `CustomStep`, `AppEvent`, `EventKind`; functions `effectiveAge(age: AgeBand | null): AgeBand`, `aiAllowed(age: AgeBand | null): boolean`, `serverSpeechAllowed(age: AgeBand | null): boolean`, `words(w: Words, age: AgeBand | null): string`

- [ ] **Step 1: Write `src/lib/types.ts`**

```ts
export type AgeBand = "under13" | "teen" | "adult";

/** Text written twice: simpler for under 13, fuller for everyone else. */
export type Words = { kid: string; grown: string };

export type RoomId = "class" | "friends" | "presenting";

/** 1 think, 2 type or whisper, 3 say alone, 4 say to coach, 5 a little pressure, 6 real-life mission. */
export type Level = 1 | 2 | 3 | 4 | 5 | 6;

export type HardThing =
  | "class"
  | "friends"
  | "presenting"
  | "panic"
  | "blushing"
  | "stuttering"
  | "words"
  | "focus";

export type Species = "firefly" | "hedgehog" | "fox";

export type StepRecord = {
  /** Situation id or custom step id. */
  situationId: string;
  level: Level;
  /** ISO timestamp. */
  at: string;
  /** Seconds spoken, or null when typed or not measured. */
  seconds: number | null;
  typed: boolean;
  roughDay: boolean;
};

export type CustomStep = { id: string; room: RoomId; text: string; createdAt: string };

export type EventKind = "kit" | "rescue" | "thenNow" | "panic";

export type AppEvent = { kind: EventKind; at: string };
```

- [ ] **Step 2: Write the failing test `src/lib/age.test.ts`**

```ts
import { describe, expect, test } from "vitest";
import { aiAllowed, effectiveAge, serverSpeechAllowed, words } from "./age";

describe("age rules", () => {
  test("skipped age counts as under 13", () => {
    expect(effectiveAge(null)).toBe("under13");
  });

  test("AI only for 13 and over", () => {
    expect(aiAllowed(null)).toBe(false);
    expect(aiAllowed("under13")).toBe(false);
    expect(aiAllowed("teen")).toBe(true);
    expect(aiAllowed("adult")).toBe(true);
  });

  test("server speech to text only for 13 and over", () => {
    expect(serverSpeechAllowed(null)).toBe(false);
    expect(serverSpeechAllowed("under13")).toBe(false);
    expect(serverSpeechAllowed("teen")).toBe(true);
  });

  test("words picks the kid version for under 13 and skipped age", () => {
    const w = { kid: "short", grown: "longer words" };
    expect(words(w, null)).toBe("short");
    expect(words(w, "under13")).toBe("short");
    expect(words(w, "teen")).toBe("longer words");
    expect(words(w, "adult")).toBe("longer words");
  });
});
```

- [ ] **Step 3: Run it and see it fail**

Run: `npx vitest run src/lib/age.test.ts`
Expected: FAIL, cannot find module `./age`.

- [ ] **Step 4: Write `src/lib/age.ts`**

```ts
import type { AgeBand, Words } from "./types";

/** A skipped age question is treated as under 13, the safest setting. */
export function effectiveAge(age: AgeBand | null): AgeBand {
  return age ?? "under13";
}

/** Generative AI (coach replies, sentence tidy) is only for 13 and over. */
export function aiAllowed(age: AgeBand | null): boolean {
  return effectiveAge(age) !== "under13";
}

/** Sending recorded speech to a server for transcription is only for 13 and over. */
export function serverSpeechAllowed(age: AgeBand | null): boolean {
  return effectiveAge(age) !== "under13";
}

export function words(w: Words, age: AgeBand | null): string {
  return effectiveAge(age) === "under13" ? w.kid : w.grown;
}
```

- [ ] **Step 5: Run it and see it pass**

Run: `npx vitest run src/lib/age.test.ts`
Expected: 4 passed.

- [ ] **Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/age.ts src/lib/age.test.ts
git commit -m "Add shared types and age rules (no AI under 13)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Pre-written content (situations, rescue phrases, frames)

**Files:**
- Create: `src/lib/content/situations.ts`, `src/lib/content/phrases.ts`, `src/lib/content/content.test.ts`

**Interfaces:**
- Consumes: `Words`, `RoomId` from `@/lib/types`
- Produces: `type Situation = { id: string; room: RoomId; title: Words; scene: Words; ideas: Words[]; mission: Words }`; `SITUATIONS: Situation[]`; `ROOMS: { id: RoomId; name: Words }[]`; `situationById(id: string): Situation | undefined`; `RESCUE_PHRASES: { id: string; text: Words; when: Words }[]`; `FRAMES: { id: string; text: Words }[]`

- [ ] **Step 1: Write the failing test `src/lib/content/content.test.ts`**

```ts
import { describe, expect, test } from "vitest";
import { ROOMS, SITUATIONS, situationById } from "./situations";
import { FRAMES, RESCUE_PHRASES } from "./phrases";

const allText = (): string[] => [
  ...ROOMS.flatMap((r) => [r.name.kid, r.name.grown]),
  ...SITUATIONS.flatMap((s) => [s.title, s.scene, s.mission, ...s.ideas].flatMap((w) => [w.kid, w.grown])),
  ...RESCUE_PHRASES.flatMap((p) => [p.text.kid, p.text.grown, p.when.kid, p.when.grown]),
  ...FRAMES.flatMap((f) => [f.text.kid, f.text.grown]),
];

describe("content", () => {
  test("every room has its situations from the spec", () => {
    expect(SITUATIONS.filter((s) => s.room === "class")).toHaveLength(4);
    expect(SITUATIONS.filter((s) => s.room === "friends")).toHaveLength(4);
    expect(SITUATIONS.filter((s) => s.room === "presenting")).toHaveLength(2);
  });

  test("ids are unique and lookup works", () => {
    const ids = SITUATIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(situationById("class-answer")?.room).toBe("class");
    expect(situationById("nope")).toBeUndefined();
  });

  test("each situation has at least two ideas", () => {
    for (const s of SITUATIONS) expect(s.ideas.length).toBeGreaterThanOrEqual(2);
  });

  test("copy rules: no em or en dashes, no Oops, nothing empty", () => {
    for (const t of allText()) {
      expect(t.trim().length).toBeGreaterThan(0);
      expect(t).not.toMatch(/[–—]/);
      expect(t.toLowerCase()).not.toContain("oops");
    }
  });

  test("there are enough rescue phrases and frames", () => {
    expect(RESCUE_PHRASES.length).toBeGreaterThanOrEqual(8);
    expect(FRAMES.length).toBeGreaterThanOrEqual(6);
  });
});
```

- [ ] **Step 2: Run it and see it fail**

Run: `npx vitest run src/lib/content/content.test.ts`
Expected: FAIL, cannot find module `./situations`.

- [ ] **Step 3: Write `src/lib/content/situations.ts`**

```ts
import type { RoomId, Words } from "@/lib/types";

export type Situation = {
  id: string;
  room: RoomId;
  title: Words;
  /** What is happening, told to the user. */
  scene: Words;
  /** Example things the user could say. */
  ideas: Words[];
  /** The real-life version for step 6. */
  mission: Words;
};

const w = (kid: string, grown: string = kid): Words => ({ kid, grown });

export const ROOMS: { id: RoomId; name: Words }[] = [
  { id: "class", name: w("In class") },
  { id: "friends", name: w("With friends") },
  { id: "presenting", name: w("Talking to a group", "Presenting") },
];

export const SITUATIONS: Situation[] = [
  {
    id: "class-answer",
    room: "class",
    title: w("Answer a question", "Answer a question in class"),
    scene: w(
      "Your teacher asks the class a question. You think you know the answer.",
      "The teacher asks the room a question. You have an answer, even if you are not fully sure.",
    ),
    ideas: [
      w("I think it is ...", "I think the answer is ..."),
      w("Is it ...?", "Could it be ..., because ...?"),
      w("I am not sure, but maybe ...", "I am not certain, but my guess is ..."),
    ],
    mission: w(
      "Put your hand up and answer one question in class.",
      "Answer one question out loud in a real class or meeting.",
    ),
  },
  {
    id: "class-ask",
    room: "class",
    title: w("Ask a question", "Ask the teacher a question"),
    scene: w(
      "You did not understand part of the lesson. You want to ask.",
      "Something in the lesson did not make sense. Asking helps you and others who were too shy to ask.",
    ),
    ideas: [
      w("Can you say that part again, please?", "Could you go over that part again, please?"),
      w("What does ... mean?", "Can I check what ... means?"),
    ],
    mission: w("Ask your teacher one question.", "Ask one real question in class or at work."),
  },
  {
    id: "class-read",
    room: "class",
    title: w("Read out loud", "Read aloud to the class"),
    scene: w(
      "It is your turn to read a few lines out loud.",
      "You are asked to read a short passage aloud. You can go at your own pace.",
    ),
    ideas: [
      w("The fox ran across the field and hid behind a tree.", "The fox crossed the field and waited behind the old oak tree."),
      w("Take a breath, then read one line at a time.", "Pause at full stops. It sounds calm, not slow."),
    ],
    mission: w("Read a few lines out loud in class or at home to someone.", "Read a short passage aloud to at least one person."),
  },
  {
    id: "class-group",
    room: "class",
    title: w("Share in a group", "Share an idea in group work"),
    scene: w(
      "You are in a small group. Everyone is sharing ideas.",
      "Your group is planning a task. Others are talking and you have an idea too.",
    ),
    ideas: [
      w("I have an idea. What if we ...?", "Can I add something? What if we ..."),
      w("I agree with ..., and also ...", "Building on that, we could ..."),
    ],
    mission: w("Share one idea in a group.", "Share one idea in a real group discussion."),
  },
  {
    id: "friends-join",
    room: "friends",
    title: w("Join in a chat", "Join a conversation"),
    scene: w(
      "Some friends are talking about a game you like.",
      "A few people are chatting about something you know about. You want to join in.",
    ),
    ideas: [
      w("I play that too.", "Oh, I have seen that too."),
      w("What level are you on?", "What did you think of it?"),
    ],
    mission: w("Join a chat with friends by saying one thing.", "Join a real conversation with one comment or question."),
  },
  {
    id: "friends-opinion",
    room: "friends",
    title: w("Say what you think", "Give your opinion"),
    scene: w(
      "Your friends ask which film you liked best.",
      "Friends ask what you think about a plan. Your opinion counts as much as theirs.",
    ),
    ideas: [
      w("I liked ... best because ...", "Honestly, I think ... because ..."),
      w("I am not sure yet, but I like ...", "I lean towards ..., mostly because ..."),
    ],
    mission: w("Tell a friend what you think about something.", "Share one honest opinion with a friend."),
  },
  {
    id: "friends-disagree",
    room: "friends",
    title: w("Disagree kindly", "Disagree kindly"),
    scene: w(
      "Your friend says something you do not agree with.",
      "A friend says something you see differently. You can disagree and still be kind.",
    ),
    ideas: [
      w("I see it a bit differently.", "I see it a bit differently, actually."),
      w("That is fair, but I think ...", "I get that, and I also think ..."),
    ],
    mission: w("Kindly say you see something differently.", "Kindly share a different view in a real chat."),
  },
  {
    id: "friends-story",
    room: "friends",
    title: w("Tell a short story", "Tell a short story"),
    scene: w(
      "Your friends ask what you did at the weekend.",
      "Someone asks what you have been up to. A short story is enough.",
    ),
    ideas: [
      w("On Saturday I went to ... and ...", "This weekend I went to ..., and the funny part was ..."),
      w("Something funny happened. So ...", "So, something odd happened on the way to ..."),
    ],
    mission: w("Tell a friend a short story about your day.", "Tell someone a short story from your week."),
  },
  {
    id: "present-intro",
    room: "presenting",
    title: w("Say who you are", "Introduce yourself"),
    scene: w(
      "You are new in a group and need to say your name and one thing about you.",
      "You are asked to introduce yourself to a group. Name plus one or two things is enough.",
    ),
    ideas: [
      w("Hi, I am ... and I like ...", "Hi, I am ... I am into ..., and I am here because ..."),
      w("My name is ... One fun thing about me is ...", "I am ... Something people do not know about me is ..."),
    ],
    mission: w("Say your name and one thing about you to a group.", "Introduce yourself to a real group."),
  },
  {
    id: "present-minute",
    room: "presenting",
    title: w("Talk for one minute", "Give a one-minute talk"),
    scene: w(
      "You talk for about one minute about something you love.",
      "You give a short talk, about one minute, on a topic you know well.",
    ),
    ideas: [
      w("Today I will tell you about ...", "I want to tell you about ... for three reasons."),
      w("The best thing about it is ...", "First ..., then ..., and finally ..."),
    ],
    mission: w("Talk for one minute to someone about a thing you love.", "Give a short talk to at least one person."),
  },
];

export function situationById(id: string): Situation | undefined {
  return SITUATIONS.find((s) => s.id === id);
}
```

- [ ] **Step 4: Write `src/lib/content/phrases.ts`**

```ts
import type { Words } from "@/lib/types";

const w = (kid: string, grown: string = kid): Words => ({ kid, grown });

/** Lines to fall back on when your mind goes blank. */
export const RESCUE_PHRASES: { id: string; text: Words; when: Words }[] = [
  { id: "come-back", text: w("Can I come back to that?", "Can I come back to that one?"), when: w("When your mind goes blank.", "When your mind goes blank.") },
  { id: "think-second", text: w("Let me think for a second."), when: w("When you need a moment.", "When you need a moment to think.") },
  { id: "not-sure", text: w("I am not sure, but maybe ...", "I am not sure, but my guess is ..."), when: w("When you only half know.", "When you only half know the answer.") },
  { id: "say-again", text: w("Can you say that again, please?", "Sorry, could you repeat the question?"), when: w("When you did not hear or understand.", "When you did not catch the question.") },
  { id: "start-again", text: w("Let me start that again."), when: w("When your words get mixed up.", "When a sentence gets tangled.") },
  { id: "lost-thread", text: w("I lost my place. Where was I?", "Sorry, I lost my thread. Where was I?"), when: w("When you forget what you were saying.", "When you forget where you were going.") },
  { id: "good-question", text: w("That is a good question.", "That is a good question. Let me think."), when: w("To buy a little time.", "To buy yourself a little time.") },
  { id: "pass", text: w("Can I pass on this one?", "I will pass on this one for now, thanks."), when: w("When today is too much.", "When today is not the day, and that is okay.") },
];

/** Fill-in sentence frames. Used by everyone, and instead of AI tidy for under 13. */
export const FRAMES: { id: string; text: Words }[] = [
  { id: "think-because", text: w("I think ___ because ___.") },
  { id: "like-because", text: w("I like ___ because ___.") },
  { id: "agree-also", text: w("I agree with ___, and also ___.") },
  { id: "differently", text: w("I see it a bit differently. I think ___.") },
  { id: "first-then", text: w("First ___, then ___, and at the end ___.") },
  { id: "question", text: w("Can I ask about ___?", "Could I ask a question about ___?") },
];
```

- [ ] **Step 5: Run it and see it pass**

Run: `npx vitest run src/lib/content/content.test.ts`
Expected: 5 passed.

- [ ] **Step 6: Commit**

```bash
git add src/lib/content
git commit -m "Add pre-written situations, rescue phrases and sentence frames

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Date helpers and the ladder

**Files:**
- Create: `src/lib/dates.ts`, `src/lib/ladder.ts`, `src/lib/ladder.test.ts`

**Interfaces:**
- Consumes: `Level`, `RoomId`, `HardThing`, `StepRecord`, `CustomStep` from `@/lib/types`; `Situation` from `@/lib/content/situations`
- Produces:
  - `dayKey(d: Date): string` (local `YYYY-MM-DD`), `weekStartKey(d: Date): string` (local Monday), `daysBetween(a: Date, b: Date): number`
  - `LEVELS: { level: Level; name: string; speaking: boolean }[]`
  - `highestLevel(records: StepRecord[], situationId: string): Level | 0`
  - `nextLevel(records: StepRecord[], situationId: string): Level`
  - `suggestNext(records: StepRecord[], situations: Situation[], hard: HardThing[]): { situationId: string; level: Level } | null`
  - `mapLight(records: StepRecord[], situations: Situation[]): number` (0 to 1)
  - `makeCustomStep(room: RoomId, text: string, now: Date): CustomStep`

- [ ] **Step 1: Write `src/lib/dates.ts`**

```ts
const pad = (n: number) => String(n).padStart(2, "0");

/** Local calendar day, YYYY-MM-DD. */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Local Monday of the week containing d, as a day key. */
export function weekStartKey(d: Date): string {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const offset = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - offset);
  return dayKey(copy);
}

/** Whole local days from a to b (b later gives a positive number). */
export function daysBetween(a: Date, b: Date): number {
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((end - start) / 86_400_000);
}
```

- [ ] **Step 2: Write the failing test `src/lib/ladder.test.ts`**

```ts
import { describe, expect, test } from "vitest";
import { dayKey, daysBetween, weekStartKey } from "./dates";
import { highestLevel, makeCustomStep, mapLight, nextLevel, suggestNext } from "./ladder";
import { SITUATIONS } from "./content/situations";
import type { Level, StepRecord } from "./types";

const rec = (situationId: string, level: Level, at = "2026-09-28T10:00:00"): StepRecord => ({
  situationId,
  level,
  at,
  seconds: 5,
  typed: false,
  roughDay: false,
});

describe("dates", () => {
  test("day and week keys are local", () => {
    const wed = new Date(2026, 8, 30, 23, 30);
    expect(dayKey(wed)).toBe("2026-09-30");
    expect(weekStartKey(wed)).toBe("2026-09-28");
    expect(weekStartKey(new Date(2026, 9, 4))).toBe("2026-09-28");
    expect(daysBetween(new Date(2026, 8, 1), new Date(2026, 8, 8, 1))).toBe(7);
  });
});

describe("ladder", () => {
  test("highest level is 0 when untried and the best level otherwise", () => {
    expect(highestLevel([], "class-answer")).toBe(0);
    const r = [rec("class-answer", 2), rec("class-answer", 4), rec("class-answer", 3)];
    expect(highestLevel(r, "class-answer")).toBe(4);
  });

  test("next level goes up by one and stops at 6", () => {
    expect(nextLevel([], "class-answer")).toBe(1);
    expect(nextLevel([rec("class-answer", 3)], "class-answer")).toBe(4);
    expect(nextLevel([rec("class-answer", 6)], "class-answer")).toBe(6);
  });

  test("suggestion prefers rooms from what feels hard", () => {
    expect(suggestNext([], SITUATIONS, ["friends"])).toEqual({ situationId: "friends-join", level: 1 });
  });

  test("suggestion falls back to class when nothing picked", () => {
    expect(suggestNext([], SITUATIONS, [])).toEqual({ situationId: "class-answer", level: 1 });
  });

  test("suggestion continues the least advanced situation in the preferred room", () => {
    const r = [rec("friends-join", 3), rec("friends-opinion", 1)];
    expect(suggestNext(r, SITUATIONS, ["friends"])).toEqual({ situationId: "friends-disagree", level: 1 });
  });

  test("suggestion is null when everything is finished", () => {
    const all = SITUATIONS.map((s) => rec(s.id, 6));
    expect(suggestNext(all, SITUATIONS, [])).toBeNull();
  });

  test("map light is the share of situations reaching step 3", () => {
    expect(mapLight([], SITUATIONS)).toBe(0);
    expect(mapLight([rec("class-answer", 3), rec("class-ask", 2)], SITUATIONS)).toBeCloseTo(1 / SITUATIONS.length);
    expect(mapLight(SITUATIONS.map((s) => rec(s.id, 3)), SITUATIONS)).toBe(1);
  });

  test("custom steps trim text and get an id", () => {
    const step = makeCustomStep("class", "  Ask the librarian for a book  ", new Date("2026-09-28T10:00:00Z"));
    expect(step.text).toBe("Ask the librarian for a book");
    expect(step.room).toBe("class");
    expect(step.id).toMatch(/^custom-/);
  });

  test("custom step text cannot be empty or huge", () => {
    expect(() => makeCustomStep("class", "   ", new Date())).toThrow();
    expect(makeCustomStep("class", "x".repeat(500), new Date()).text).toHaveLength(140);
  });
});
```

- [ ] **Step 3: Run it and see it fail**

Run: `npx vitest run src/lib/ladder.test.ts`
Expected: FAIL, cannot find module `./ladder`.

- [ ] **Step 4: Write `src/lib/ladder.ts`**

```ts
import type { Situation } from "./content/situations";
import type { CustomStep, HardThing, Level, RoomId, StepRecord } from "./types";

export const LEVELS: { level: Level; name: string; speaking: boolean }[] = [
  { level: 1, name: "Think it", speaking: false },
  { level: 2, name: "Type or whisper it", speaking: false },
  { level: 3, name: "Say it out loud, alone", speaking: true },
  { level: 4, name: "Say it to the coach", speaking: true },
  { level: 5, name: "Say it with a little pressure", speaking: true },
  { level: 6, name: "Try it for real", speaking: false },
];

const ROOM_ORDER: RoomId[] = ["class", "friends", "presenting"];

/** Which rooms each "what feels hard" choice points to first. */
const HARD_TO_ROOM: Partial<Record<HardThing, RoomId>> = {
  class: "class",
  friends: "friends",
  presenting: "presenting",
};

export function highestLevel(records: StepRecord[], situationId: string): Level | 0 {
  let best = 0;
  for (const r of records) if (r.situationId === situationId && r.level > best) best = r.level;
  return best as Level | 0;
}

export function nextLevel(records: StepRecord[], situationId: string): Level {
  return Math.min(highestLevel(records, situationId) + 1, 6) as Level;
}

/** One step to suggest on Home: least advanced unfinished situation, preferred rooms first. */
export function suggestNext(
  records: StepRecord[],
  situations: Situation[],
  hard: HardThing[],
): { situationId: string; level: Level } | null {
  const preferred = hard.map((h) => HARD_TO_ROOM[h]).filter((r): r is RoomId => Boolean(r));
  const order = [...new Set([...preferred, ...ROOM_ORDER])];
  for (const room of order) {
    const open = situations
      .filter((s) => s.room === room)
      .map((s) => ({ s, h: highestLevel(records, s.id) }))
      .filter(({ h }) => h < 6);
    if (open.length === 0) continue;
    const least = open.reduce((a, b) => (b.h < a.h ? b : a));
    return { situationId: least.s.id, level: nextLevel(records, least.s.id) };
  }
  return null;
}

/** How lit the courage map is: share of situations that reached step 3 (said out loud). */
export function mapLight(records: StepRecord[], situations: Situation[]): number {
  if (situations.length === 0) return 0;
  const lit = situations.filter((s) => highestLevel(records, s.id) >= 3).length;
  return lit / situations.length;
}

const MAX_CUSTOM = 140;

export function makeCustomStep(room: RoomId, text: string, now: Date): CustomStep {
  const clean = text.trim().slice(0, MAX_CUSTOM);
  if (!clean) throw new Error("A custom step needs some words.");
  const id = `custom-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  return { id, room, text: clean, createdAt: now.toISOString() };
}
```

- [ ] **Step 5: Run it and see it pass**

Run: `npx vitest run src/lib/ladder.test.ts`
Expected: 10 passed.

- [ ] **Step 6: Commit**

```bash
git add src/lib/dates.ts src/lib/ladder.ts src/lib/ladder.test.ts
git commit -m "Add courage ladder rules and date helpers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Courage points and brave days

**Files:**
- Create: `src/lib/courage.ts`, `src/lib/courage.test.ts`

**Interfaces:**
- Consumes: `StepRecord` from `@/lib/types`; `dayKey`, `weekStartKey` from `@/lib/dates`
- Produces: `POINTS: { base: 10; harder: 5; rough: 5; mission: 20 }`; `pointsFor(record: StepRecord, previousHighest: number): number`; `totalPoints(records: StepRecord[]): number`; `braveDaysThisWeek(records: StepRecord[], now: Date): number`; `missionsDone(records: StepRecord[]): number`

- [ ] **Step 1: Write the failing test `src/lib/courage.test.ts`**

```ts
import { describe, expect, test } from "vitest";
import { braveDaysThisWeek, missionsDone, pointsFor, totalPoints } from "./courage";
import type { Level, StepRecord } from "./types";

const rec = (level: Level, at: string, extra: Partial<StepRecord> = {}): StepRecord => ({
  situationId: "class-answer",
  level,
  at,
  seconds: 5,
  typed: false,
  roughDay: false,
  ...extra,
});

describe("courage points", () => {
  test("length of speaking never changes points", () => {
    const short = rec(3, "2026-09-28T10:00:00", { seconds: 5 });
    const long = rec(3, "2026-09-28T10:00:00", { seconds: 60 });
    expect(pointsFor(short, 3)).toBe(pointsFor(long, 3));
  });

  test("base, harder than before, rough day and mission bonuses", () => {
    expect(pointsFor(rec(2, "2026-09-28T10:00:00"), 2)).toBe(10);
    expect(pointsFor(rec(3, "2026-09-28T10:00:00"), 2)).toBe(15);
    expect(pointsFor(rec(2, "2026-09-28T10:00:00", { roughDay: true }), 2)).toBe(15);
    expect(pointsFor(rec(6, "2026-09-28T10:00:00"), 5)).toBe(35);
  });

  test("total walks records in order per situation", () => {
    const records = [rec(1, "2026-09-28T10:00:00"), rec(2, "2026-09-28T11:00:00"), rec(2, "2026-09-28T12:00:00")];
    expect(totalPoints(records)).toBe(15 + 15 + 10);
  });

  test("missions are level 6 records", () => {
    expect(missionsDone([rec(6, "2026-09-28T10:00:00"), rec(5, "2026-09-28T10:00:00")])).toBe(1);
  });
});

describe("brave days", () => {
  test("counts distinct days this week only", () => {
    const now = new Date(2026, 8, 30, 12);
    const records = [
      rec(1, new Date(2026, 8, 28, 9).toISOString()),
      rec(2, new Date(2026, 8, 28, 18).toISOString()),
      rec(3, new Date(2026, 8, 30, 8).toISOString()),
      rec(3, new Date(2026, 8, 25, 8).toISOString()),
    ];
    expect(braveDaysThisWeek(records, now)).toBe(2);
  });

  test("a new week starts at zero without anything being lost", () => {
    const records = [rec(1, new Date(2026, 8, 28, 9).toISOString())];
    expect(braveDaysThisWeek(records, new Date(2026, 9, 5, 9))).toBe(0);
    expect(totalPoints(records)).toBe(15);
  });
});
```

- [ ] **Step 2: Run it and see it fail**

Run: `npx vitest run src/lib/courage.test.ts`
Expected: FAIL, cannot find module `./courage`.

- [ ] **Step 3: Write `src/lib/courage.ts`**

```ts
import { dayKey, weekStartKey } from "./dates";
import type { StepRecord } from "./types";

/** Points reward trying, never quality or length. */
export const POINTS = { base: 10, harder: 5, rough: 5, mission: 20 } as const;

export function pointsFor(record: StepRecord, previousHighest: number): number {
  let points = POINTS.base;
  if (record.level > previousHighest) points += POINTS.harder;
  if (record.roughDay) points += POINTS.rough;
  if (record.level === 6) points += POINTS.mission;
  return points;
}

export function totalPoints(records: StepRecord[]): number {
  const sorted = [...records].sort((a, b) => a.at.localeCompare(b.at));
  const highest = new Map<string, number>();
  let total = 0;
  for (const r of sorted) {
    const before = highest.get(r.situationId) ?? 0;
    total += pointsFor(r, before);
    if (r.level > before) highest.set(r.situationId, r.level);
  }
  return total;
}

export function missionsDone(records: StepRecord[]): number {
  return records.filter((r) => r.level === 6).length;
}

/** Days this week (Monday start, local time) with at least one step. Never shown as a broken streak. */
export function braveDaysThisWeek(records: StepRecord[], now: Date): number {
  const week = weekStartKey(now);
  const days = new Set<string>();
  for (const r of records) {
    const d = new Date(r.at);
    if (weekStartKey(d) === week) days.add(dayKey(d));
  }
  return days.size;
}
```

- [ ] **Step 4: Run it and see it pass**

Run: `npx vitest run src/lib/courage.test.ts`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/courage.ts src/lib/courage.test.ts
git commit -m "Add courage points and weekly brave days

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Achievements

**Files:**
- Create: `src/lib/achievements.ts`, `src/lib/achievements.test.ts`

**Interfaces:**
- Consumes: `StepRecord`, `CustomStep`, `AppEvent` from `@/lib/types`; `SITUATIONS`, `situationById` from `@/lib/content/situations`; `mapLight` from `@/lib/ladder`
- Produces: `type BadgeInput = { records: StepRecord[]; customSteps: CustomStep[]; events: AppEvent[]; cameBack: boolean }`; `BADGES: { id: string; title: string; description: string }[]`; `earnedBadges(input: BadgeInput): string[]`; `newBadges(already: string[], input: BadgeInput): string[]`

- [ ] **Step 1: Write the failing test `src/lib/achievements.test.ts`**

```ts
import { describe, expect, test } from "vitest";
import { BADGES, earnedBadges, newBadges, type BadgeInput } from "./achievements";
import { SITUATIONS } from "./content/situations";
import type { AppEvent, Level, StepRecord } from "./types";

const at = "2026-09-28T10:00:00";
const rec = (situationId: string, level: Level, extra: Partial<StepRecord> = {}): StepRecord => ({
  situationId,
  level,
  at,
  seconds: 5,
  typed: false,
  roughDay: false,
  ...extra,
});
const ev = (kind: AppEvent["kind"], n: number): AppEvent[] => Array.from({ length: n }, () => ({ kind, at }));
const empty: BadgeInput = { records: [], customSteps: [], events: [], cameBack: false };

describe("achievements", () => {
  test("twelve badges with unique ids and no dashes in copy", () => {
    expect(BADGES).toHaveLength(12);
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(12);
    for (const b of BADGES) expect(`${b.title}${b.description}`).not.toMatch(/[–—]/);
  });

  test("nothing earned at the start", () => {
    expect(earnedBadges(empty)).toEqual([]);
  });

  test("speaking and typing badges", () => {
    expect(earnedBadges({ ...empty, records: [rec("class-answer", 3)] })).toContain("first-words");
    expect(earnedBadges({ ...empty, records: [rec("class-answer", 2, { typed: true })] })).toContain("typed-first");
    expect(earnedBadges({ ...empty, records: [rec("class-answer", 3, { roughDay: true })] })).toContain("said-anyway");
  });

  test("class step 5, missions and rooms", () => {
    expect(earnedBadges({ ...empty, records: [rec("class-read", 5)] })).toContain("hand-up");
    expect(earnedBadges({ ...empty, records: [rec("friends-join", 5)] })).not.toContain("hand-up");
    expect(earnedBadges({ ...empty, records: [rec("friends-join", 6)] })).toContain("out-in-the-wild");
    const rooms = [rec("class-answer", 1), rec("friends-join", 1), rec("present-intro", 1)];
    expect(earnedBadges({ ...empty, records: rooms })).toContain("room-explorer");
  });

  test("event-based badges", () => {
    expect(earnedBadges({ ...empty, events: ev("kit", 9) })).not.toContain("calm-captain");
    expect(earnedBadges({ ...empty, events: ev("kit", 10) })).toContain("calm-captain");
    expect(earnedBadges({ ...empty, events: ev("rescue", 5) })).toContain("rescue-ready");
    expect(earnedBadges({ ...empty, events: ev("thenNow", 1) })).toContain("then-and-now");
  });

  test("custom step, came back and dawn", () => {
    const custom = [{ id: "custom-1", room: "class" as const, text: "Ask the librarian", createdAt: at }];
    expect(earnedBadges({ ...empty, customSteps: custom })).toContain("my-own-step");
    expect(earnedBadges({ ...empty, cameBack: true })).toContain("back-again");
    const all = SITUATIONS.map((s) => rec(s.id, 3));
    expect(earnedBadges({ ...empty, records: all })).toContain("dawn");
  });

  test("new badges are only the ones not already held", () => {
    const input = { ...empty, records: [rec("class-answer", 3)] };
    expect(newBadges([], input)).toEqual(["first-words"]);
    expect(newBadges(["first-words"], input)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it and see it fail**

Run: `npx vitest run src/lib/achievements.test.ts`
Expected: FAIL, cannot find module `./achievements`.

- [ ] **Step 3: Write `src/lib/achievements.ts`**

```ts
import { SITUATIONS, situationById } from "./content/situations";
import { mapLight } from "./ladder";
import type { AppEvent, CustomStep, EventKind, StepRecord } from "./types";

export type BadgeInput = { records: StepRecord[]; customSteps: CustomStep[]; events: AppEvent[]; cameBack: boolean };

type Badge = { id: string; title: string; description: string; earned: (i: BadgeInput) => boolean };

const count = (events: AppEvent[], kind: EventKind) => events.filter((e) => e.kind === kind).length;
const roomOf = (id: string) => situationById(id)?.room;

const RULES: Badge[] = [
  { id: "first-words", title: "First words", description: "You spoke out loud for the first time.", earned: (i) => i.records.some((r) => r.level >= 3 && !r.typed) },
  { id: "typed-first", title: "Typed it first", description: "You typed before speaking. That counts.", earned: (i) => i.records.some((r) => r.typed) },
  { id: "hand-up", title: "Hand up", description: "You reached step 5 in class.", earned: (i) => i.records.some((r) => r.level >= 5 && roomOf(r.situationId) === "class") },
  { id: "said-anyway", title: "Said it anyway", description: "You spoke on a rough day.", earned: (i) => i.records.some((r) => r.roughDay && r.level >= 3 && !r.typed) },
  { id: "back-again", title: "Back again", description: "You came back after a break. Welcome back.", earned: (i) => i.cameBack },
  { id: "out-in-the-wild", title: "Out in the wild", description: "You tried it for real.", earned: (i) => i.records.some((r) => r.level === 6) },
  { id: "calm-captain", title: "Calm captain", description: "You used the body kit 10 times.", earned: (i) => count(i.events, "kit") >= 10 },
  { id: "rescue-ready", title: "Rescue ready", description: "You practised 5 rescue phrases.", earned: (i) => count(i.events, "rescue") >= 5 },
  {
    id: "room-explorer",
    title: "Room explorer",
    description: "You tried a step in every room.",
    earned: (i) => new Set(i.records.map((r) => roomOf(r.situationId)).filter(Boolean)).size >= 3,
  },
  { id: "my-own-step", title: "My own step", description: "You added a step of your own.", earned: (i) => i.customSteps.length > 0 },
  { id: "then-and-now", title: "Then and now", description: "You listened to how far you have come.", earned: (i) => count(i.events, "thenNow") > 0 },
  { id: "dawn", title: "Dawn", description: "Your whole map is lit.", earned: (i) => mapLight(i.records, SITUATIONS) >= 1 },
];

export const BADGES = RULES.map(({ id, title, description }) => ({ id, title, description }));

export function earnedBadges(input: BadgeInput): string[] {
  return RULES.filter((b) => b.earned(input)).map((b) => b.id);
}

/** Badges earned now that were not held before. Badges are never removed. */
export function newBadges(already: string[], input: BadgeInput): string[] {
  const held = new Set(already);
  return earnedBadges(input).filter((id) => !held.has(id));
}
```

- [ ] **Step 4: Run it and see it pass**

Run: `npx vitest run src/lib/achievements.test.ts`
Expected: 7 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/achievements.ts src/lib/achievements.test.ts
git commit -m "Add achievements (twelve badges, never removed)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Daily quests and the companion

**Files:**
- Create: `src/lib/quests.ts`, `src/lib/companion.ts`, `src/lib/quests-companion.test.ts`

**Interfaces:**
- Consumes: `StepRecord`, `AppEvent`, `Species` from `@/lib/types`; `dayKey` from `@/lib/dates`
- Produces:
  - `type Quest = { id: string; text: string; kind: "speak" | "type" | "rescue" | "kit"; target: number }`; `QUEST_POOL: Quest[]`; `dailyQuests(day: string, count?: number): Quest[]`; `questProgress(q: Quest, records: StepRecord[], events: AppEvent[], day: string): number`
  - `SPECIES: { id: Species; name: string }[]`; `type Stage = "hiding" | "peeking" | "waving" | "speaking"`; `STAGE_POINTS: { peeking: 30; waving: 120; speaking: 300 }`; `stageFor(points: number, missions: number): Stage`

- [ ] **Step 1: Write the failing test `src/lib/quests-companion.test.ts`**

```ts
import { describe, expect, test } from "vitest";
import { QUEST_POOL, dailyQuests, questProgress } from "./quests";
import { SPECIES, stageFor } from "./companion";
import type { AppEvent, StepRecord } from "./types";

const day = "2026-09-28";
const rec = (extra: Partial<StepRecord>): StepRecord => ({
  situationId: "class-answer",
  level: 3,
  at: new Date(2026, 8, 28, 10).toISOString(),
  seconds: 5,
  typed: false,
  roughDay: false,
  ...extra,
});

describe("quests", () => {
  test("same day gives the same quests, all different", () => {
    const a = dailyQuests(day);
    expect(a).toHaveLength(3);
    expect(dailyQuests(day)).toEqual(a);
    expect(new Set(a.map((q) => q.id)).size).toBe(3);
  });

  test("pool is large enough and dash free", () => {
    expect(QUEST_POOL.length).toBeGreaterThanOrEqual(6);
    for (const q of QUEST_POOL) expect(q.text).not.toMatch(/[–—]/);
  });

  test("progress counts only today and the right kind", () => {
    const speak = QUEST_POOL.find((q) => q.kind === "speak")!;
    const type = QUEST_POOL.find((q) => q.kind === "type")!;
    const rescue = QUEST_POOL.find((q) => q.kind === "rescue")!;
    const records = [
      rec({}),
      rec({ typed: true, level: 2 }),
      rec({ at: new Date(2026, 8, 27, 10).toISOString() }),
    ];
    const events: AppEvent[] = [{ kind: "rescue", at: new Date(2026, 8, 28, 11).toISOString() }];
    expect(questProgress(speak, records, events, day)).toBe(1);
    expect(questProgress(type, records, events, day)).toBe(1);
    expect(questProgress(rescue, records, events, day)).toBe(1);
  });
});

describe("companion", () => {
  test("three species", () => {
    expect(SPECIES.map((s) => s.id)).toEqual(["firefly", "hedgehog", "fox"]);
  });

  test("grows with points, speaking up needs a real-life mission", () => {
    expect(stageFor(0, 0)).toBe("hiding");
    expect(stageFor(30, 0)).toBe("peeking");
    expect(stageFor(120, 0)).toBe("waving");
    expect(stageFor(500, 0)).toBe("waving");
    expect(stageFor(300, 1)).toBe("speaking");
  });
});
```

- [ ] **Step 2: Run it and see it fail**

Run: `npx vitest run src/lib/quests-companion.test.ts`
Expected: FAIL, cannot find module `./quests`.

- [ ] **Step 3: Write `src/lib/quests.ts`**

```ts
import { dayKey } from "./dates";
import type { AppEvent, StepRecord } from "./types";

export type Quest = { id: string; text: string; kind: "speak" | "type" | "rescue" | "kit"; target: number };

/** Small, optional daily ideas. Missing them changes nothing. */
export const QUEST_POOL: Quest[] = [
  { id: "speak-1", text: "Say one thing out loud", kind: "speak", target: 1 },
  { id: "speak-2", text: "Do two speaking steps", kind: "speak", target: 2 },
  { id: "type-1", text: "Type an answer before you say it", kind: "type", target: 1 },
  { id: "rescue-3", text: "Practise 3 rescue phrases", kind: "rescue", target: 3 },
  { id: "rescue-1", text: "Learn one new rescue phrase", kind: "rescue", target: 1 },
  { id: "kit-1", text: "Try one calm-down tool", kind: "kit", target: 1 },
  { id: "kit-2", text: "Breathe along twice today", kind: "kit", target: 2 },
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Same quests all day, different mix each day, no two of the same id. */
export function dailyQuests(day: string, count = 3): Quest[] {
  return [...QUEST_POOL]
    .map((q) => ({ q, k: hash(`${day}:${q.id}`) }))
    .sort((a, b) => a.k - b.k)
    .slice(0, count)
    .map(({ q }) => q);
}

export function questProgress(q: Quest, records: StepRecord[], events: AppEvent[], day: string): number {
  const today = (iso: string) => dayKey(new Date(iso)) === day;
  let done = 0;
  if (q.kind === "speak") done = records.filter((r) => today(r.at) && r.level >= 3 && !r.typed).length;
  if (q.kind === "type") done = records.filter((r) => today(r.at) && r.typed).length;
  if (q.kind === "rescue" || q.kind === "kit") done = events.filter((e) => today(e.at) && e.kind === q.kind).length;
  return Math.min(done, q.target);
}
```

- [ ] **Step 4: Write `src/lib/companion.ts`**

```ts
import type { Species } from "./types";

export const SPECIES: { id: Species; name: string }[] = [
  { id: "firefly", name: "Firefly" },
  { id: "hedgehog", name: "Hedgehog" },
  { id: "fox", name: "Paper fox" },
];

export type Stage = "hiding" | "peeking" | "waving" | "speaking";

export const STAGE_POINTS = { peeking: 30, waving: 120, speaking: 300 } as const;

/** The companion grows with courage points. Speaking up also needs one real-life mission. It never shrinks. */
export function stageFor(points: number, missions: number): Stage {
  if (points >= STAGE_POINTS.speaking && missions >= 1) return "speaking";
  if (points >= STAGE_POINTS.waving) return "waving";
  if (points >= STAGE_POINTS.peeking) return "peeking";
  return "hiding";
}
```

- [ ] **Step 5: Run it and see it pass**

Run: `npx vitest run src/lib/quests-companion.test.ts`
Expected: 5 passed.

- [ ] **Step 6: Commit**

```bash
git add src/lib/quests.ts src/lib/companion.ts src/lib/quests-companion.test.ts
git commit -m "Add daily quests and companion growth stages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Crisis check and support lines

**Files:**
- Create: `src/lib/safety/crisis.ts`, `src/lib/safety/crisis.test.ts`

**Interfaces:**
- Produces: `checkCrisis(text: string): { crisis: boolean }`; `type SupportLine = { name: string; contact: string; note: string }`; `supportLines(country: string | null): { lines: SupportLine[]; emergency: string }`

- [ ] **Step 1: Write the failing test `src/lib/safety/crisis.test.ts`**

```ts
import { describe, expect, test } from "vitest";
import { checkCrisis, supportLines } from "./crisis";

describe("crisis check", () => {
  test.each([
    "I want to kill myself",
    "i want to die",
    "sometimes I think about ending it all",
    "I keep hurting myself",
    "I cut myself last night",
    "I dont want to be alive",
    "nobody would care if I was gone",
    "someone at home hits me",
    "I am thinking about suicide",
  ])("flags: %s", (text) => {
    expect(checkCrisis(text).crisis).toBe(true);
  });

  test.each([
    "I get so nervous I could die of embarrassment",
    "I killed it in my presentation",
    "my hands shake when I talk",
    "I blush when the teacher looks at me",
    "",
  ])("does not flag everyday nerves: %s", (text) => {
    expect(checkCrisis(text).crisis).toBe(false);
  });
});

describe("support lines", () => {
  test("UK", () => {
    const uk = supportLines("GB");
    expect(uk.emergency).toBe("999");
    expect(uk.lines.map((l) => l.name)).toEqual(["Childline", "Samaritans", "Shout"]);
  });

  test("US uses 988", () => {
    expect(supportLines("US").lines[0].contact).toContain("988");
    expect(supportLines("US").emergency).toBe("911");
  });

  test("unknown country still gets help", () => {
    const x = supportLines(null);
    expect(x.lines[0].contact).toContain("findahelpline.com");
    expect(x.emergency.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run it and see it fail**

Run: `npx vitest run src/lib/safety/crisis.test.ts`
Expected: FAIL, cannot find module `./crisis`.

- [ ] **Step 3: Write `src/lib/safety/crisis.ts`**

```ts
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
  const t = text.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ");
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
```

- [ ] **Step 4: Run it and see it pass**

Run: `npx vitest run src/lib/safety/crisis.test.ts`
Expected: 17 passed. If an everyday-nerves case is flagged, tighten that pattern; never loosen a crisis case to make a test pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/safety
git commit -m "Add on-device crisis check and regional support lines

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: State, actions, backup and the store

**Files:**
- Create: `src/lib/state.ts`, `src/lib/backup.ts`, `src/lib/state.test.ts`, `src/lib/store.ts`

**Interfaces:**
- Consumes: types from `@/lib/types`; `newBadges` from `@/lib/achievements`; `makeCustomStep` from `@/lib/ladder`; `daysBetween` from `@/lib/dates`
- Produces:
  - `type Settings = { reduceMotion: boolean; largeText: boolean; sounds: boolean; confetti: boolean; timers: boolean; keepRecordings: boolean }`
  - `type CourageState = { version: 1; age: AgeBand | null; hardThings: HardThing[]; companion: { species: Species; name: string } | null; records: StepRecord[]; customSteps: CustomStep[]; events: AppEvent[]; earned: string[]; lastSeen: string | null; cameBack: boolean; settings: Settings }`
  - `DEFAULT_STATE: CourageState`; `normalize(raw: unknown): CourageState`
  - Actions (pure, return new state): `setAge(s, age: AgeBand | null)`, `setHardThings(s, hard: HardThing[])`, `setCompanion(s, species: Species, name: string)`, `recordStep(s, r: StepRecord): { state: CourageState; newlyEarned: string[] }`, `addCustomStep(s, room: RoomId, text: string, now: Date): { state: CourageState; newlyEarned: string[] }`, `logEvent(s, kind: EventKind, now: Date): { state: CourageState; newlyEarned: string[] }`, `visit(s, now: Date): { state: CourageState; newlyEarned: string[] }`, `updateSettings(s, patch: Partial<Settings>)`
  - `exportBackup(s: CourageState): string`; `importBackup(text: string): CourageState` (throws `Error("not-a-backup")`)
  - Store: `useCourage(): CourageState & { hydrated: boolean }`; `act(fn: (s: CourageState) => CourageState | { state: CourageState; newlyEarned: string[] }): string[]` (returns newly earned badge ids); `clearEverything(): void`

- [ ] **Step 1: Write the failing test `src/lib/state.test.ts`**

```ts
import { describe, expect, test } from "vitest";
import {
  DEFAULT_STATE,
  addCustomStep,
  logEvent,
  normalize,
  recordStep,
  setAge,
  setCompanion,
  updateSettings,
  visit,
} from "./state";
import { exportBackup, importBackup } from "./backup";
import type { StepRecord } from "./types";

const step: StepRecord = {
  situationId: "class-answer",
  level: 3,
  at: "2026-09-28T10:00:00.000Z",
  seconds: 6,
  typed: false,
  roughDay: false,
};

describe("state", () => {
  test("defaults are safe: no age, timers off, sounds and confetti on", () => {
    expect(DEFAULT_STATE.age).toBeNull();
    expect(DEFAULT_STATE.settings.timers).toBe(false);
    expect(DEFAULT_STATE.settings.keepRecordings).toBe(false);
  });

  test("normalize fills gaps and survives junk", () => {
    expect(normalize(null)).toEqual(DEFAULT_STATE);
    expect(normalize("nonsense")).toEqual(DEFAULT_STATE);
    const partial = normalize({ age: "teen", settings: { sounds: false } });
    expect(partial.age).toBe("teen");
    expect(partial.settings.sounds).toBe(false);
    expect(partial.settings.confetti).toBe(true);
    expect(normalize({ age: "wizard" }).age).toBeNull();
  });

  test("recording a step stores it and returns new badges once", () => {
    const first = recordStep(DEFAULT_STATE, step);
    expect(first.state.records).toHaveLength(1);
    expect(first.newlyEarned).toContain("first-words");
    expect(first.state.earned).toContain("first-words");
    const second = recordStep(first.state, { ...step, at: "2026-09-28T11:00:00.000Z" });
    expect(second.newlyEarned).not.toContain("first-words");
  });

  test("actions never mutate the input", () => {
    const before = JSON.stringify(DEFAULT_STATE);
    recordStep(DEFAULT_STATE, step);
    setAge(DEFAULT_STATE, "adult");
    setCompanion(DEFAULT_STATE, "fox", "Pip");
    updateSettings(DEFAULT_STATE, { sounds: false });
    expect(JSON.stringify(DEFAULT_STATE)).toBe(before);
  });

  test("companion name is trimmed and has a fallback", () => {
    expect(setCompanion(DEFAULT_STATE, "firefly", "  Glow  ").companion).toEqual({ species: "firefly", name: "Glow" });
    expect(setCompanion(DEFAULT_STATE, "hedgehog", "   ").companion?.name).toBe("Hedgehog");
  });

  test("custom steps and events can earn badges", () => {
    const custom = addCustomStep(DEFAULT_STATE, "class", "Ask the librarian", new Date());
    expect(custom.newlyEarned).toContain("my-own-step");
    let s = DEFAULT_STATE;
    let earned: string[] = [];
    for (let i = 0; i < 10; i++) {
      const r = logEvent(s, "kit", new Date());
      s = r.state;
      earned = earned.concat(r.newlyEarned);
    }
    expect(earned).toContain("calm-captain");
  });

  test("coming back after 7 days earns Back again, a short gap does not", () => {
    const seen = visit(DEFAULT_STATE, new Date(2026, 8, 1)).state;
    expect(visit(seen, new Date(2026, 8, 3)).state.cameBack).toBe(false);
    const back = visit(seen, new Date(2026, 8, 8, 9));
    expect(back.state.cameBack).toBe(true);
    expect(back.newlyEarned).toContain("back-again");
  });

  test("backup round trip and bad input", () => {
    const s = recordStep(setAge(DEFAULT_STATE, "teen"), step).state;
    expect(importBackup(exportBackup(s))).toEqual(s);
    expect(() => importBackup("{}")).toThrow("not-a-backup");
    expect(() => importBackup("not json")).toThrow("not-a-backup");
  });
});
```

- [ ] **Step 2: Run it and see it fail**

Run: `npx vitest run src/lib/state.test.ts`
Expected: FAIL, cannot find module `./state`.

- [ ] **Step 3: Write `src/lib/state.ts`**

```ts
import { newBadges } from "./achievements";
import { daysBetween } from "./dates";
import { makeCustomStep } from "./ladder";
import { SPECIES } from "./companion";
import type { AgeBand, AppEvent, CustomStep, EventKind, HardThing, RoomId, Species, StepRecord } from "./types";

export type Settings = {
  reduceMotion: boolean;
  largeText: boolean;
  sounds: boolean;
  confetti: boolean;
  /** Off by default: no clocks unless the user asks. */
  timers: boolean;
  /** Off by default: recordings are only kept when the user opts in (Then vs Now). */
  keepRecordings: boolean;
};

export type CourageState = {
  version: 1;
  age: AgeBand | null;
  hardThings: HardThing[];
  companion: { species: Species; name: string } | null;
  records: StepRecord[];
  customSteps: CustomStep[];
  events: AppEvent[];
  earned: string[];
  lastSeen: string | null;
  cameBack: boolean;
  settings: Settings;
};

type Result = { state: CourageState; newlyEarned: string[] };

export const DEFAULT_STATE: CourageState = {
  version: 1,
  age: null,
  hardThings: [],
  companion: null,
  records: [],
  customSteps: [],
  events: [],
  earned: [],
  lastSeen: null,
  cameBack: false,
  settings: { reduceMotion: false, largeText: false, sounds: true, confetti: true, timers: false, keepRecordings: false },
};

const AGES: AgeBand[] = ["under13", "teen", "adult"];
const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Fills in anything missing so older saves and restored backups keep working. */
export function normalize(raw: unknown): CourageState {
  if (!raw || typeof raw !== "object") return DEFAULT_STATE;
  const p = raw as Partial<CourageState>;
  const companion =
    p.companion && SPECIES.some((s) => s.id === p.companion?.species) && typeof p.companion.name === "string"
      ? p.companion
      : null;
  return {
    version: 1,
    age: AGES.includes(p.age as AgeBand) ? (p.age as AgeBand) : null,
    hardThings: arr<HardThing>(p.hardThings),
    companion,
    records: arr<StepRecord>(p.records),
    customSteps: arr<CustomStep>(p.customSteps),
    events: arr<AppEvent>(p.events),
    earned: arr<string>(p.earned),
    lastSeen: typeof p.lastSeen === "string" ? p.lastSeen : null,
    cameBack: p.cameBack === true,
    settings: { ...DEFAULT_STATE.settings, ...(p.settings ?? {}) },
  };
}

function withBadges(state: CourageState): Result {
  const fresh = newBadges(state.earned, state);
  return { state: fresh.length ? { ...state, earned: [...state.earned, ...fresh] } : state, newlyEarned: fresh };
}

export function setAge(s: CourageState, age: AgeBand | null): CourageState {
  return { ...s, age };
}

export function setHardThings(s: CourageState, hard: HardThing[]): CourageState {
  return { ...s, hardThings: [...new Set(hard)] };
}

export function setCompanion(s: CourageState, species: Species, name: string): CourageState {
  const clean = name.trim().slice(0, 24) || (SPECIES.find((x) => x.id === species)?.name ?? "Friend");
  return { ...s, companion: { species, name: clean } };
}

export function recordStep(s: CourageState, r: StepRecord): Result {
  return withBadges({ ...s, records: [...s.records, r] });
}

export function addCustomStep(s: CourageState, room: RoomId, text: string, now: Date): Result {
  return withBadges({ ...s, customSteps: [...s.customSteps, makeCustomStep(room, text, now)] });
}

export function logEvent(s: CourageState, kind: EventKind, now: Date): Result {
  return withBadges({ ...s, events: [...s.events, { kind, at: now.toISOString() }] });
}

/** Called when the app opens. A gap of 7 or more days is celebrated, never punished. */
export function visit(s: CourageState, now: Date): Result {
  const gap = s.lastSeen ? daysBetween(new Date(s.lastSeen), now) : 0;
  return withBadges({ ...s, lastSeen: now.toISOString(), cameBack: s.cameBack || gap >= 7 });
}

export function updateSettings(s: CourageState, patch: Partial<Settings>): CourageState {
  return { ...s, settings: { ...s.settings, ...patch } };
}
```

- [ ] **Step 4: Write `src/lib/backup.ts`**

```ts
import { normalize, type CourageState } from "./state";

const APP = "rehearse-courage";

export function exportBackup(s: CourageState): string {
  return JSON.stringify({ app: APP, version: 1, savedAt: new Date().toISOString(), state: s }, null, 2);
}

/** Throws Error("not-a-backup") for anything that is not a Rehearse Courage backup. */
export function importBackup(text: string): CourageState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("not-a-backup");
  }
  const p = parsed as { app?: unknown; state?: unknown };
  if (!p || p.app !== APP || !p.state) throw new Error("not-a-backup");
  return normalize(p.state);
}
```

- [ ] **Step 5: Run it and see it pass**

Run: `npx vitest run src/lib/state.test.ts`
Expected: 8 passed.

- [ ] **Step 6: Write `src/lib/store.ts`**

```ts
"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_STATE, normalize, type CourageState } from "./state";

const KEY = "courage:v1";

type Snapshot = CourageState & { hydrated: boolean };

const SERVER: Snapshot = { ...DEFAULT_STATE, hydrated: false };
let current: Snapshot | null = null;
const listeners = new Set<() => void>();

function load(): Snapshot {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...normalize(JSON.parse(raw)), hydrated: true };
  } catch {
    // Storage blocked or corrupted: start fresh in memory.
  }
  return { ...DEFAULT_STATE, hydrated: true };
}

function save(s: CourageState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Storage full or blocked: progress stays in memory for this visit.
  }
}

function snapshot(): Snapshot {
  if (!current) current = load();
  return current;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useCourage(): Snapshot {
  return useSyncExternalStore(subscribe, snapshot, () => SERVER);
}

/** Applies a pure action from state.ts, saves, notifies. Returns badge ids earned by this action. */
export function act(
  fn: (s: CourageState) => CourageState | { state: CourageState; newlyEarned: string[] },
): string[] {
  const { hydrated: _hydrated, ...base } = snapshot();
  const out = fn(base);
  const next = "state" in out ? out.state : out;
  const earned = "state" in out ? out.newlyEarned : [];
  current = { ...next, hydrated: true };
  save(next);
  listeners.forEach((l) => l());
  return earned;
}

/** Delete everything on this device. Recordings (IndexedDB) are cleared by the recordings module in a later plan. */
export function clearEverything(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to remove.
  }
  current = { ...DEFAULT_STATE, hydrated: true };
  listeners.forEach((l) => l());
}
```

- [ ] **Step 7: Full check**

```bash
npm test && npm run typecheck && npm run lint
```

Expected: all test files pass (smoke, age, content, ladder, courage, achievements, quests-companion, crisis, state); typecheck and lint clean. If lint flags `_hydrated` as unused, add `// eslint-disable-next-line @typescript-eslint/no-unused-vars` on the line above it.

- [ ] **Step 8: Commit**

```bash
git add src/lib/state.ts src/lib/backup.ts src/lib/state.test.ts src/lib/store.ts
git commit -m "Add on-device state, pure actions, backup and React store

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## After this plan

- **Plan 2, design phase:** ultimate-frontend protocol (design-taste-frontend, impeccable, text-to-lottie) plus the 12ui-design skill. Output: DESIGN.md, tokens, key screens for Paper Lantern Map, firefly companion concept.
- **Plan 3, screens:** first visit, home, map, room, step runner, Panic now, body kit, badges, Me, Help, Privacy, About, offline, 404. Copies Rehearse's speech engine (`kokoro`, `tts`, `use-speech`, `transcribe`, `recordings`).
- **Plan 4, AI and safety pipeline:** provider chain (Groq, Workers AI, WebLLM, pre-written), Llama Guard output check, `/api/coach`, `/api/tidy`, `/api/transcribe`, rate limits.
- **Plan 5, games, Then vs Now, speech tools, body double, extra voices, on-device Whisper.**
- **Plan 6, companions (Lottie), e2e with axe, real-user testing, launch.**
- Before launch: re-check every support line number in `src/lib/safety/crisis.ts` against the official sites.
