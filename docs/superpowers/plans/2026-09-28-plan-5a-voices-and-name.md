# Plan 5a: voices, the voice download pop-up, and the person's name

Date: 2026-09-28. Maker decisions (chat, 2026-09-28):

- Lines are **tap to hear**: a small "Hear it" button beside each spoken line. Nothing plays by surprise. A Me setting turns on auto-play.
- The natural in-browser voice (Kokoro, about 90 MB) is **offered once by a pop-up, never auto-downloaded**. Until then the device voice reads live lines. Download and remove also live in Me.
- Fixed lines are **pre-recorded at build time, for free, on the maker's Mac**: Kokoro (Apache 2.0) for teacher, group host, narrator and Cobi; VoiceStudio's OmniVoice (CC-BY-NC, free and non-commercial, credited in About) for friends, child-sounding for the kids set, young-adult otherwise.
- **Ask the person's name** (optional, on-device only, never sent to AI). Shown as the Me heading, on the profile card, and on Home ("Hi Sam, today's one step"). Bottom nav label stays "Me".

## Tasks

1. **Name.** `name?: string` in state (normalised, trimmed, max 30 chars), set/clear actions, included in backups. First visit asks "What should we call you?" (optional, skip). Existing users get a one-time pop-up (after the welcome guide, one pop-up per visit, same rules as `src/lib/popups.ts`). Me: heading shows the name; an edit field under About you with Save and Remove. Home: "Hi {name}, today's one step" (falls back to "Today's one step").
2. **Line inventory.** `src/lib/voice/lines.ts`: every fixed spoken line (scene, ideas, mission, coach line, coach replies, rescue phrases, frames) in both age wordings, each with a speaker role (teacher, friend, host, narrator) and a stable id (short hash of role + text). Unit test: ids are unique and stable.
3. **Recording script.** `scripts/voices/record.mjs` (maker-only, needs VoiceStudio running on :3900 for friend lines): Kokoro (kokoro-js in Node) for teacher/host/narrator, OmniVoice `/generate` for friends with fixed seeds and one reference clip per voice so a character sounds the same every time. Encodes to small mono files under `public/voice/<set>/<id>.*` and writes `public/voice/manifest.json`. Skips clips that already exist. Kids set reuses the same clips where the speaker is an adult and plays them at 0.9 speed; friend lines have their own child-voice clips.
4. **Playback.** `src/lib/voice/speak.ts`: pre-recorded clip first, then Kokoro if downloaded, then the device voice; one line at a time; `stopSpeaking` on route change. Under 13 and skipped age only ever hear clips, Kokoro or the device voice (nothing leaves the device either way).
5. **Kokoro on device.** Copy `kokoro.ts` and `kokoro.worker.ts` from Rehearse, adapted (roles instead of personas). Keep `kokoro-js` out of the server bundle the same way WebLLM is.
6. **UI.** `HearButton` (Phosphor SpeakerHigh, 44px, aria-label "Hear it", pressed state while playing) beside: the step scene and ideas, Cobi's line and reply at step 4, rescue phrases and frames in the kit. The spoken text is always on screen (that is the caption) and is highlighted while it plays.
7. **Me, Voices section.** "Play lines automatically" (off), "Voice speed" (Slower, Normal), natural voice download with progress, size and a Remove button.
8. **Voice download pop-up.** Offered once, never on `/start`, steps, `/help`, `/privacy` or with Need a pause open; never while another pop-up had its turn this visit. Buttons: "Download (about 90 MB)" and "Not now". Warns on mobile data.
9. **Credits and docs.** About: "Voices: Kokoro (Apache 2.0) and OmniVoice by k2-fsa (CC BY-NC 4.0)." Update `design/art-manifest.md` style notes for audio in a new `design/voice-manifest.md`, HANDOFF and PRODUCT.

Checks per task: unit tests, typecheck, lint, build, e2e with axe; screenshots at 390 and 1440 in light and dark for UI changes.
