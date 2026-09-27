# Rehearse Courage: design spec

Date: 2026-09-27
Author: Sayam Ajmal
Status: draft, awaiting review

## 1. What it is

Rehearse Courage is a free, no-login web app that helps people of any age speak up when speaking feels hard: in class, with friends, and in front of a group. It is a sister project to Rehearse (https://rehearse.sayamdev.workers.dev) and shares its engine, but has its own look and personality.

It is built for people who:

- get anxious, panic, sweat or blush when they have to speak
- are shy, or stay quiet in class because they fear being judged
- have ADHD and struggle to start or stay with practice
- stutter or stammer
- find it hard to form longer sentences or lose their words

It is practice, not therapy. It never claims to treat anxiety, stuttering or any condition.

### Principles

1. **Courage, not performance.** We reward trying, never "sounding good". No fluency scores, no filler counts, no stutter detection.
2. **Never punish.** No losing, no broken streaks, no leaderboards, no comparison with other people.
3. **Small steps.** One thing on screen at a time. Sessions of about 60 seconds are enough.
4. **Private by default.** No accounts. Everything lives on the device. Recordings never leave it.
5. **Free forever.** Only free services. No ads, no trackers, no paid tiers.
6. **Back to real life.** The game points outward: real-life missions are the biggest wins.

## 2. Identity

- **Name:** Rehearse Courage
- **Tagline under logo:** a Rehearse project, by Sayam Ajmal
- **Maker's mark:** small "Sayam Ajmal" signature stamp in the footer and About page; a tiny "S" charm on each companion creature.
- **Link to Rehearse:** Cobi, the Rehearse coach, appears as the tips coach. About page links to Rehearse.
- **URL:** courage.sayamdev.workers.dev (Cloudflare Workers free).
- **Ownership:** private GitHub repo SayamDev/rehearse-courage, LICENSE all rights reserved, package.json `UNLICENSED`, author Sayam Ajmal. Footer: "© 2026 Sayam Ajmal. All rights reserved."

## 3. Look and feel: Paper Lantern Map

A cousin of Rehearse's Sticker Book, not a copy.

- **Kept from Rehearse (family resemblance):** Atkinson Hyperlegible Next for body text, Bricolage Grotesque for display, die-cut white outlines on badges, the paper-and-shadow feel.
- **Different:** a papercraft map world at dusk. Palette runs from deep ink-blue night toward warm dawn as the user progresses. One accent: warm lantern amber. Motion is slower and breath-paced.
- **Signature moment:** the companion's lantern glows brighter as the user gets braver, and the map lightens from night toward dawn.
- Light and dark themes both shipped through tokens.
- Exact tokens, type scale and components are decided in the design phase (ultimate-frontend protocol plus 12ui) and recorded in DESIGN.md. This spec does not fix hex values.

## 4. First visit (`/start`)

About 30 seconds. Every step can be skipped. If age band is skipped it defaults to "Under 13", the safest setting.

1. **Age band:** Under 13 / 13 to 17 / Adult. Stored on device only. Controls AI (section 9).
2. **What feels hard?** Multi-select chips: talking in class, with friends, presenting, panic, blushing or sweating, stuttering, losing my words, staying focused (ADHD). Only changes what is suggested first. Nothing is hidden.
3. **Pick your companion:** firefly, hedgehog or paper fox. User names it.
4. **Voice:** same chooser as Rehearse (Kokoro on device first, then device voice).

Age band and choices can be changed later in Me.

## 5. Core loop

Home (`/`) shows one card: **Today's one step**, the companion, and a small map preview. Tapping the card runs one ladder step. Afterwards: calm celebration, courage points, companion reaction, back home.

### 5.1 Courage ladder

Each room has six steps. The user can move up or down freely. Nothing is locked except that step 6 suggests finishing step 3 first (it can still be opened).

1. **Think it:** read the situation, pick or write what you would say.
2. **Type or whisper it.**
3. **Say it out loud, alone.**
4. **Say it to the coach:** coach asks, user answers, coach responds.
5. **Say it with a little pressure (optional):** simulated moment such as the teacher calling on you or a friend jumping in. Optional gentle timer, off by default.
6. **Real-life mission:** try it for real, then tick it off with an optional one-line note on how it went.

Every speaking step has a **Type instead** option.

Users can add **custom steps** to any room (for example "ask the librarian for a book").

### 5.2 Rooms (v1)

- **Class:** answer a question, ask a question, read aloud, share in group work.
- **Friends:** join a conversation, give your opinion, disagree kindly, tell a short story.
- **Presenting:** introduce yourself, give a one-minute talk.

Each situation is a ladder. Content is pre-written per age band (simpler wording for under 13).

### 5.3 Feedback after a speaking step

Shown: how long you spoke, that you finished, change over time ("14 seconds, up from 6").
Never shown: filler counts, pace scores, pause counts, stutter detection, "confidence" scores.

## 6. Tools (reachable from any screen)

- **Panic now button:** fixed on every screen. Opens a full-screen calm view: breathing visual, 5-4-3-2-1 grounding, "you are safe, this will pass", support lines link. One tap to close.
- **Body kit (`/kit`):** visual breathing (box, 4-7-8, simple slow), 5-4-3-2-1 grounding, blushing and sweating reframe cards, a short "what your body is doing" explainer.
- **Sentence builder:** 13 and over, "say it messy, then tidy" (AI tidies, user says the tidy version back). Under 13, fill-in frames ("I think ___ because ___").
- **Rescue phrases:** pocket card deck ("Can I come back to that?", "I'm not sure, but maybe...", "Let me think for a second"). Each can be practised out loud.
- **Speech tools (stuttering-friendly, optional):** easy onset, pausing, light contact. Presented as options you may use, never graded. Includes acceptance cards ("Stuttering is a way of talking, not a mistake").
- **Body double mode:** companion sits beside you and quietly "practises too" while you do a step. ADHD support.

## 7. Game layer

### 7.1 Courage map (`/map`)

Rooms are regions, ladder steps are stops on a path, real-life missions are landmarks. The companion travels the map with you. Map lighting moves from night to dawn with total progress.

### 7.2 Companion

Three species (firefly, hedgehog, paper fox). Four growth stages driven by courage points and missions:

1. **Hiding**
2. **Peeking**
3. **Waving**
4. **Speaking up**

Plus per species: idle, cheer, and "sit with me" (body double). That is 7 Lottie clips per species, 21 in total. Build order: firefly first (ships with v1 launch), hedgehog and fox follow; until ready they show a still illustration per stage.

The companion never shows sadness or guilt when the user is away. On return it is simply happy to see them.

### 7.3 Courage points

Earned for bravery, not quality. Base points per step; bonus for choosing a harder step than last time, for speaking on a day marked "rough", and for real-life missions. Same points for a 5-second answer on a hard day as a 60-second one on a good day.

### 7.4 Brave days

A weekly count ("3 brave days this week"). It never resets to zero in a punishing way and is never shown as a broken streak.

### 7.5 Achievements (`/badges`)

Die-cut sticker badges with a short Lottie celebration. Initial set:

- First words: first time speaking out loud
- Typed it first: first Type instead step
- Hand up: finished Class step 5
- Said it anyway: spoke on a day marked rough
- Back again: returned after a week or more away
- Out in the wild: first real-life mission ticked
- Calm captain: used the body kit 10 times
- Rescue ready: practised 5 rescue phrases
- Room explorer: tried a step in every room
- My own step: added a custom ladder step
- Then and now: listened to your first and latest recordings
- Dawn: map fully lit

Badges are never taken away.

### 7.6 Quests

One to three small daily quests (for example "try 3 rescue phrases"). Missing them has no effect.

### 7.7 Mini-games (`/games/[id]`)

About 1 to 2 minutes each, no losing, no clocks unless switched on:

- **Word builder:** drag words into a sentence, then say it.
- **Rescue snap:** match an awkward moment to a rescue phrase.
- **Hot seat:** spin for a question, answer in your own time.
- **Breath balloon:** balloon grows and shrinks with breathing pace.
- **Story dice:** roll three pictures, tell a tiny story.

### 7.8 Then vs Now

Opt-in. Keeps the user's first recording in each room and plays it beside the latest. Stored on device only, deletable.

### 7.9 Celebration settings

Confetti, sounds and haptics each switchable off. Reduced motion shows still frames.

## 8. Pages

| Route | Purpose |
|---|---|
| `/` | Home: today's one step, companion, map preview |
| `/start` | First visit |
| `/map` | Courage map |
| `/room/[id]` | Room ladder |
| `/step/[id]` | Run one ladder step |
| `/games/[id]` | Mini-game |
| `/kit` | Body kit, rescue phrases, speech tools |
| `/badges` | Achievements |
| `/me` | Progress, companion, settings, backup, delete everything |
| `/help` | Support lines by region, "practice not therapy" |
| `/privacy` | Plain-English privacy for kids and parents |
| `/about` | Maker, Rehearse link |
| `/offline` | Offline fallback |

Plus custom 404.

## 9. AI

### 9.1 Age rules

- **Under 13:** no generative AI at all. Coach lines, feedback and sentence help are pre-written or rule-based. Speech-to-text only on device or via the browser's own recogniser.
- **13 to 17:** AI coach and sentence tidy, with a stricter prompt (simple words, shorter replies).
- **Adult:** AI coach and sentence tidy.

### 9.2 Provider order (13 and over)

1. **Groq** `openai/gpt-oss-20b` (zero data retention on). Main engine.
2. **Cloudflare Workers AI** via Worker binding (no extra key, does not train on customer data). Backup. Free budget about 10,000 neurons per day, shared with safety checks.
3. **On-device model** via WebLLM (small Qwen or Llama, 0.5B to 3B), only if the user opted in and downloaded it (never auto-downloads on metered connections).
4. **Pre-written and rule-based** replies. Always available.

Site-wide daily caps (from Rehearse `rate-limit.ts`) protect free quotas. Paid providers are never used.

### 9.3 Speech

**Text to speech** (coach, classmates, rescue phrases):

1. **Kokoro on device** (Web Worker, as Rehearse). Default for everyone.
2. **Extra on-device voices** (Piper-style ONNX voices in the browser), so the simulated class and friend group have several distinct voices, including younger-sounding classmates. Opt-in download, cached.
3. **Groq Orpheus** (13 and over only), expressive coach voice.
4. **Cloudflare Workers AI Deepgram Aura-2** (13 and over only), natural pacing. Shares the small daily Workers AI budget, so it is last among server voices.
5. **Device voice** (speechSynthesis). Always available.

**Kid-friendly voices (under 13):** only on-device voices (steps 1, 2 and 5), reading pre-written lines, so nothing is generated and nothing leaves the device. A "Kids" voice set picks the warmest, clearest Kokoro and Piper voices, speaks about 10% slower, and always shows captions. The companion creature has no spoken voice, only soft chirps and sounds (switchable off), so it never sounds like a stranger talking to a child. Classmates in the simulated class use the friendliest voices in the set. Real children's voices are not cloned or recorded.

**Speech to text:**

1. **On-device Whisper** via Transformers.js, when downloaded. The only speech to text for under 13.
2. **Groq Whisper** (13 and over only).
3. **Cloudflare Workers AI Whisper** (13 and over only), backup.
4. **Browser speech recognition** only in on-device mode where the browser supports it. Chrome's default recogniser sends audio to Google, so it is never used for under 13 and is labelled for others.
5. **Type instead.** Always available.

### 9.3a Free AI that is not used live, and why

- **Gemini free tier:** Google's terms allow using free-tier prompts and replies to improve its products, with human review, and say not to send personal or sensitive information. Unsuitable for anxious users and children speaking about their fears.
- **Microsoft Copilot:** no free developer API (consumer chat only). GitHub Models was retired in July 2026.
- **Azure Speech free tier (F0):** generous, and Microsoft does not train on it, but it needs an Azure account with a card. Breaks the no-card rule; revisit only if the maker explicitly decides otherwise.
- **Mistral free tier:** requires opting in to training. **OpenRouter free models:** logging depends on the upstream provider.

### 9.3b AI at build time (no user data)

Free tools such as Gemini and Copilot may be used by the maker while building, to draft pre-written content: situations, coach lines per age band, rescue phrases, sentence frames, quests, badge text, reframe cards. No user data is ever involved. Every drafted line is reviewed and edited by the maker, checked against the principles in section 1, and stored in `src/lib/content/*`. This gives under-13s and every offline fallback rich, varied content.

### 9.4 Safety pipeline

1. **Crisis check (before any AI):** local keyword and phrase check on typed or transcribed text for self-harm, abuse and crisis signals. On match, AI is skipped and a calm support screen shows regional support lines (for example Childline and Samaritans in the UK, 988 in the US) and emergency numbers. Region comes from the request's country header at view time and is not stored.
2. **Prompt rules:** never diagnose, no medical advice, never say "calm down", never correct stutters or fillers, short and kind, age-appropriate wording.
3. **Output check:** replies pass through Llama Guard on Workers AI before display. If flagged, or if the guard is unavailable (budget used up), a local output filter runs, and anything uncertain is replaced by a pre-written reply.
4. **Honesty:** "Practice, not therapy" on Help and About; support lines one tap from every screen via the Panic now view.

## 10. Privacy

- No accounts, analytics, trackers or ads.
- All progress in localStorage (prefix `courage:`); recordings in IndexedDB. Neither leaves the device.
- Only AI text for 13 and over leaves the device, to Groq or Cloudflare, with no identifiers.
- Backup to file and restore from file (from Rehearse `backup.ts`).
- Delete everything, with confirmation.
- Privacy page in plain English for kids and parents.

## 11. Accessibility

- WCAG 2.2 AA in both themes.
- Atkinson Hyperlegible, text-size setting, reduce-motion setting (all motion becomes still frames), sounds optional.
- Colour never the only signal; colour-blind safe palette.
- Keyboard and screen reader complete; skip link; visible focus.
- Captions for every spoken coach line.
- Touch targets at least 44px.
- PWA with offline support; works on low-end phones; nothing heavy downloads without asking.
- Type instead available on every speaking step.

## 12. Architecture

**Stack:** Next.js 16 (App Router), React 19, Tailwind v4, `motion`, `@phosphor-icons/react`, `lottie-web`, `kokoro-js`, `zod`, `@opennextjs/cloudflare`, `wrangler`. Tests: Vitest, Playwright with `@axe-core/playwright`. New dependencies: `@mlc-ai/web-llm`, `@huggingface/transformers` (both lazy-loaded, opt-in).

**Copied from Rehearse** (adapted, interview-specific parts removed): `kokoro.ts` + `kokoro.worker.ts`, `tts.ts`, `use-speech.ts`, `transcribe.ts`, `rate-limit.ts`, `backup.ts`, `store.ts`, `focus.ts`, `calm.ts`, `popups.ts`, `recordings.ts`, `ai/` client, `next.config.ts` headers (COOP same-origin, COEP credentialless, Referrer-Policy no-referrer), `scripts/cf.sh`, `wrangler.jsonc`, `open-next.config.ts`.

**New modules** (one job each, `src/lib/`):

| Module | Job |
|---|---|
| `ladder.ts` | Rooms, situations, steps, custom steps, what to suggest next |
| `content/*` | Pre-written situations, coach lines, frames, rescue phrases per age band |
| `courage.ts` | Courage points and brave days |
| `achievements.ts` | Badge rules and evaluation |
| `quests.ts` | Daily quests |
| `companion.ts` | Species, name, growth stage, mood |
| `age.ts` | Age band and AI permission |
| `speech-tools.ts` | Stuttering-friendly techniques and acceptance cards |
| `safety/crisis.ts` | Crisis check and region support lines |
| `safety/output.ts` | Llama Guard call and local output filter |
| `ai/provider.ts` | Provider order and fallback |
| `ai/tidy.ts` | Messy to tidy sentence |
| `ai/coach.ts` | Coach replies |
| `games/*` | One file per mini-game logic |

**API routes:** `/api/coach`, `/api/tidy`, `/api/transcribe` (13 and over only; server rejects requests flagged under 13 and the client never sends them).

## 13. Testing

- **Unit (Vitest):** ladder navigation and custom steps, courage points and brave days (no punishing reset), each achievement rule, quests, companion stage thresholds, age gate (under 13 never calls AI), crisis check phrases, output filter, provider fallback order.
- **End to end (Playwright + axe):** first visit in each age band, one full ladder step (speak and type-instead paths), body kit, Panic now reachable from every route, badges page, backup and restore, delete everything, zero axe violations on every route, reduced motion.
- **Real users before launch:** 3 to 5 people (a teacher, a teenager, someone who stutters, someone with ADHD, an adult with speaking anxiety). Stuttering wording sent to STAMMA for feedback.

## 14. Build order

1. Scaffold repo, copy engine, deploy empty shell to Cloudflare.
2. Design phase: ultimate-frontend protocol and 12ui, DESIGN.md, tokens, key screens.
3. Age gate, first visit, store, home.
4. Ladder engine and Class room content; one full step end to end.
5. Panic now, body kit, rescue phrases.
6. Friends and Presenting rooms.
7. Courage points, brave days, achievements, quests, map.
8. Firefly companion Lottie set.
9. AI coach and tidy with provider chain and safety pipeline.
10. Mini-games.
11. Then vs Now, speech tools, body double.
12. On-device AI and on-device Whisper (opt-in).
13. Hedgehog and fox companions.
14. Accessibility pass, e2e, real-user testing, launch.

## 15. Out of scope for v1

- Accounts, sync between devices, community or group calls.
- Parent or teacher dashboards (a printable parent and teacher guide may come later).
- Languages other than English.
- Native apps (PWA only).
- Any paid AI provider.

## 16. Risks

- **Workers AI budget is small** (about 15 to 25 replies a day). Mitigation: Groq stays primary; guard falls back to local filter.
- **Free tiers change** (Groq removed some free models in August 2026). Mitigation: provider chain and pre-written fallback mean the app never breaks.
- **Companion animation workload** (21 clips). Mitigation: firefly first, stills for the others.
- **Wording for vulnerable users** can hurt if wrong. Mitigation: real-user testing and STAMMA review before launch.
- **Age gate is self-reported.** Mitigation: skipping defaults to under 13, the safest mode.
