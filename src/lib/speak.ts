"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

type Session = {
  stream: MediaStream;
  ctx: AudioContext;
  timer: number;
  recorder: MediaRecorder | null;
  chunks: Blob[];
};

/**
 * Speaking on the device. Opens the microphone, counts seconds of voice
 * with an AudioContext analyser, and throws the audio away: nothing is
 * uploaded or stored. When `keep` is true (the keepRecordings setting, for
 * Then vs Now in Plan 5) a MediaRecorder also collects the audio into
 * `recording`, still only in memory.
 *
 * "blocked" covers a denied permission, no microphone, and browsers
 * without getUserMedia, so the caller can offer typing instead.
 */
export function useSpeak({ keep = false }: { keep?: boolean } = {}) {
  const [state, setState] = useState<SpeakState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [recording, setRecording] = useState<Blob | null>(null);
  const session = useRef<Session | null>(null);
  const frames = useRef<number[]>([]);
  // Guards against stop() arriving while getUserMedia is still asking.
  const wanted = useRef(false);

  const teardown = useCallback(() => {
    const s = session.current;
    session.current = null;
    if (!s) return;
    window.clearInterval(s.timer);
    if (s.recorder && s.recorder.state !== "inactive") s.recorder.stop();
    s.stream.getTracks().forEach((t) => t.stop());
    void s.ctx.close().catch(() => {});
  }, []);

  const start = useCallback(async () => {
    if (session.current || wanted.current) return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof AudioContext === "undefined") {
      setState("blocked");
      return;
    }
    wanted.current = true;
    frames.current = [];
    setSeconds(0);
    setRecording(null);
    setState("asking");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      wanted.current = false;
      setState("blocked");
      return;
    }
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const buf = new Float32Array(analyser.fftSize);
    const timer = window.setInterval(() => {
      analyser.getFloatTimeDomainData(buf);
      frames.current.push(rms(buf));
      setSeconds(voicedSeconds(frames.current, VOICE_THRESHOLD, FRAME_MS));
    }, FRAME_MS);

    let recorder: MediaRecorder | null = null;
    const chunks: Blob[] = [];
    if (keep && typeof MediaRecorder !== "undefined") {
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => setRecording(new Blob(chunks, { type: recorder?.mimeType }));
      recorder.start();
    }
    session.current = { stream, ctx, timer, recorder, chunks };

    if (!wanted.current) {
      // stop() was called while the permission prompt was open.
      teardown();
      setState("done");
      return;
    }
    setState("listening");
  }, [keep, teardown]);

  const stop = useCallback(() => {
    wanted.current = false;
    if (!session.current) return;
    teardown();
    setSeconds(voicedSeconds(frames.current, VOICE_THRESHOLD, FRAME_MS));
    setState("done");
  }, [teardown]);

  const reset = useCallback(() => {
    wanted.current = false;
    teardown();
    frames.current = [];
    setSeconds(0);
    setRecording(null);
    setState("idle");
  }, [teardown]);

  // Always release the microphone when the component goes away.
  useEffect(() => teardown, [teardown]);

  return { state, seconds, recording, start, stop, reset };
}
