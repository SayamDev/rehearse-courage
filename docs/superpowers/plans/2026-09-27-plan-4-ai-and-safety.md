# Rehearse Courage, Plan 4: AI and safety pipeline

**Goal:** Cobi, the coach, answers what the person actually said at ladder step 4, and the sentence builder can tidy a messy sentence, for people aged 13 and over, using only free AI that does not keep or train on their words. Everything has a safe fallback, so the app never breaks and under-13s never touch generative AI or server speech to text.

**Architecture:** Three Route Handlers (`/api/coach`, `/api/tidy`, `/api/transcribe`) on the Cloudflare Worker. Each checks origin, age band, input size and a crisis check, takes a rate-limit token, then asks providers in order: Groq (`openai/gpt-oss-20b`, zero data retention), then Cloudflare Workers AI through the `AI` binding. Every reply passes the output check (local filter, then Llama Guard on Workers AI when budget allows). The server answers `{ reply: null }` when it cannot help; the client then tries the on-device model (WebLLM, only if the person downloaded it) and finally a pre-written reply. Pure logic lives in `src/lib/ai/*` and `src/lib/safety/*` with injected `fetch` and binding so it is unit tested without a network.

**Rules this plan must keep:** under 13 (or skipped age) never calls any `/api/*` route and the server rejects them anyway; no paid services, no cards, no analytics; no identifiers sent (no name, companion name, IP stored beyond a same-day hashed rate-limit key in memory); no content logged; never score or correct stutters, fillers or pauses; copy rules from `PRODUCT.md`.

## File map

| Path | Responsibility |
|---|---|
| `src/lib/safety/output.ts` | `cleanReply`, `checkOutputLocal`, `guardReply` (Llama Guard via binding), `checkReply` pipeline |
| `src/lib/ai/prompts.ts` | System prompts for coach and tidy, per age band; user prompt builders |
| `src/lib/ai/schemas.ts` | zod request bodies and model output shapes |
| `src/lib/ai/limits.ts` | Per-visitor daily tokens and site-wide daily caps (in memory, soft guard) |
| `src/lib/ai/guard.ts` | Request guards: same origin, age band allowed, hashed client key |
| `src/lib/ai/groq.ts` | Groq chat (JSON schema) and Whisper, injected fetch |
| `src/lib/ai/workers.ts` | Workers AI chat, Whisper and Llama Guard through the `AI` binding |
| `src/lib/ai/provider.ts` | Provider order and fallback, `coachReply`, `tidySentence`, `transcribeAudio` |
| `src/lib/ai/env.ts` | Reads the Cloudflare binding and secrets without failing in `next dev` or tests |
| `src/app/api/{coach,tidy,transcribe}/route.ts` | Thin handlers over the above |
| `src/lib/ai/client.ts` | Browser side: `askCoach`, `askTidy`, `transcribe`, all gated by age and settings |
| `src/lib/ai/device.ts` | Opt-in WebLLM on-device model: support check, download with progress, generate |
| `src/lib/content/coach-replies.ts` | Pre-written coach replies (per room, per age band) and tidy fallback text |
| `src/lib/state.ts` | Settings `onlineHelp` (default on, only used at 13+) and `deviceModel` |
| `src/lib/speak.ts` | `capture` option: keep audio in memory for one transcription, then drop it |
| `src/components/views/step-view.tsx` | Step 4: coach reply after the person speaks or types |
| `src/components/views/kit-tool-view.tsx` | Sentence builder: "Say it messy, then tidy" for 13+ |
| `src/components/views/me-view.tsx` | Online help switch, on-device model download and removal |
| `src/app/privacy/page.tsx`, `src/app/about/page.tsx` | What leaves the device, for 13+ only |
| `wrangler.jsonc` | `"ai": { "binding": "AI" }` (free plan: errors past the daily free allocation, never bills) |

## Tasks

### Task 1: Output safety and prompts (pure)

