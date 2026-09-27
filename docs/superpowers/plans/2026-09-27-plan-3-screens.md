# Rehearse Courage, Plan 3: Screens

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build every v1 screen of Rehearse Courage in the approved Paper Lantern Map look, wired to the Plan 1 logic, so a person can do the first visit, practise a full ladder step by speaking or typing, see progress on the map, earn badges, and reach calm tools and support from anywhere.

**Architecture:** Next.js 16 App Router. Pages are thin Server Components that render client "view" components; all progress comes from `useCourage()` / `act()` in `src/lib/store.ts`. Scene art is static images in `public/art/`; everything that changes with progress (stones, lit destination, companion stage, text) is HTML/CSS drawn over the art. No AI in this plan: coach replies, sentence tidy and transcription arrive in Plan 4. Speaking is measured on the device (seconds spoken) with MediaRecorder; nothing is uploaded.

**Tech Stack:** Next.js 16.3.6, React 19, Tailwind v4 tokens from `src/app/globals.css`, `motion` for UI motion, `@phosphor-icons/react` (Regular weight), Vitest for logic, Playwright + `@axe-core/playwright` for e2e.

**Visual authority:** `design/comps/*.jpg` (home, map, step, step-done, panic, kit, badges) and `DESIGN.md`. Where a comp breaks DESIGN.md (exclamation marks, "You've got this", rough day as an answer option, numbers baked into art), DESIGN.md wins. `design/12ui-pages/*.html` (local only, git-ignored) may be opened for measurements, never copied wholesale.

**Why this plan is not full code:** these are visual build tasks that must match images and use judgement. Each task gives exact files, interfaces, copy, behaviour and tests; implementers write the markup against the comps and DESIGN.md. Logic that can be unit tested is specified with tests.

## Global Constraints

- Follow `DESIGN.md` exactly: tokens only (no raw hex in components), Bricolage display, Atkinson body at least 17px (18px on phones), one amber button per screen, Phosphor Regular icons, no emoji, no padlocks or "locked", no gradient text.
- Copy rules: no em or en dashes, no "Oops", no exclamation marks in success messages, never "calm down" or "You've got this". Plain, kind, short.
- Never show fluency, filler, pace or stutter feedback. Feedback after speaking is only: that you finished, seconds spoken, change over time.
- Age: `effectiveAge(age)`; skipped age means under 13. Nothing in this plan sends data off the device.
- Panic now is reachable on every route, including `/start`, and never covers the primary button.
- Every interactive element: hover, active, focus-visible (token `--focus`), disabled. Touch targets at least 44px. Keyboard and screen reader complete. Skip link in the layout.
- Reduced motion (system or `settings.reduceMotion`, applied as `data-motion="reduce"` on `<html>`): all motion shows end frames.
- Phone and laptop are equal priority: verify at 390px and 1280px, light and dark.
- Commit messages end with EXACTLY: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- Run `npm test && npm run typecheck && npm run lint` before each commit. If `.open-next/` exists, delete it before lint (build output).

## File map

| Path | Responsibility |
|---|---|
| `public/art/*.webp` | Scene art without UI, numbers or companion (Task 1) |
| `public/art/firefly/*.webp` | Firefly stills per stage, transparent (Task 1) |
| `src/lib/scenes.ts` | Scene registry: art paths, stone coordinates, destination hotspot per room (Task 4) |
| `src/components/shell/*` | `AppShell`, `BottomNav`, `PanicButton`, `SkipLink`, `SettingsEffects` (Task 2) |
| `src/components/ui/*` | `PaperCard`, `Button`, `StatsPill`, `Switch`, `Sticker`, `ToolTile`, `IdeaList` (Task 3) |
| `src/components/scene/*` | `SceneArt`, `PathStones`, `Companion` (Task 4) |
| `src/app/start/*` | First visit (Task 5) |
| `src/app/page.tsx`, `src/components/views/home-view.tsx` | Home (Task 6) |
| `src/app/map/*`, `src/app/room/[id]/*` | Map and room ladder (Task 7) |
| `src/app/step/[id]/*`, `src/lib/speak.ts` | Step runner, speaking on device (Task 8) |
| `src/components/views/step-done.tsx` | Step complete celebration (Task 9) |
| `src/components/calm/*`, `src/app/help/*` | Panic now, support lines (Task 10) |
| `src/app/kit/*` | Body kit, rescue phrases, frames (Task 11) |
| `src/app/badges/*` | Badges (Task 12) |
| `src/app/me/*`, `src/app/privacy/*`, `src/app/about/*`, `src/app/not-found.tsx` | Me, privacy, about, 404 (Task 13) |
| `e2e/*` | Playwright journeys and axe (Task 14) |

