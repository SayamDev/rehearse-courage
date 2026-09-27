# Handoff: Rehearse Courage

Last updated: 2026-09-27 (night, UK time, cloud session). Read this first in a new session, then `PRODUCT.md`, `DESIGN.md`, and the current plan.

## What this is

Rehearse Courage is a free, private, no-login web app that helps people of any age (including children) who find it hard to speak up: in class, with friends, or in front of a group. Audience includes anxiety, panic, blushing and sweating, ADHD, shyness, stuttering and losing words. It is a sister project to Rehearse (https://rehearse.sayamdev.workers.dev) by Sayam Ajmal. Practice, not therapy.

- Repo: private GitHub `SayamDev/rehearse-courage`. All rights reserved (see `LICENSE`).
- Live holding page: https://rehearse-courage.sayamdev.workers.dev (Cloudflare Workers free plan, deployed from Plan 1).
- Stack: Next.js 16.3.6 (App Router; **read `node_modules/next/dist/docs/` before writing Next code, see `AGENTS.md`**), React 19, Tailwind v4, Vitest, Playwright, `@opennextjs/cloudflare`.

## Documents (source of truth, in this order)

| File | What it holds |
|---|---|
| `PRODUCT.md` | Users, purpose, positioning, constraints, brand commitments, principles |
| `DESIGN.md` | Paper Lantern Map design system: colours (tokens), type, shapes, stones, components, motion, anti-patterns |
| `docs/superpowers/specs/2026-09-27-rehearse-courage-design.md` | Full product spec (features, AI rules, safety, privacy, build order) |
| `docs/superpowers/plans/2026-09-27-plan-1-foundation-and-core-logic.md` | Plan 1 (done, merged) |
| `docs/superpowers/plans/2026-09-27-plan-3-screens.md` | Plan 3 (done, merged as PR #2): 14 tasks with files, behaviour, copy, tests |
| `docs/superpowers/plans/2026-09-27-plan-4-ai-and-safety.md` | **Plan 4 (built on `plan-4-ai-safety`)**: AI coach, tidy, speech to text, safety pipeline |
| `docs/superpowers/plans/deferred-from-plan-1.md` | Review findings deferred to later plans |
| `design/comps/*.jpg` | Approved screen designs (visual authority): home, map, step, step-done, panic, kit, badges |
| `design/art-manifest.md` | Every art file in `public/art/`, its source, and what is still missing |

## Branches

- `main`: Plans 1 to 3 merged (PR #1, PR #2).
- `plan-4-ai-safety`: all Plan 4 work. Open one PR to `main` when reviewed.

## Plan 4 status (AI and safety)

All eight tasks are built, tested and reviewed. How it works:

- `/api/coach`, `/api/tidy`, `/api/transcribe` (thin routes over `src/lib/ai/handlers.ts`). Order of checks: same origin, body size (413), age band (only `teen`/`adult`, else 403), crisis check, per-visitor daily share, then providers.
- Providers (`src/lib/ai/provider.ts`): Groq `openai/gpt-oss-20b` and `whisper-large-v3-turbo`, then Workers AI (`@cf/meta/llama-3.1-8b-instruct`, `@cf/openai/whisper-large-v3-turbo`) through the `AI` binding. `null` means "use your own fallback".
- Output check (`src/lib/safety/output.ts`): clean (no dashes, no `!`, no markdown), local filter (banned lines, any comment on how someone spoke, health labels, personal questions, links, harm, swearing, tidy drift), then Llama Guard 3 on Workers AI while its daily share lasts.
- Browser (`src/lib/ai/client.ts`): nothing is ever sent for under 13, a skipped age, or with "Online AI help" off. Fallback order: online, on-device model (if saved), pre-written (`src/lib/content/coach-replies.ts`).
- Step 4: "Hear Cobi's reply" after speaking or typing; spoken answers are transcribed (13+ online only) from an in-memory recording that is dropped straight after.
- Kit, Sentence frames: "Say it messy, then tidy" for 13+ when online help or the device model is on.
- Me, AI help: "Online AI help" switch (default on, 13+ only) and "AI on this device" (WebLLM, Qwen2.5 0.5B, about 300 MB, download only on a tap, warning on mobile data, remove button). The WebLLM code is a separate chunk that production only loads after the tap.
- Rate limits (`src/lib/ai/limits.ts`): per visitor per day (coach 30, tidy 30, transcribe 60) keyed by an HMAC of the IP with a random in-memory secret that changes daily; site caps under the free plans. All env-overridable.
- Privacy page has an "AI, for 13 and over" section (`/privacy#ai`); About links to it.
- Tests: unit tests for every module above; `e2e/ai.spec.ts` (mocked AI, under-13 and offline paths send nothing, crisis, tidy, Me, real route refusals); axe on step 4.

**Maker actions before AI works live** (without them the app still works, with Cobi's pre-written replies):
1. Create a free Groq API key (no card), and in the Groq console turn on Zero Data Retention.
2. `npx wrangler secret put GROQ_API_KEY` (never put the key in a file in the repo).
3. `npm run cf:deploy`. The Workers AI binding in `wrangler.jsonc` needs no setup on the free plan.

Not done in Plan 4 (by design): server voices (Groq Orpheus, Aura-2) and on-device Whisper belong to Plan 5 with the voice work; the browser's own speech recogniser is not used.

## Plan 3 status

| Task | Status |
|---|---|
| 1 Scene art | Partial. See "Art still needed" below |
| 2 App shell (nav, Panic now button, skip link, settings, pre-paint settings script) | Done, reviewed |
| 3 UI primitives (PaperCard, Button, StatsPill, Switch, Sticker, ToolTile, IdeaList) + `/dev/ui` gallery | Done, reviewed |
| 4 Scenes, PathStones (5 stones + destination as step 6), Companion + `/dev/scenes` lab | Done, reviewed |
| 5 First visit `/start` | Done, reviewed |
| 6 Home `/` | Done, reviewed (merged from `wip-task-6-home`; that branch can be deleted) |
| 7 Map and rooms | Done, reviewed |
| 8 Step runner (speak on device, type instead, crisis check on text) | Done, reviewed |
| 9 Step complete celebration | Done, reviewed |
| 10 Panic now view (`?calm=1`), grounding, `/help` support lines | Done, reviewed |
| 11 Body kit | Done, reviewed |
| 12 Badges and quests | Done, reviewed |
| 13 Me, privacy, about, 404 | Done, reviewed |
| 14 E2E, axe, visual check against comps | Done: 14 journeys and 84 axe runs (21 routes, light and dark, 390 and 1280) all pass |

**Next:** review and merge the Plan 4 PR, do the maker actions above, then swap in the missing art (below) when 12ui is available.

### Decisions made during Plan 3 (not all in the plan text)

- Path = 5 numbered stones drawn in code + the destination building (school, park, stage) as step 6 "Try it for real". Numbers are never baked into art.
- New users: `/` redirects to `/start` after hydration when no companion exists. Home must not flash its content before that decision (Task 6 requirement).
- Bottom nav is hidden on `/start` (`hidesNav()` in `src/components/shell/no-nav-routes.ts`); Panic now is on every route.
- Panic now opens via `?calm=1` on the current route (view itself is Task 10).
- Settings include `theme: "system" | "light" | "dark"`; a tiny inline script in `layout.tsx` applies theme, reduced motion and large text before first paint.
- Current stone has a static ring as well as the pulse, so it is distinct under reduced motion.
- Amber glow uses `color-mix(in srgb, var(--amber) N%, transparent)` so dark mode is correct.
- Unearned badges show a faint outline of their art (never "?", never a lock); badges without art use a neutral placeholder with a Phosphor icon.
- Friends and Presenting scenes are `provisional: true` in `src/lib/scenes.ts` (use map island art) until their own art exists. Companion uses a crop of `public/art/kit/breathing.webp` until firefly stills exist (`FIREFLY_STILL` map in `src/components/scene/companion.tsx`).

- Microphone logic lives in a plain controller (`createSpeakController` in `src/lib/speak.ts`) wrapped by `useSpeak`, so the open/release lifecycle is unit tested without a DOM.
- Step 4 coach lines and step 5 pressure lines are pre-written in `src/lib/content/coach.ts` (Plan 4 swaps in live replies for 13 and over).
- `/help?crisis=1&from=...` is the crisis variant; `safeReturn` in `src/lib/help.ts` guards the "Carry on" link.
- Kit and Badges headers use `panic.webp` as a stand-in (`ArtHeader`) until header-kit / header-badges exist. Speech tools tile uses an icon until it has art.
- Text size has three steps (Normal, Large, Larger = 100/115/130%) as in DESIGN.md; old saves with `largeText: true` become Large.
- E2E: `PW_CHROMIUM_PATH=/path/to/chromium npm run test:e2e` (omit the variable on a machine where Playwright's own browsers are installed).

### Art still needed (Task 1)

Generated with the `12ui` CLI (free daily allowance ran out on 2026-09-27; it resets 2026-09-28 00:00 UTC). Needed: map composite, room-friends, room-presenting, step-class (classroom), header-kit, header-badges, firefly stills x4 (hiding, peeking, waving, speaking), a new class island with a 5-stone path (current one has 7 ring stones), and badge art without a baked tick for first-words and hand-up, plus art for the six badges that have none. Rules: no text, numbers, UI or creatures in scene art; plain empty path; WebP via `npx -y sharp-cli`. See `design/art-manifest.md`. **The `12ui` CLI is installed and logged in only on the maker's Mac**, so art generation cannot run in a cloud session unless 12ui is installed and authenticated there. A cloud session can build all other tasks against the existing art and leave art swaps for later.

## How work is being done

- Workflow: superpowers subagent-driven development. Per task: implementer subagent, then a separate reviewer subagent (spec + quality), fix rounds until approved; screenshots checked against `design/comps/` before review. Ledger of progress is local-only (`.superpowers/`, git-ignored); this file replaces it for a new session.
- Every commit message ends with exactly: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- Before each commit: `rm -rf .open-next` (Cloudflare build output breaks lint), then `npm test && npm run typecheck && npm run lint && npm run build`.
- Screenshots: `npx playwright screenshot --full-page --viewport-size=390,844 --color-scheme=dark http://localhost:3330/<route> out.png` (and 1280x900 light). Full-page captures show the fixed nav mid-page; that is a capture artifact.
- Dev server: `npx next dev --port 3330`.
- Push the working branch after each finished task.

## Rules that must not be broken

- Free forever: no paid services, no card on any account (Groq, Cloudflare), no analytics, trackers or ads. No accounts.
- Under 13 (and a skipped age question) never uses generative AI or server speech to text; the client never sends and the server refuses. For 13+, only the words of one answer (or one recording), the step and the age band are sent, never identifiers, and nothing is logged.
- Never score fluency, fillers, pauses or stutters. Never punish: no broken streaks, no losing, badges never removed.
- Copy: plain, kind, short. No em or en dashes, no "Oops", no exclamation marks in success messages, never "calm down" or "You've got this".
- Tokens only (no raw hex in components), one amber (primary) button per screen, Phosphor Regular icons, no emoji, no padlocks or "locked".
- WCAG 2.2 AA in light and dark; 44px targets; keyboard and screen reader complete; reduced motion shows end frames.
- Phone (390px) and laptop (1280px) are equal priority.

## After Plan 3

- Plan 4: built (see above). Gemini/Mistral/OpenRouter free tiers stay ruled out (training or logging).
- Plan 5: mini-games, Then vs Now, extra on-device voices (kid voice set), on-device Whisper.
- Plan 6: companion Lottie set (firefly, hedgehog, paper fox), real-user testing (teacher, teen, someone who stutters, someone with ADHD; STAMMA review of stuttering copy), launch.
- Before launch: re-check every helpline number in `src/lib/safety/crisis.ts` against official sites.

## Maker-only actions

- Deploys: `npm run cf:deploy` (needs `npx wrangler login` on the machine).
- AI: Groq key via `npx wrangler secret put GROQ_API_KEY`, and Zero Data Retention on in the Groq console.
- Topping up 12ui is the maker's decision; do not do it.
- Impeccable skill update is blocked upstream (pbakaus/impeccable#857); installed version 4.3.1 is current.
