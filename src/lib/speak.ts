"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/** Analyser sampling interval. */
export const FRAME_MS = 100;
/** RMS level (0 to 1) counted as voice. Gentle on purpose: a whisper still counts. */
export const VOICE_THRESHOLD = 0.02;

/**
 * Whole seconds of voice in a run of per-frame levels: frames at or above
 * the threshold count, everything else is ignored. Only ever used to say
 * how long someone spoke, never how well.
 */
export function voicedSeconds(frames: number[], threshold: number, frameMs: number): number {
  let voiced = 0;
  for (const f of frames) if (f >= threshold) voiced++;
  return Math.round((voiced * frameMs) / 1000);
}

/** Root mean square of one frame of samples (-1 to 1). */
export function rms(samples: ArrayLike<number>): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / samples.length);
}

export type SpeakState = "idle" | "asking" | "listening" | "done" | "blocked";
/** `level` is the live loudness, 0 to 1, while listening (for the moving bars); absent otherwise. */
export type SpeakSnapshot = { state: SpeakState; seconds: number; recording: Blob | null; level?: number };

/** The platform pieces the controller needs, injectable so the lifecycle can be tested without a browser. */
export type SpeakDeps = {
  getUserMedia: (() => Promise<MediaStream>) | null;
  /** Opens an analyser on the stream and returns a way to read the current level and to close it. */
  openMeter: (stream: MediaStream) => Promise<{ level: () => number; close: () => void }>;
  /** Starts recording the stream; `done` receives the audio when stopped. Only called while recordings are kept. */
  record: ((stream: MediaStream, done: (b: Blob) => void) => { stop: () => void }) | null;
  every: (ms: number, fn: () => void) => () => void;
};

/**
 * Speaking on the device, as a plain controller (the React hook below
 * wraps it). Opens the microphone, counts seconds of voice from an
 * analyser, and releases everything on stop, reset or dispose, including
 * when any of those happen while the permission prompt is still open.
 * Nothing is uploaded; audio is only kept in memory when `record` is given.
 */
export function createSpeakController(deps: SpeakDeps) {
  let snap: SpeakSnapshot = { state: "idle", seconds: 0, recording: null };
  const listeners = new Set<() => void>();
  let frames: number[] = [];
  // Bumped by stop/reset/dispose so a start still waiting on the prompt knows it was cancelled.
  let run = 0;
  let release: (() => void) | null = null;
  // The keepRecordings setting, read when speaking starts (it can load after the first render).
  let keep = false;

  const set = (patch: Partial<SpeakSnapshot>) => {
    snap = { ...snap, ...patch };
    listeners.forEach((l) => l());
  };

  const releaseAll = () => {
    const r = release;
    release = null;
    r?.();
  };

  async function start() {
    if (snap.state === "asking" || snap.state === "listening") return;
    if (!deps.getUserMedia) {
      set({ state: "blocked" });
      return;
    }
    const mine = ++run;
    frames = [];
    set({ state: "asking", seconds: 0, recording: null });

    let stream: MediaStream;
    try {
      stream = await deps.getUserMedia();
    } catch {
      if (mine === run) set({ state: "blocked" });
      return;
    }
    const stopTracks = () => stream.getTracks().forEach((t) => t.stop());
    // Cancelled while the prompt was open: let go of the microphone straight away.
    if (mine !== run) {
      stopTracks();
      return;
    }

    let meter: Awaited<ReturnType<SpeakDeps["openMeter"]>>;
    try {
      meter = await deps.openMeter(stream);
    } catch {
      stopTracks();
      if (mine === run) set({ state: "blocked" });
      return;
    }
    if (mine !== run) {
      meter.close();
      stopTracks();
      return;
    }

    const recorder = keep && deps.record ? deps.record(stream, (b) => set({ recording: b })) : null;
    const cancelTick = deps.every(FRAME_MS, () => {
      const raw = meter.level();
      frames.push(raw);
      // 0 to 1 for the live bars: normal speech sits around 0.02 to 0.15 RMS.
      set({ seconds: voicedSeconds(frames, VOICE_THRESHOLD, FRAME_MS), level: Math.min(1, raw / 0.12) });
    });
    release = () => {
      cancelTick();
      recorder?.stop();
      meter.close();
      stopTracks();
    };
    set({ state: "listening" });
  }

  /** Stops listening. If still asking for permission, cancels and goes back to idle. */
  function stop() {
    run++;
    if (snap.state === "asking") {
      set({ state: "idle" });
      return;
    }
    if (snap.state !== "listening") return;
    releaseAll();
    set({ state: "done", seconds: voicedSeconds(frames, VOICE_THRESHOLD, FRAME_MS), level: 0 });
  }

  function reset() {
    run++;
    releaseAll();
    frames = [];
    set({ state: "idle", seconds: 0, recording: null });
  }

  function dispose() {
    run++;
    releaseAll();
  }

  return {
    start,
    stop,
    reset,
    dispose,
    setKeep: (k: boolean) => {
      keep = k;
    },
    get: () => snap,
    subscribe: (fn: () => void) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

/** The real browser pieces: getUserMedia, an AudioContext analyser, and MediaRecorder. */
function browserDeps(): SpeakDeps {
  const hasMic = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof AudioContext !== "undefined";
  return {
    getUserMedia: hasMic ? () => navigator.mediaDevices.getUserMedia({ audio: true }) : null,
    openMeter: async (stream) => {
      const ctx = new AudioContext();
      // Created after the permission prompt, so it can start suspended (Safari, iOS).
      await ctx.resume().catch(() => {});
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Float32Array(analyser.fftSize);
      return {
        level: () => {
          analyser.getFloatTimeDomainData(buf);
          return rms(buf);
        },
        close: () => void ctx.close().catch(() => {}),
      };
    },
    record:
      typeof MediaRecorder !== "undefined"
        ? (stream, done) => {
            const chunks: Blob[] = [];
            const rec = new MediaRecorder(stream);
            rec.ondataavailable = (e) => chunks.push(e.data);
            rec.onstop = () => done(new Blob(chunks, { type: rec.mimeType }));
            rec.start();
            return { stop: () => rec.state !== "inactive" && rec.stop() };
          }
        : null,
    every: (ms, fn) => {
      const t = window.setInterval(fn, ms);
      return () => window.clearInterval(t);
    },
  };
}

/** The recording arrives just after the microphone stops (MediaRecorder finishes async); wait up to two seconds for it. */
export async function waitForRecording(latest: () => { recording: Blob | null }, tries = 20, ms = 100): Promise<Blob | null> {
  for (let i = 0; i < tries; i++) {
    const r = latest().recording;
    if (r) return r;
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
  return null;
}

const IDLE: SpeakSnapshot = { state: "idle", seconds: 0, recording: null };

/**
 * Speaking on the device for a component. `keep` (the keepRecordings
 * setting, Then vs Now in Plan 5) also collects the audio in memory as
 * `recording`; so does `capture`, used for one transcription at 13 and
 * over. Either way it only lives in memory until reset or the component
 * goes away, and the microphone is always released then too.
 */
export function useSpeak({ keep = false, capture = false }: { keep?: boolean; capture?: boolean } = {}) {
  const [ctrl] = useState(() => createSpeakController(browserDeps()));
  useEffect(() => ctrl.setKeep(keep || capture), [ctrl, keep, capture]);
  const snap = useSyncExternalStore(ctrl.subscribe, ctrl.get, () => IDLE);
  useEffect(() => () => ctrl.dispose(), [ctrl]);
  return { ...snap, start: ctrl.start, stop: ctrl.stop, reset: ctrl.reset, latest: ctrl.get };
}