- `cleanReply(text)`: trims, collapses spaces, turns em and en dashes into commas, turns `!` into `.`, strips markdown (`*`, `_`, `#`, backticks) and wrapping quotes.
- `checkOutputLocal(text, kind, age)`: `{ ok: false, reason }` when empty, too long (coach teen 220 chars, adult 320; tidy 300), contains a URL, email or phone number, a crisis phrase (`checkCrisis`), a banned phrase ("calm down", "you've got this", "relax", "don't be nervous", "don't be shy", "stop stuttering", "fluent", "fluency", "filler", "um", "uh", "stutter", "stammer", "diagnos", "disorder", "medication", "therapy", "therapist", "you have anxiety", "you have adhd"), a request for personal details ("your name", "where do you live", "how old are you", "which school", "your address", "phone number", "send me", "photo"), or a small profanity list.
- Tidy only: fail when the tidy is more than 2x the input length plus 40 characters, or shares fewer than 40% of its words with the input (it must stay the person's own sentence).
- `guardReply(ai, userText, reply)`: Llama Guard 3 (`@cf/meta/llama-guard-3-8b`), returns `"safe" | "unsafe" | "unavailable"`, parsing both the object and the text answer shapes.
- `checkReply(...)`: local check first; then the guard if a binding and budget exist; unsafe means replace. Guard unavailable means the local result stands.
- Prompts: coach reply in the voice of the person in the scene (teacher, friend, audience), 1 or 2 short sentences, reacts to what they said, never grades, never mentions how they spoke, no questions about personal details, no advice about health. Teen: simple words, at most 25 words. Adult: at most 40 words. Tidy: one or two clear sentences in their own voice, keep meaning, add nothing, never comment on how it was said.
- Tests: every banned category, dash and `!` cleaning, tidy drift, guard answer shapes, pipeline order.

### Task 2: Server plumbing

- `limits.ts`: `takeToken(kind, key)` per visitor per day (coach 30, tidy 30, transcribe 60) and `takeSiteBudget(kind, amount)` (Groq chat 900, Groq transcribe 1,900, Groq audio seconds 27,000, Workers AI chat 40, guard 300, Workers AI whisper 40). Env overrides. Memory only; a new day resets.
- `guard.ts`: `sameOrigin(request)` (Origin host equals Host, or `sec-fetch-site: same-origin`), `allowedAge(body.age)` (only `teen` or `adult`), `clientKey(request)` = SHA-256 of `cf-connecting-ip` plus the date, hex, first 16 characters.
- `groq.ts`: `groqJson(system, user, schema, opts, deps)`, `groqTranscribe(audio, seconds, deps)` with `whisper-large-v3-turbo`, timeouts, `GroqLimitError` on 429. Request body sets `reasoning_effort: "low"`.
- `workers.ts`: `workersChat` (`@cf/meta/llama-3.1-8b-instruct`), `workersTranscribe` (`@cf/openai/whisper-large-v3-turbo`, base64 audio), `workersGuard`.
- `provider.ts`: `coachReply`, `tidySentence`, `transcribeAudio`: Groq, then Workers AI, each followed by `checkReply`; any failure moves on; the end result is `{ text, source }` or `null`.
- Tests with a fake fetch and a fake binding: order, fallback on 429 and errors, budgets respected, checks applied to both providers, no binding means Groq only.

### Task 3: API routes

- Each route: POST only, `Cache-Control: no-store`, rejects cross-site (403), bad body (400), under 13 or missing age (403, `{ error: "not-available" }`). Crisis in input returns `{ crisis: true }` without calling AI. Past the visitor's daily share returns `{ reply: null, reason: "limit" }`.
- `/api/coach` body: `{ age, situationId, room, prompt, answer }` (answer up to 600 characters). Response `{ reply: string | null, source?, crisis? }`.
- `/api/tidy` body: `{ age, text }` (up to 600). Response `{ tidy: string | null, source?, crisis? }`.
- `/api/transcribe` multipart: `audio` (at most 4 MB), `seconds` (at most 120), `age`. Response `{ text: string | null, crisis? }`. Whisper silence phrases ("thank you", "thanks for watching") become null.
- Tests call the exported handlers with `Request` objects and stubbed providers.

### Task 4: Client side and settings

- `Settings.onlineHelp` (default `true`, only matters at 13+) and `Settings.deviceModel` (default `false`: on-device model downloaded and chosen). `normalize` fills them for old saves. Test.
- `client.ts`: `canUseOnline(state)` = `aiAllowed(age) && settings.onlineHelp`. `askCoach`, `askTidy`, `transcribe` never fetch when that is false (unit tested with a fake fetch), time out after 12 s, and return `null` on any failure. Crisis check on the device before sending.
- `coach-replies.ts`: pre-written replies per room with kid and grown wording, picked by a stable hash so a person sees variety; tidy fallback message points to the sentence frames. Content checked by the same local filter in a test.
- `speak.ts`: `capture` option records audio in memory for one transcription even when recordings are not kept; `reset` and `dispose` drop it. Tests.

### Task 5: Step 4, Cobi answers

- After the person finishes speaking or typing at level 4, a "Cobi, your coach" reply appears in the card (`aria-live="polite"`), before Finish. Under 13 and offline: a pre-written reply, instantly. 13+ with online help: typed text, or the transcript of what they said, goes to `/api/coach`; while waiting, "Cobi is thinking" (no spinner animation under reduced motion); on `null`, the on-device model if chosen, else pre-written. A crisis match anywhere goes to `/help?crisis=1&from=...` (as today).
- A small line under the reply for 13+: "Replies come from an online AI. Your words are not saved." with a link to Privacy.
- "Try again" keeps working; Finish saves the step exactly as before (never includes the transcript).

### Task 6: Sentence builder tidy (13+)

- On `/kit/frames` for 13+ with online help or the device model: a first section "Say it messy, then tidy": type or speak (speak transcribes), "Tidy it" (secondary button), the tidy version shown in a paper box, then "Say the tidy version" with the speak button (seconds only). Under 13 sees the frames only (unchanged). Fallback copy when no tidy is possible: "Tidy is not available right now. Try one of the frames below."
- Crisis check on what they typed or said, before sending.

### Task 7: On-device model (opt-in)

- `@mlc-ai/web-llm`, imported only inside `device.ts` with `import()`. Model `Qwen2.5-0.5B-Instruct-q4f16_1-MLC` (about 400 MB). `deviceSupport()` checks WebGPU. Never downloads without a tap; on a metered or save-data connection the button says so first.
- Me, for 13+: "AI on this device" card: what it is, size, "Download (about 400 MB)" with progress (`role="progressbar"`), "Remove from this device" (clears the WebLLM caches). Unsupported browsers get a plain sentence, no button.
- `device.ts` replies pass `checkOutputLocal`; anything that fails becomes the pre-written reply.

### Task 8: Copy, privacy, e2e, handoff

- Privacy: new "AI, for 13 and over" section: what is sent (the words of that one answer, the situation, the age band), to whom (Groq, then Cloudflare), not kept, not used for training, no name or account; how to switch it off in Me; on-device option. About: one line on AI.
- E2E: teen journey with `/api/coach` mocked shows Cobi's reply; under-13 journey asserts no `/api/` request at all; tidy mocked; axe on the changed routes, light and dark, phone and laptop.
- `docs/HANDOFF.md`: Plan 4 status and maker actions (`npx wrangler secret put GROQ_API_KEY`, turn on Zero Data Retention in the Groq console, deploy).
