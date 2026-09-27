# Handoff: Rehearse Courage

Last updated: 2026-09-27 (evening, UK time). Read this first in a new session, then `PRODUCT.md`, `DESIGN.md`, and the current plan.

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
| `docs/superpowers/plans/2026-09-27-plan-3-screens.md` | **Plan 3 (in progress)**: 14 tasks with files, behaviour, copy, tests |
| `docs/superpowers/plans/deferred-from-plan-1.md` | Review findings deferred to later plans |
| `design/comps/*.jpg` | Approved screen designs (visual authority): home, map, step, step-done, panic, kit, badges |
| `design/art-manifest.md` | Every art file in `public/art/`, its source, and what is still missing |

## Branches

- `main`: Plan 1 merged (PR #1).
- `plan-2-design`: design phase (PRODUCT.md, DESIGN.md, tokens, fonts, comps). Not merged to main; `plan-3-screens` is built on top of it.
- `plan-3-screens`: all Plan 3 work. **Continue here.** When Plan 3 is done, open one PR from `plan-3-screens` to `main` (it includes the design phase).

## Plan 3 status

| Task | Status |
|---|---|
| 1 Scene art | Partial. See "Art still needed" below |
| 2 App shell (nav, Panic now button, skip link, settings, pre-paint settings script) | Done, reviewed |
| 3 UI primitives (PaperCard, Button, StatsPill, Switch, Sticker, ToolTile, IdeaList) + `/dev/ui` gallery | Done, reviewed |
| 4 Scenes, PathStones (5 stones + destination as step 6), Companion + `/dev/scenes` lab | Done, reviewed |
| 5 First visit `/start` | Done, reviewed |
| 6 Home `/` | **In progress at handoff time.** Check `git log` and `git status` on `plan-3-screens`: if `src/lib/home.ts` / home view are committed, review them; if not, restart Task 6 from its plan section |
| 7 Map and rooms | Not started |
| 8 Step runner (speak on device, type instead, crisis check on text) | Not started |
| 9 Step complete celebration | Not started |
| 10 Panic now view (`?calm=1`), grounding, `/help` support lines | Not started |
| 11 Body kit | Not started |
| 12 Badges and quests | Not started |
| 13 Me, privacy, about, 404 | Not started |
| 14 E2E, axe, visual check against comps | Not started |

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

### Art still needed (Task 1)

Generated with the `12ui` CLI (free daily allowance ran out on 2026-09-27; it resets 2026-09-28 00:00 UTC). Needed: map composite, room-friends, room-presenting, step-class (classroom), header-kit, header-badges, firefly stills x4 (hiding, peeking, waving, speaking), a new class island with a 5-stone path (current one has 7 ring stones), and badge art without a baked tick for first-words and hand-up, plus art for the six badges that have none. Rules: no text, numbers, UI or creatures in scene art; plain empty path; WebP via `npx -y sharp-cli`. See `design/art-manifest.md`. **The `12ui` CLI is installed and logged in only on the maker's Mac**, so art generation cannot run in a cloud session unless 12ui is installed and authenticated there. A cloud session can build all other tasks against the existing art and leave art swaps for later.

## How work is being done

- Workflow: superpowers subagent-driven development. Per task: implementer subagent, then a separate reviewer subagent (spec + quality), fix rounds until approved; screenshots checked against `design/comps/` before review. Ledger of progress is local-only (`.superpowers/`, git-ignored); this file replaces it for a new session.
- Every commit message ends with exactly: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- Before each commit: `rm -rf .open-next` (Cloudflare build output breaks lint), then `npm test && npm run typecheck && npm run lint && npm run build`.
- Screenshots: `npx playwright screenshot --full-page --viewport-size=390,844 --color-scheme=dark http://localhost:3330/<route> out.png` (and 1280x900 light). Full-page captures show the fixed nav mid-page; that is a capture artifact.
- Dev server: `npx next dev --port 3330`.
- Push `plan-3-screens` after each finished task.

## Rules that must not be broken

- Free forever: no paid services, no card on any account (Groq, Cloudflare), no analytics, trackers or ads. No accounts.
- Under 13 (and a skipped age question) never uses generative AI or server speech to text. Nothing in Plan 3 sends data off the device.
- Never score fluency, fillers, pauses or stutters. Never punish: no broken streaks, no losing, badges never removed.
- Copy: plain, kind, short. No em or en dashes, no "Oops", no exclamation marks in success messages, never "calm down" or "You've got this".
- Tokens only (no raw hex in components), one amber (primary) button per screen, Phosphor Regular icons, no emoji, no padlocks or "locked".
- WCAG 2.2 AA in light and dark; 44px targets; keyboard and screen reader complete; reduced motion shows end frames.
- Phone (390px) and laptop (1280px) are equal priority.

## After Plan 3

- Plan 4: AI and safety pipeline (Groq `openai/gpt-oss-20b` with zero data retention, then Cloudflare Workers AI incl. Llama Guard output check, then opt-in WebLLM, then pre-written replies; `/api/coach`, `/api/tidy`, `/api/transcribe`; rate limits). Gemini/Mistral/OpenRouter free tiers are ruled out (training or logging).
- Plan 5: mini-games, Then vs Now, extra on-device voices (kid voice set), on-device Whisper.
- Plan 6: companion Lottie set (firefly, hedgehog, paper fox), real-user testing (teacher, teen, someone who stutters, someone with ADHD; STAMMA review of stuttering copy), launch.
- Before launch: re-check every helpline number in `src/lib/safety/crisis.ts` against official sites.

## Maker-only actions

- Deploys: `npm run cf:deploy` (needs `npx wrangler login` on the machine).
- Topping up 12ui is the maker's decision; do not do it.
- Impeccable skill update is blocked upstream (pbakaus/impeccable#857); installed version 4.3.1 is current.
