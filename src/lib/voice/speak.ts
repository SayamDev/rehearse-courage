"use client";

import { useSyncExternalStore } from "react";
import { checkKokoroCache, kokoroClip, kokoroState, loadKokoro } from "./kokoro";
import { clipId, deliveryRate, KIDS_RATE, spokenText, voiceFor, type Accent, type Delivery, type Role, type VoiceSet } from "./lines";

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
  "qwen:narrator-uk": "bf_isabella",
  "qwen:teacher-uk": "bf_emma",
  "qwen:host-uk": "bm_george",
  "qwen:friend-child-uk": "bf_lily",
  "qwen:friend-young-uk": "bf_alice",
  "qwen:classmate-child-uk": "bm_lewis",
  "qwen:classmate-young-uk": "bm_lewis",
  "qwen:narrator-us": "af_heart",
  "qwen:teacher-us": "af_bella",
  "qwen:host-us": "am_michael",
  "qwen:friend-child-us": "af_sky",
  "qwen:friend-young-us": "af_nicole",
  "qwen:classmate-child-us": "am_puck",
  "qwen:classmate-young-us": "am_adam",
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
export function lineKey(role: Role, set: VoiceSet, text: string, accent: Accent = "uk", delivery: Delivery = "neutral"): string {
  return `${role}|${set}|${accent}|${delivery}|${spokenText(text)}`;
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
let cancelPlayback: (() => void) | null = null;

function playUrl(url: string, rate: number, token: number, key: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (token !== run) return resolve(true);
    const current = new Audio(url);
    audio = current;
    let settled = false;
    const startup = setTimeout(() => finish(false), 8000);
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(startup);
      current.onplaying = current.onended = current.onerror = null;
      if (audio === current) audio = null;
      if (cancelPlayback === cancel) cancelPlayback = null;
      if (!ok) current.pause();
      resolve(ok);
    };
    const cancel = () => { current.pause(); finish(true); };
    cancelPlayback = cancel;
    current.preservesPitch = true;
    current.playbackRate = rate;
    current.onplaying = () => {
      clearTimeout(startup);
      if (token === run) setPlaying({ key, status: "speaking" });
    };
    current.onended = () => finish(true);
    current.onerror = () => finish(false);
    current.play().catch(() => finish(false));
  });
}

const ROBOTIC = /(compact|espeak|zarvox|trinoids|albert|bad news|bells|boing|bubbles|cellos|whisper|wobble|jester|organ|superstar)/i;
const NATURAL = /(natural|neural|premium|enhanced|siri|google)/i;

async function deviceSpeak(text: string, rate: number, token: number, key: string, accent: Accent): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (!window.speechSynthesis.getVoices().length) {
    await new Promise<void>((resolve) => {
      const done = () => { clearTimeout(timer); window.speechSynthesis.removeEventListener("voiceschanged", done); resolve(); };
      const timer = setTimeout(done, 400);
      window.speechSynthesis.addEventListener("voiceschanged", done);
    });
  }
  return new Promise((resolve) => {
    if (token !== run || typeof window === "undefined" || !("speechSynthesis" in window)) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis
      .getVoices()
      .filter((v) => v.lang.toLowerCase().startsWith("en") && !ROBOTIC.test(v.name))
      .sort(
        (a, b) =>
          // The chosen accent first, then voices on the device, then natural-sounding voices.
          Number(b.lang.toLowerCase().endsWith(accent === "uk" ? "gb" : "us")) - Number(a.lang.toLowerCase().endsWith(accent === "uk" ? "gb" : "us")) ||
          Number(b.localService) - Number(a.localService) ||
          Number(NATURAL.test(b.name)) - Number(NATURAL.test(a.name)),
      );
    if (voices[0]) u.voice = voices[0];
    u.lang = accent === "uk" ? "en-GB" : "en-US";
    u.rate = rate;
    u.onstart = () => token === run && setPlaying({ key, status: "speaking" });
    const finish = () => {
      if (cancelPlayback === finish) cancelPlayback = null;
      resolve();
    };
    cancelPlayback = finish;
    u.onend = finish;
    u.onerror = finish;
    window.speechSynthesis.speak(u);
  });
}

export type SpeakOptions = { role: Role; set: VoiceSet; text: string; slower?: boolean; accent?: Accent; delivery?: Delivery };

/** Reads one line aloud. Resolves when it has finished, or was interrupted. */
export async function speak({ role, set, text, slower = false, accent = "uk", delivery = "neutral" }: SpeakOptions): Promise<void> {
  stopSpeaking();
  const token = ++run;
  const key = lineKey(role, set, text, accent, delivery);
  const voice = voiceFor(role, set, accent, delivery);
  const rate = (set === "kids" ? KIDS_RATE : 1) * (slower ? 0.85 : 1) * deliveryRate(delivery);
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
      const name = voice.engine === "kokoro" ? voice.name : KOKORO_STAND_IN[voice.id] ?? KOKORO_STAND_IN[voiceFor(role, set, accent).id];
      const url = name ? await kokoroClip(spokenText(text), name, rate) : null;
      if (token !== run) {
        if (url) URL.revokeObjectURL(url);
        return;
      }
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

/** A disappearing card only stops its own line, never a newer card's voice. */
export function stopLine(key: string) {
  if (playing?.key === key) stopSpeaking();
}

export function stopSpeaking() {
  run++;
  cancelPlayback?.();
  cancelPlayback = null;
  audio?.pause();
  audio = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  setPlaying(null);
}
