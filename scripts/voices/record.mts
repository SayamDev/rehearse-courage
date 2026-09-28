// Records every fixed line in src/lib/voice/lines.ts as a small audio clip in
// public/voice/, and writes public/voice/manifest.json (the clips that exist).
//
// Maker-only, free, runs on this Mac:
//   - Kokoro lines use kokoro-js in Node (downloads the model once, about 90 MB).
//   - Friend lines use VoiceStudio's OmniVoice. Start the VoiceStudio app first
//     (its API listens on http://localhost:3900). Each friend voice is designed
//     once from a short description, saved in design/voice-refs/, and every
//     line is then spoken in that same voice so the character stays consistent.
//
// Clips that already exist are skipped, so re-running only records new or
// changed lines. Run: npm run voices:record
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { allLines, type Line, type Voice } from "../../src/lib/voice/lines";

const ROOT = join(import.meta.dirname, "../..");
const OUT = join(ROOT, "public/voice");
const REFS = join(ROOT, "design/voice-refs");
const TMP = join(ROOT, ".voice-tmp");
const STUDIO = process.env.VOICESTUDIO_URL ?? "http://localhost:3900";

/** Words for designing each friend voice once; every line is then read in that voice. */
const REF_TEXT = "Hi, it is nice to see you. I was just telling everyone about my weekend.";

mkdirSync(OUT, { recursive: true });
mkdirSync(REFS, { recursive: true });
mkdirSync(TMP, { recursive: true });

/** WAV to a small mono AAC file every browser plays (afconvert ships with macOS). */
function encode(wav: string, out: string) {
  execFileSync("afconvert", ["-f", "m4af", "-d", "aac", "-b", "40000", "-c", "1", wav, out]);
}

type Kokoro = { generate: (text: string, o: { voice: string; speed?: number }) => Promise<{ save: (p: string) => Promise<void> }> };
let kokoro: Kokoro | null = null;

async function kokoroWav(voice: Voice, text: string, wav: string) {
  if (!kokoro) {
    const { KokoroTTS } = await import("kokoro-js");
    kokoro = (await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" })) as unknown as Kokoro;
  }
  const audio = await kokoro.generate(text, { voice: voice.name });
  await audio.save(wav);
}

async function studio(form: FormData): Promise<Buffer> {
  const res = await fetch(`${STUDIO}/generate`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`VoiceStudio ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return Buffer.from(await res.arrayBuffer());
}

/** The friend's reference clip: designed once from its description, then reused so every line sounds like the same person. */
async function referenceFor(voice: Voice): Promise<string> {
  const ref = join(REFS, `${voice.name}.wav`);
  if (existsSync(ref)) return ref;
  const form = new FormData();
  form.set("text", REF_TEXT);
  form.set("language", "en");
  form.set("instruct", voice.instruct ?? "");
  if (voice.seed !== undefined) form.set("seed", String(voice.seed));
  writeFileSync(ref, await studio(form));
  console.log(`  designed ${voice.name} (design/voice-refs/${voice.name}.wav)`);
  return ref;
}

async function omniWav(voice: Voice, text: string, wav: string) {
  const ref = await referenceFor(voice);
  const form = new FormData();
  form.set("text", text);
  form.set("language", "en");
  form.set("ref_audio", new Blob([readFileSync(ref)], { type: "audio/wav" }), "ref.wav");
  form.set("ref_text", REF_TEXT);
  if (voice.seed !== undefined) form.set("seed", String(voice.seed));
  writeFileSync(wav, await studio(form));
}

async function record(line: Line) {
  const out = join(OUT, `${line.id}.m4a`);
  if (existsSync(out)) return false;
  const wav = join(TMP, `${line.id}.wav`);
  if (line.voice.engine === "kokoro") await kokoroWav(line.voice, line.text, wav);
  else await omniWav(line.voice, line.text, wav);
  encode(wav, out);
  return true;
}

const lines = allLines();
let made = 0;
const failed: string[] = [];
for (const [i, line] of lines.entries()) {
  try {
    if (await record(line)) {
      made++;
      console.log(`${i + 1}/${lines.length} ${line.voice.id}: ${line.text}`);
    }
  } catch (err) {
    failed.push(`${line.voice.id}: ${line.text} (${String(err).slice(0, 160)})`);
  }
}

// The manifest lists only clips that exist, so the app never asks for a missing file.
const wanted = new Set(lines.map((l) => l.id));
const have = readdirSync(OUT)
  .filter((f) => f.endsWith(".m4a"))
  .map((f) => f.slice(0, -4));
for (const id of have) if (!wanted.has(id)) rmSync(join(OUT, `${id}.m4a`));
const ids = have.filter((id) => wanted.has(id)).sort();
writeFileSync(join(OUT, "manifest.json"), `${JSON.stringify({ ids })}\n`);
rmSync(TMP, { recursive: true, force: true });

console.log(`\nRecorded ${made} new clip(s). ${ids.length} of ${lines.length} lines have a clip.`);
if (failed.length) {
  console.log(`\n${failed.length} line(s) not recorded:`);
  for (const f of failed) console.log(`  ${f}`);
  process.exitCode = 1;
}