---

### Task 1: Scene art without UI

**Files:** Create `public/art/home-class.webp`, `public/art/map.webp`, `public/art/room-friends.webp`, `public/art/room-presenting.webp`, `public/art/step-class.webp`, `public/art/panic.webp`, `public/art/header-kit.webp`, `public/art/header-badges.webp`, `public/art/firefly/{hiding,peeking,waving,speaking}.webp`, `public/art/kit/{breathing,grounding,blushing,sweating,rescue,frames}.webp`, `design/art-manifest.md`.

**Interfaces:** Produces art paths used by `src/lib/scenes.ts` (Task 4).

- [ ] Generate each scene with 12ui (`12ui draft --reference design/comps/<comp>.jpg --retain style --candidates 2 --concept "<scene> illustration only: no UI, no text, no cards, no buttons, no nav, no numbered stones, no creatures; keep the dusk-to-dawn papercraft style; leave the path as a plain empty dirt path; leave the lower third as calm cloud and paper space for UI"`). Scenes: home-class (Class island, path ends at school door), map (three islands: school, park with benches, small stage), room-friends, room-presenting, step-class (classroom scene), panic (quiet dusk hill with empty space in centre), header-kit, header-badges (wide short banners).
- [ ] Firefly stills: generate the firefly (from comps) on a flat plain background in four poses (curled up hiding behind lantern; peeking; waving holding lantern; standing tall lantern raised), then cut out to transparent. If no background-removal tool is available, keep the plain background colour-matched to `--canvas` and note it in the manifest as a gap for Plan 6 (Lottie replaces these anyway).
- [ ] Body-kit tile art: six round illustrations matching `design/comps/kit.jpg`.
- [ ] Convert to WebP at 2x display size (scenes max 2400px wide, quality 78; tiles 320px) with `npx -y sharp-cli`. Keep each scene under 400KB.
- [ ] Inspect every image. Reject any with baked text, numbers, UI, or extra creatures; regenerate.
- [ ] Write `design/art-manifest.md` listing each file, source run, size and any gap.
- [ ] Commit: "Add scene art without UI for Paper Lantern Map".

### Task 2: App shell

**Files:** Create `src/components/shell/app-shell.tsx`, `bottom-nav.tsx`, `panic-button.tsx`, `skip-link.tsx`, `settings-effects.tsx`; modify `src/app/layout.tsx`. Test: `src/components/shell/nav-items.test.ts`.

**Interfaces:**
- `NAV_ITEMS: { href: "/" | "/map" | "/kit" | "/badges" | "/me"; label: "Home" | "Map" | "Kit" | "Badges" | "Me"; icon: PhosphorIcon }[]` exported from `bottom-nav.tsx` (icons: House, MapTrifold, FirstAidKit, Medal, User).
- `activeNav(pathname: string): string` returns the href of the active item (`/room/*` and `/step/*` count as `/map`; `/help` as none).
- `PanicButton` opens the Panic now view (Task 10) via `?calm=1` search param so it works from any page and the back button closes it.
- `SettingsEffects` (client) mirrors `settings.reduceMotion`, `settings.largeText` and theme onto `<html data-motion data-text data-theme>`, and calls `act(s => visit(s, new Date()).state)` once per app load.

- [ ] Test `activeNav` for `/`, `/map`, `/room/class`, `/step/class-answer`, `/kit`, `/badges`, `/me`, `/help`.
- [ ] Build the bottom nav per comps: chrome bar, rounded, five items, active item amber icon plus label plus underline, `aria-current="page"`. On laptop it stays at the bottom, centred, max 1100px.
- [ ] Panic button: chrome pill with Phosphor `ShieldCheck`, label "Panic now", fixed bottom right above the nav, never overlapping the primary card button (reserve space).
- [ ] Layout: skip link, `<main id="main">`, nav. The ownership footer ("© 2026 Sayam Ajmal. All rights reserved.") stays on every page as a small muted line at the end of the content, above the space reserved for the nav.
- [ ] Commit.

### Task 3: UI primitives

**Files:** Create `src/components/ui/paper-card.tsx`, `button.tsx`, `stats-pill.tsx`, `switch.tsx`, `sticker.tsx`, `tool-tile.tsx`, `idea-list.tsx`, `public/torn-edge.svg`; a dev-only gallery route `src/app/dev/ui/page.tsx` (excluded from nav).

