"use client";

import { useSyncExternalStore } from "react";
import { checkKokoroCache, kokoroClip, kokoroState, loadKokoro } from "./kokoro";
import { clipId, KIDS_RATE, spokenText, voiceFor, type Accent, type Role, type VoiceSet } from "./lines";

/**
 * Reads a line aloud, best first:
 * 1. A pre-recorded clip (public/voice), for every fixed line in lines.ts.
 * 2. Kokoro on this device, once the person has downloaded it (live coach
 *    replies, their own steps).
 * 3. The device's own voice (speechSynthesis), always there.
 * Nothing is sent anywhere by any of these. One line plays at a time; a new
 * line, or stopSpeaking, interrupts the last.
 */

/** The closest Kokoro voice to each recorded voice, for lines without a clip (live replies, your own steps). */
const KOKORO_STAND_IN: Record<string, string> = {
  "omni:narrator-uk": "bf_isabella",
  "omni:teacher-uk": "bf_emma",
  "omni:host-uk": "bm_george",
  "omni:friend-child": "bf_lily",
  "omni:friend-young": "bf_alice",
  "omni:classmate-child": "bm_lewis",
  "omni:classmate-young": "bm_lewis",
  "omni:narrator-us": "af_heart",
  "omni:teacher-us": "af_bella",
  "omni:host-us": "am_michael",
  "omni:friend-child-us": "af_sky",
  "omni:friend-young-us": "af_nicole",
  "omni:classmate-child-us": "am_puck",
  "omni:classmate-young-us": "am_adam",
};

/* ---------- What is playing, so the matching button can show it ---------- */

export type Playing = { key: string; status: "preparing" | "speaking" } | null;
let playing: Playing = null;
const listeners = new Set<() => void>();

function setPlaying(next: Playing) {
  playing = next;
  listeners.forEach((l) => l());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function usePlaying(): Playing {
  return useSyncExternalStore(subscribe, () => playing, () => null);
}

/** Identifies a line for its Hear it button, whatever engine ends up reading it. */
export function lineKey(role: Role, set: VoiceSet, text: string, accent: Accent = "uk"): string {
  return `${role}|${set}|${accent}|${spokenText(text)}`;
}

/* ---------- Pre-recorded clips ---------- */

let manifest: Promise<Set<string>> | null = null;

function recorded(): Promise<Set<string>> {
  manifest ??= fetch("/voice/manifest.json")
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<{ ids: string[] }>;
    })
    .then((m) => new Set(m.ids))
    .catch(() => {
      // Offline or missing: the device voice reads this line, and the next line asks again.
      manifest = null;
      return new Set<string>();
    });
  return manifest;
}

/* ---------- Playback ---------- */

let run = 0;
let audio: HTMLAudioElement | null = null;

function playUrl(url: string, rate: number, token: number, key: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (token !== run) return resolve(true);
    audio = new Audio(url);
    audio.preservesPitch = true;
    audio.playbackRate = rate;
    audio.onplaying = () => token === run && setPlaying({ key, status: "speaking" });
    audio.onended = () => resolve(true);
    audio.onerror = () => resolve(false);
    audio.play().catch(() => resolve(false));
  });
}

const ROBOTIC = /(compact|espeak|zarvox|trinoids|albert|bad news|bells|boing|bubbles|cellos|whisper|wobble|jester|organ|superstar)/i;
const NATURAL = /(natural|neural|premium|enhanced|siri|google)/i;

function deviceSpeak(text: string, rate: number, token: number, key: string, accent: Accent): Promise<void> {
  return new Promise((resolve) => {
    if (token !== run || typeof window === "undefined" || !("speechSynthesis" in window)) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis
      .getVoices()
      .filter((v) => v.lang.toLowerCase().startsWith("en") && !ROBOTIC.test(v.name))
      .sort(
        (a, b) =>
          // The chosen accent first (en-GB or en-US), then natural-sounding voices, then ones on the device.
          Number(b.lang.toLowerCase().endsWith(accent === "uk" ? "gb" : "us")) - Number(a.lang.toLowerCase().endsWith(accent === "uk" ? "gb" : "us")) ||
          Number(NATURAL.test(b.name)) - Number(NATURAL.test(a.name)) ||
          Number(b.localService) - Number(a.localService),
      );
    if (voices[0]) u.voice = voices[0];
    u.rate = rate;
    u.onstart = () => token === run && setPlaying({ key, status: "speaking" });
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

export type SpeakOptions = { role: Role; set: VoiceSet; text: string; slower?: boolean; accent?: Accent };

/** Reads one line aloud. Resolves when it has finished, or was interrupted. */
export async function speak({ role, set, text, slower = false, accent = "uk" }: SpeakOptions): Promise<void> {
  stopSpeaking();
  const token = ++run;
  const key = lineKey(role, set, text, accent);
  const voice = voiceFor(role, set, accent);
  const rate = (set === "kids" ? KIDS_RATE : 1) * (slower ? 0.85 : 1);
  setPlaying({ key, status: "preparing" });
  // Saved on this device earlier: wake it (no download) so later lines can use it.
  void checkKokoroCache().then((saved) => {
    if (saved && kokoroState().status === "idle") loadKokoro().catch(() => null);
  });
  try {
    const id = clipId(voice, text);
    if ((await recorded()).has(id) && (await playUrl(`/voice/${id}.m4a`, rate, token, key))) return;
    if (token !== run) return;
    if (kokoroState().status === "ready") {
      const name = voice.engine === "kokoro" ? voice.name : KOKORO_STAND_IN[voice.id];
      const url = name ? await kokoroClip(spokenText(text), name, rate) : null;
      if (token !== run) return;
      if (url) {
        const ok = await playUrl(url, 1, token, key);
        URL.revokeObjectURL(url);
        if (ok) return;
      }
    }
    await deviceSpeak(spokenText(text), rate, token, key, accent);
  } finally {
    if (token === run) setPlaying(null);
  }
}

export function stopSpeaking() {
  run++;
  audio?.pause();
  audio = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  setPlaying(null);
}
