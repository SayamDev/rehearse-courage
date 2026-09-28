# Handoff: Rehearse Courage

Last updated: 2026-09-28 (UK time). **Read this first in a new session**, then `PRODUCT.md`, `DESIGN.md` and the spec. Everything below is on `main`.

## Start here (paste into a new session)

> Continue Rehearse Courage. Read `docs/HANDOFF.md` first, then `PRODUCT.md`, `DESIGN.md` and the spec. Work on a new branch off `main`. Next up: [pick from "What to do next"].

## What this is

Rehearse Courage is a free, private, no-login web app that helps people of any age (including children) who find it hard to speak up: in class, with friends, or in front of a group (anxiety, panic, blushing, ADHD, shyness, stuttering, losing words). Sister project to Rehearse (https://rehearse.sayamdev.workers.dev) by Sayam Ajmal. Practice, not therapy.

- Repo: private GitHub `SayamDev/rehearse-courage`. All rights reserved (`LICENSE`).
- Live: https://rehearse-courage.sayamdev.workers.dev (Cloudflare Workers free plan).
- Stack: Next.js 16.3.6 App Router (**read `node_modules/next/dist/docs/` before writing Next code, see `AGENTS.md`**), React 19, Tailwind v4, Vitest, Playwright + axe, `@opennextjs/cloudflare`.

## Where things stand

| Piece | State |
|---|---|
| Plan 1: core logic (ladder, points, badges, quests, companion, crisis check, store) | Merged (PR #1) |
| Plan 2: design system (`DESIGN.md`, tokens, fonts, comps) | Merged with Plan 3 |
| Plan 3: every v1 screen | Merged (PR #2) |
| Plan 4: AI coach, sentence tidy, speech to text, safety pipeline | Merged (PR #3) |
| Fixes: each step its own task, calmer Need a pause, dark-mode edges, firefly only | Merged (PR #4) |
| Pop-ups: welcome guide, keep your progress safe | Merged (PR #5) |

Tests on `main`: 430 unit tests, 132 Playwright tests (journeys, AI, pop-ups, axe on 22 routes in light and dark at 390 and 1280). Typecheck, lint and build clean. Worker is about 1.5 MB compressed (free plan limit 3 MB).

**Not yet confirmed live:** that the Groq key works. Check at step 4 as an adult (Me, age Adult): a reply that answers what you typed means AI is on; a general line means it fell back. Or:
`curl -s -X POST https://rehearse-courage.sayamdev.workers.dev/api/coach -H "Origin: https://rehearse-courage.sayamdev.workers.dev" -H "Content-Type: application/json" -d '{"age":"adult","situationId":"class-answer","room":"class","answer":"I think the answer is ten"}'`
(`"source":"groq"` is good; `{"reply":null}` means re-run `npx wrangler secret put GROQ_API_KEY` from the project folder.)

## What to do next (in rough priority)

1. **Art (maker's Mac only, 12ui).** See "Art still needed". Biggest visible gap.
2. **Voices (Plan 5 start).** Kokoro on device (copy `kokoro.ts`, `kokoro.worker.ts`, `tts.ts` from the public Rehearse repo), captions always shown, a kid voice set; then the "voice download" pop-up (the maker asked for it; it waits for voices). Keep kokoro-js out of the server bundle the same way WebLLM is (see Gotchas).
   - **With the pop-up work: ask for the person's name** (the maker asked for it). Optional and skippable, stored only on the device like everything else, shown on the profile instead of just "Me" (the Me page heading and profile card; the bottom nav label stays "Me" so it fits). Editable and removable in Me. Never sent to the AI or anywhere else. Kind copy for kids, e.g. "What should we call you?"; a first name or nickname is plenty. Ask it in first visit or as a one-time pop-up for existing users, following the pop-up rules in `src/lib/popups.ts`.
3. **Plan 5 rest:** mini-games (`/games/[id]`: word builder, rescue snap, hot seat, breath balloon, story dice), Then vs Now (opt-in recordings in IndexedDB), body double mode, on-device Whisper (Transformers.js) for under-13 speech to text.
4. **PWA / offline:** `/offline` page, manifest, service worker (`/sw.js` headers are already in `next.config.ts`). Then add "Add to Home Screen / Install" to the save pop-up, like Rehearse.
5. **Desktop polish:** the maker said the desktop layout felt off. Dark-mode edges and footer are fixed; ask for a fresh screenshot before changing more (the full-width bottom nav matches the comps).
6. **Plan 6:** companion Lottie set (firefly first), real-user testing (teacher, teen, someone who stutters, someone with ADHD; STAMMA review of stuttering copy), launch.
7. **Before launch:** re-check every helpline number in `src/lib/safety/crisis.ts` against official sites.

## Documents (source of truth)

| File | What it holds |
|---|---|
| `PRODUCT.md` | Users, purpose, constraints, brand, principles |
| `DESIGN.md` | Paper Lantern Map design system (tokens, type, components, motion, anti-patterns) |
| `docs/superpowers/specs/2026-09-27-rehearse-courage-design.md` | Full product spec (features, AI rules, safety, privacy, build order) |
| `docs/superpowers/plans/*.md` | Plans 1, 3 and 4 (done) and deferred findings |
| `design/comps/*.jpg` | Approved screen designs (visual authority) |
| `design/art-manifest.md` | Every art file, its source, and what is missing |

## How the app works (map of the code)

- **State:** `src/lib/state.ts` (pure actions; `normalize` upgrades old saves), `src/lib/store.ts` (`useCourage()`, `act()`, localStorage key `courage:v1`, `hydrated` flag). Nothing leaves the device except AI for 13+.
- **Screens:** views in `src/components/views/*`; pages in `src/app/*` are thin. Shell in `src/components/shell/*` (nav, Need a pause button, pre-paint settings script in `layout.tsx`).
- **Steps:** `src/components/views/step-view.tsx`. Step 1 shows the scene and ideas; steps 2 to 5 show "The moment" plus their own task heading (`TASK` map), with ideas under "Need a start?"; step 4 asks Cobi; step 6 is the real-life mission.
- **Companion:** firefly only for now (`SPECIES_NOW` in `first-visit.tsx`; first visit is 3 screens). Hedgehog and fox stay in the code for old saves and future art.
- **Need a pause:** `?calm=1` on any route; `src/components/calm/panic-view.tsx`. Uses the `--help` token (calm teal) and a lifebuoy icon, never amber (amber means progress and rewards).
- **AI (13+ only):** `/api/coach`, `/api/tidy`, `/api/transcribe` over `src/lib/ai/handlers.ts`: same origin, body size (413), age band (only `teen`/`adult`), crisis check, per-visitor daily share, then Groq `openai/gpt-oss-20b` / `whisper-large-v3-turbo`, then Workers AI (`AI` binding). Every reply passes `src/lib/safety/output.ts` (local filter, then Llama Guard). Browser side `src/lib/ai/client.ts` never sends for under 13, a skipped age, or with "Online AI help" off, and falls back to the on-device model (WebLLM, opt-in in Me) then pre-written replies (`src/lib/content/coach-replies.ts`).
- **Pop-ups:** `src/components/popups/*`, rules in `src/lib/popups.ts` (one per visit; never on `/start`, steps, `/help`, `/privacy` or with Need a pause open). Welcome guide once after naming the firefly; save nudge after 3 steps with no backup in 30 days.

## Rules that must not be broken

- Free forever: no paid services, no card on any account, no analytics, trackers or ads, no accounts.
- Under 13 (and a skipped age question) never uses generative AI or server speech to text. For 13+, only the words of one answer, the step and the age band are sent; nothing is logged.
- Never score fluency, fillers, pauses or stutters, not even as praise. Never punish.
- Copy: plain, kind, short. No em or en dashes, no "Oops", no exclamation marks in success messages, never "calm down" or "You've got this".
- Tokens only, one amber (primary) button per screen, Phosphor Regular icons, no emoji, no padlocks or "locked".
- WCAG 2.2 AA in light and dark; 44px targets; keyboard and screen reader complete (focus never lost to `<body>` after async actions); reduced motion shows end frames.
- Phone (390px) and laptop (1280px) are equal priority.

## How to work

- New branch off `main` for each piece of work; open a PR when done (the maker merges and deploys).
- Every commit message ends with exactly `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Before each commit: `rm -rf .open-next`, then `npm test && npm run typecheck && npm run lint && npm run build`.
- E2E: `npm run test:e2e` (Playwright starts `npm run dev`). In a cloud container: `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e`.
- Dev server: `npm run dev` (port 3330). Screenshot changes at 390 and 1280, light and dark, and compare with `design/comps/`.
- Review: after building, have a separate reviewer check against the rules above; fix everything Critical or Important.

## Gotchas learned the hard way

- **Worker size:** anything big imported by client code also lands in the server bundle. WebLLM is copied to `public/vendor/web-llm.js` at build time (`scripts/vendor-webllm.mjs`, runs on `predev`/`prebuild`, git-ignored) and imported from a runtime URL with `turbopackIgnore`. Check with `npm run cf:build`, then `npx wrangler deploy --dry-run --outdir /tmp/wr` (must stay under 3 MB gzip).
- **Wrangler "Worker name missing":** run wrangler commands from the project folder (or add `--name rehearse-courage`).
- **AI routes need `Content-Length`** (bodies are refused unread otherwise). Browsers send it; tests must too.
- **Dialog close events fire after the click;** in tests, poll storage with `expect.poll`.
- **Lint rules:** no synchronous setState in an effect, no ref reads during render.
- **In a cloud shell,** `pkill -f` with a pattern that matches your own command kills the shell; kill by port instead.

## Art still needed (maker's Mac, `12ui` CLI)

Map composite, room-friends, room-presenting, step-class (classroom), header-kit, header-badges, firefly stills x4 (hiding, peeking, waving, speaking), a class island with a 5-stone path, badge art without a baked tick for first-words and hand-up, and art for the six badges without any. Rules: no text, numbers, UI or creatures in scene art; plain empty path; WebP via `npx -y sharp-cli`. Details in `design/art-manifest.md`. Topping up 12ui is the maker's decision.

## Maker-only actions

- Deploy: `git checkout main && git pull && npm install && npm run cf:deploy` (needs `npx wrangler login` once).
- Groq key: `npx wrangler secret put GROQ_API_KEY` from the project folder; Zero Data Retention on in the Groq console; key name `rehearse-courage-prod`, no expiry (or the longest, with a reminder to rotate it).