**Interfaces:**
- `PaperCard({ children, className })`: surface token, torn edge via CSS `mask-image: url(/torn-edge.svg)` border mask plus radius 20px, `shadow-card`.
- `Button({ variant: "primary" | "secondary" | "chrome", size?: "lg" | "md", icon?, ...buttonProps })` and `ButtonLink` for links. Primary = amber, on-amber text, pill, 52px tall. Only one primary per screen (reviewed, not enforced).
- `StatsPill({ braveDays: number; points: number })`: chrome pill, Phosphor `CalendarCheck` and `Star`, tabular numbers, copy "3 brave days this week" and "145 courage points" (singular "1 brave day").
- `Switch({ checked, onChange, label })`: real `role="switch"`, 44px target.
- `Sticker({ badgeId, earned })`: die-cut look (white 4px outline, soft shadow); unearned = `stone-dim` outline, no lock icon, `aria-label` "Not earned yet".
- `ToolTile({ href, art, title, line, helps })`.
- `IdeaList({ ideas: string[]; value; onChange })`: radio group of "things you could say".

- [ ] Build each against the comps; show all in `/dev/ui` in both themes.
- [ ] Unit test the pluralisation helper in `stats-pill.tsx` (`braveDaysLabel(1) === "1 brave day this week"`).
- [ ] Commit.

### Task 4: Scene, stones and companion

**Files:** Create `src/lib/scenes.ts`, `src/lib/scenes.test.ts`, `src/components/scene/scene-art.tsx`, `path-stones.tsx`, `companion.tsx`.

**Interfaces:**
- `type Scene = { art: string; width: number; height: number; stones: { x: number; y: number }[]; destination: { x: number; y: number; w: number; h: number; label: string } }` with x/y as percentages of the art.
- `SCENES: Record<RoomId, Scene>`: exactly 5 stones per room plus the destination (school, park bench, stage) as step 6.
- `stoneStates(records, situationId): ("lit" | "current" | "dim")[]` of length 6 (index 5 = destination): levels at or below `highestLevel` are lit, `nextLevel` is current, the rest dim.
- `PathStones({ room, situationId, onPick? })`: absolutely positioned 44px buttons over `SceneArt`, numbered 1 to 5, labelled "Step 3, Say it out loud, alone, current" etc.; destination rendered as an invisible hotspot with a glowing outline when lit, label "Step 6, Try it for real".
- `Companion({ species, stage, size })`: shows the firefly still for the stage (hedgehog and fox fall back to firefly art with a note until Plan 6); lantern glow intensity follows stage.

- [ ] Test `stoneStates` for: no records, highest 3, highest 6, and that there are always 6 entries.
- [ ] Test every scene has 5 stones and coordinates within 0 to 100.
- [ ] Measure stone coordinates by placing stones on the real art in the browser (dev route `src/app/dev/scenes/page.tsx` with a click-to-log helper) and record them in `scenes.ts`.
- [ ] Commit.

### Task 5: First visit (`/start`)

**Files:** Create `src/app/start/page.tsx`, `src/components/views/first-visit.tsx`. Modify `src/app/page.tsx` to redirect to `/start` when no companion has been chosen (client-side check after hydration).

- [ ] Four calm screens, one at a time, over the home art at night, each with "Skip" and a back link: (1) "How old are you?" Under 13 / 13 to 17 / Adult (skipping sets nothing, which means under 13). (2) "What feels hard right now?" chips from `HARD_THINGS` with labels: Talking in class, With friends, Presenting, Panic, Blushing or sweating, Stuttering, Losing my words, Staying focused. (3) "Pick a companion" firefly, hedgehog, paper fox (hedgehog and fox show a still with "Grows up with you"). (4) "Give them a name" text field (label above, 24 characters), default species name.
- [ ] Finish button "Let's go" saves via `act` (`setAge`, `setHardThings`, `setCompanion`) and goes to `/`.
- [ ] A small line under screen 1: "Everything stays on this device. No account."
- [ ] Panic button visible.
- [ ] Commit.

### Task 6: Home (`/`)

**Files:** Create `src/components/views/home-view.tsx`; modify `src/app/page.tsx`.

