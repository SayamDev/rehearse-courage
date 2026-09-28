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

Done on 2026-09-28 (PRs #12 to #18, all live): gibberish check for typed answers, coach lines auto-play (setting on by default), the calm teal Sticker Book redesign (top bar, phone tabs, progress track, no painted scenery), a hands-on Body kit, a fuller Home, kinetic Lottie type (name greeting, welcome, "That took courage", the six-step ladder), Need a pause redesign, PWA and offline, five warm-up games (`/games`), Then and now recordings, body double mode, and classmate voices at step 5 (151 of 151 lines recorded).

Also live (PRs #20, #21): responsive fixes plus a no-sideways-scroll test at 320 and 768px; the recording state (coral button, blinking dot, bars that move with the voice), a microphone check on the last first-visit screen and in Me > Settings; Me as a profile band plus four tabs (You, Settings, Voices & AI, Your data; tab in the URL hash); `/for-adults` for parents and teachers.

Also live (PR #22, 2026-09-28):
- **Voices: Qwen3-TTS** (VoiceDesign, Apache 2.0) through VoiceStudio's MLX-Audio engine, chosen by the maker by ear over OmniVoice and Kokoro (OmniVoice sounded unnatural). Every role in **British (default) and American** (`src/lib/voice/lines.ts`, each voice is a plain-English description; setting `accent`, chips in Me > Voices & AI). About 572 clips in `public/voice/`.
- Voices now cover grounding, breathing (first three breaths guided), speech tools, body explainers and reframe cards, all five games, the step-done line and the step 6 line. "Read lines out automatically" (setting `playCoach`) covers all of it; `useReadAloud()` in `spoken-line.tsx` reads a line from code.
- **Re-recording** after changing any line: open VoiceStudio, choose the MLX-Audio engine with the Qwen3-TTS VoiceDesign model (`POST /engines/select {"family":"tts","backend_id":"mlx-audio","model_id":"mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-4bit"}`), then `npm run voices:record` (about 2 s a clip; skips existing clips, deletes stale ones). Always let the maker hear samples before changing a voice (`afplay` a generated wav).
- Step 6 celebration: `for-real` Lottie ("You did it for real." with rays, flag and burst), its own card and spoken line.
- On-device listening for under 13 (`src/lib/voice/listen.ts` + `listen.worker.ts`, Whisper tiny via `@huggingface/transformers`, opt-in download in Me > Voices & AI, setting `deviceListen`): at step 4 Cobi shows "Cobi heard: ..." and the words get the on-device crisis check. **Not yet tested on a real phone.**
- Tidy: `src/lib/scenes.ts` replaced by `src/lib/progress.ts`; unused paintings and OmniVoice reference clips deleted.

Next:
1. **Try on a real phone:** the recording button, the microphone check, on-device listening for under 13, installing the app.
2. **Real-user testing** (teacher, teen, someone who stutters, someone with ADHD; STAMMA review of the stuttering copy and the speech tools).
3. **Before launch:** re-check every helpline number in `src/lib/safety/crisis.ts` against official sites.
4. **Companion Lottie set (optional):** the maker likes the painted firefly stills; a vector firefly exists (`public/lottie/firefly.json`, used by body double).

Lottie: edit `scripts/lottie/build.mjs` (and `type.mjs` for type), run `node scripts/lottie/build.mjs ~/Projects/bondling-lottie-player` and check frames in the Skottie player on port 3130 (project "courage").

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