- [ ] Match `design/comps/home.jpg`: title "Rehearse Courage" plus "a Rehearse project, by Sayam Ajmal", scene art of the suggested room with `PathStones`, companion at the current stone, `PaperCard` "Today's one step" with situation title, "Step N of 6", level name from `LEVELS`, primary "Start" to `/step/<situationId>?level=N`; `StatsPill` from `braveDaysThisWeek` and `totalPoints`; panic and nav.
- [ ] When `suggestNext` is null: card "You have walked every path." with "Add your own step" linking to `/room/class#add`.
- [ ] Sky warmth: a CSS overlay on the scene whose opacity follows `mapLight()` (night tint fades as progress grows).
- [ ] Commit.

### Task 7: Map and rooms (`/map`, `/room/[id]`)

**Files:** Create `src/app/map/page.tsx`, `src/components/views/map-view.tsx`, `src/app/room/[id]/page.tsx`, `src/components/views/room-view.tsx`.

- [ ] Map per `design/comps/map.jpg`: three islands, each with a chrome label "Class" / "Friends" / "Presenting" and a line "Furthest step: N of 6" (N = highest level across that room's situations, 0 shows "Not started yet"). Continue card for the suggested step.
- [ ] Room page: scene art of that room, list of its situations as rows (title, highest step, next step), tap to choose which situation's stones show; primary "Continue" for the selected situation. Section "Your own steps" with custom steps and an add form (`id="add"`, label above, 140 characters, uses `addCustomStep`).
- [ ] `generateStaticParams` for the three rooms; unknown id uses `notFound()`.
- [ ] Commit.

### Task 8: Step runner (`/step/[id]`)

**Files:** Create `src/lib/speak.ts`, `src/lib/speak.test.ts`, `src/app/step/[id]/page.tsx`, `src/components/views/step-view.tsx`.

**Interfaces:**
- `useSpeak(): { state: "idle" | "asking" | "listening" | "done" | "blocked"; seconds: number; start(); stop(); reset() }` using `getUserMedia` + `MediaRecorder` and an `AudioContext` analyser only to count seconds of voice above a gentle threshold. The audio is discarded unless `settings.keepRecordings` (Then vs Now, Plan 5). Supports hold-to-talk and tap-to-start/tap-to-stop.
- `voicedSeconds(frames: number[], threshold: number, frameMs: number): number` pure helper for counting.

- [ ] Test `voicedSeconds` with silent, all-voice and mixed frames.
- [ ] Page per `design/comps/step.jpg`: back link, title "Practice step", room and step line, scene art, `PaperCard` with the situation scene (`words()` for age), `IdeaList` of ideas (none preselected), `RoughDaySwitch` ("I'm having a rough day", separate from ideas), then by level:
  - Level 1 "Think it": pick an idea or write your own, button "I've thought of it".
  - Level 2 "Type or whisper it": text field plus "Done".
  - Level 3 to 5: `SpeakButton` "Hold to speak" (primary) and "Type instead" (secondary). Level 4 shows a pre-written coach line before speaking (`content` line per situation; Cobi name shown as "Cobi, your coach"). Level 5 shows a gentle pressure moment ("The teacher looks at you and smiles.") with an optional timer only if `settings.timers`.
  - Level 6 "Try it for real": shows the mission, buttons "I did it" and "Not yet" (not yet goes back, no penalty), optional one-line note.
- [ ] On finish, create a `StepRecord` and `act(s => recordStep(s, record))`; pass new badge ids and points earned to the step-done view.
- [ ] Microphone blocked: calm inline message "The microphone is off. You can type instead." with the type option focused.
- [ ] Before any text is used, run `checkCrisis` on it; if flagged, open the support screen (Task 10) instead of continuing, and still save the step.
- [ ] Commit.

### Task 9: Step complete

**Files:** Create `src/components/views/step-done.tsx`, `src/components/scene/celebration.tsx`.

- [ ] Per `design/comps/step-done.jpg` with DESIGN.md copy: heading "You had a go." (or the badge title with a full stop if a badge was earned, e.g. "First words."), line "That took courage.", seconds spoken when measured ("You spoke for 14 seconds. Last time: 6."), "+15 courage points" (from `pointsFor`), sticker for each new badge, companion one stage brighter if the stage changed, primary "Back to the map", secondary "One more step".
- [ ] Signature moment: lantern glow brightens, the new stone lights, sky warms. Respect reduced motion and `settings.confetti` / `settings.sounds` (no sound files yet).
- [ ] Commit.

### Task 10: Panic now and support

**Files:** Create `src/components/calm/panic-view.tsx`, `breathing-lantern.tsx`, `grounding.tsx`, `src/app/help/page.tsx`, `src/components/calm/support-lines.tsx`.

- [ ] Panic view (opened by `?calm=1`, full screen, focus trapped, Escape closes): per `design/comps/panic.jpg`, a large lantern that grows over 4s and shrinks over 6s with text "Breathe in with the light" / "And slowly out", line "You are safe. This feeling will pass.", two tiles "5-4-3-2-1" (Ground yourself in the present) and "Talk to someone" (to `/help`), and "Close". Logs a `panic` event.
- [ ] Grounding: five short screens (5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste) with "Next".
- [ ] `/help`: "Talk to someone" with `supportLines(country)`; country read from the `cf-ipcountry` request header in the Server Component (never stored), plus "If you are in danger now, call {emergency}." and "Rehearse Courage is practice, not therapy."
- [ ] Crisis screen variant (from Task 8): same page with the gentle line "It sounds like things are really hard right now. You deserve support." plus "Not what you meant? Carry on" back to the step.
- [ ] Commit.

### Task 11: Body kit (`/kit`)

**Files:** Create `src/app/kit/page.tsx`, `src/components/views/kit-view.tsx`, `src/app/kit/[tool]/page.tsx`, `src/components/calm/reframe-cards.tsx`, `src/components/calm/rescue-deck.tsx`, `src/lib/content/body.ts` (+ test for copy rules).

- [ ] Kit grid per `design/comps/kit.jpg` (two columns on laptop, one on phone, not three equal cards): Breathing, Grounding, Blushing, Sweating, Rescue phrases, Sentence frames, plus Speech tools (easy onset, pausing, light contact, presented as options, with acceptance cards).
- [ ] `body.ts`: short reframe cards for blushing and sweating and an explainer of what the body is doing (plain words, no medical claims), speech tool descriptions, acceptance lines ("Stuttering is a way of talking, not a mistake."). Test with the same copy rules as `content.test.ts`.
- [ ] Rescue deck: one phrase at a time with "Say it" (uses `useSpeak`, logs a `rescue` event when spoken or typed) and "Next". Opening any tool logs a `kit` event.
- [ ] Commit.

### Task 12: Badges (`/badges`)

**Files:** Create `src/app/badges/page.tsx`, `src/components/views/badges-view.tsx`.

- [ ] Per `design/comps/badges.jpg`: header art, all 12 `BADGES` as stickers (earned in colour, unearned as outline with the description as the path to earn it, never "locked"), quests for today from `dailyQuests(dayKey(now))` with gentle progress text ("1 of 3"), no progress bars with tracks.
- [ ] Commit.

### Task 13: Me, privacy, about, 404

**Files:** Create `src/app/me/page.tsx`, `src/components/views/me-view.tsx`, `src/app/privacy/page.tsx`, `src/app/about/page.tsx`, `src/app/not-found.tsx`.

- [ ] Me: companion with name and stage, courage points, brave days, settings (text size, reduce motion, theme light/dark/system, sounds, confetti, timers, keep recordings), age band and "what feels hard" editable, backup download (`exportBackup`, filename `rehearse-courage-backup-YYYY-MM-DD.json`), restore (file input, `importBackup`, calm error "That file isn't a Rehearse Courage backup."), "Delete everything" with a confirm step (type nothing; two-button confirm "Yes, delete everything" / "Keep my progress").
- [ ] Privacy: plain English for kids and parents (what is stored, where, what never leaves the device, no accounts, no trackers).
- [ ] About: maker's mark "Made by Sayam Ajmal", link to Rehearse, "practice, not therapy", ownership footer.
- [ ] 404: small scene, "This path doesn't go anywhere yet.", button "Back home".
- [ ] Commit.

### Task 14: End to end, accessibility and visual check

**Files:** Create `playwright.config.ts`, `e2e/journey.spec.ts`, `e2e/a11y.spec.ts`.

- [ ] Journey: first visit (skip age) then home then start step 1 then finish then step done then back to map; typed step at level 2; panic opens from home, map, step and `/start`, and closes with Escape; `/help` shows fallback lines without a country header.
- [ ] Axe: zero violations on every route in light and dark at 390px and 1280px.
- [ ] Visual check against comps: screenshot each screen at 1280x853 and 390x844 and compare side by side with `design/comps/*`; list and fix concrete mismatches (bounded: one fix round, one confirm round).
- [ ] Commit.

## After this plan

Plan 4 (AI and safety pipeline), Plan 5 (games, Then vs Now, extra voices, on-device Whisper), Plan 6 (companion Lottie set, launch). Deferred items: `docs/superpowers/plans/deferred-from-plan-1.md`.
