"use client";

import type { ListenIn, ListenOut } from "./listen.worker";

/**
 * Optional on-device listening for people under 13: Whisper tiny turns what
 * they said at step 4 into text on this device, so Cobi can show what it
 * heard (and the words are checked for signs someone needs support), while
 * the voice never leaves the device. A one-time download of about 40 MB,
 * only after the person (or a grown-up) agrees in Me.
 */

export type ListenStatus = "idle" | "loading" | "ready" | "error";
export type ListenSnapshot = { status: ListenStatus; progress: number; cached: boolean | null };
export const LISTEN_SERVER_STATE: ListenSnapshot = { status: "idle", progress: 0, cached: null };

const EXPECTED_BYTES = 42_000_000;
let snapshot: ListenSnapshot = LISTEN_SERVER_STATE;
let worker: Worker | null = null;
let loading: Promise<void> | null = null;
let settle: { resolve: () => void; reject: (e: Error) => void } | null = null;
let nextId = 0;
const pending = new Map<number, (text: string | null) => void>();
const listeners = new Set<() => void>();

function set(patch: Partial<ListenSnapshot>) {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((l) => l());
}

export const listenState = () => snapshot;
export function onListenChange(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Whether the model was saved in this browser before (so loading needs no download). */
export async function checkListenCache(): Promise<boolean> {
  if (snapshot.cached !== null) return snapshot.cached;
  let cached = false;
  try {
    const keys = await (await caches.open("transformers-cache")).keys();
    cached = keys.some((r) => r.url.includes("whisper-tiny.en") && r.url.endsWith(".onnx"));
  } catch {
    cached = false;
  }
  set({ cached });
  return cached;
}

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("./listen.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (e: MessageEvent<ListenOut>) => {
    const msg = e.data;
    if (msg.type === "progress") set({ progress: Math.min(99, Math.round((msg.loaded / Math.max(msg.total, EXPECTED_BYTES)) * 100)) });
    else if (msg.type === "ready") {
      set({ status: "ready", progress: 100, cached: true });
      settle?.resolve();
    } else if (msg.type === "error") {
      loading = null;
      worker?.terminate();
      worker = null;
      set({ status: "error" });
      settle?.reject(new Error(msg.message));
    } else if (msg.type === "text") {
      pending.get(msg.id)?.(msg.text);
      pending.delete(msg.id);
    }
  };
  return worker;
}

const send = (msg: ListenIn, transfer: Transferable[] = []) => getWorker().postMessage(msg, transfer);

/** Downloads (first time) and loads the model. Safe to call again. */
export function loadListener(): Promise<void> {
  if (snapshot.status === "ready") return Promise.resolve();
  if (loading) return loading;
  set({ status: "loading", progress: 0 });
  loading = new Promise<void>((resolve, reject) => {
    settle = { resolve, reject };
  });
  send({ type: "load" });
  return loading;
}

/** Recording to 16 kHz mono samples, the shape Whisper expects. */
async function toSamples(blob: Blob): Promise<Float32Array> {
  const ctx = new AudioContext();
  try {
    const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
    const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * 16000), 16000);
    const src = offline.createBufferSource();
    src.buffer = decoded;
    src.connect(offline.destination);
    src.start();
    return (await offline.startRendering()).getChannelData(0);
  } finally {
    void ctx.close().catch(() => undefined);
  }
}

/** What was said, as text, on this device; null when it could not be worked out. */
export async function transcribeOnDevice(blob: Blob | null): Promise<string | null> {
  if (!blob || blob.size < 1000 || snapshot.status !== "ready") return null;
  const audio = await toSamples(blob).catch(() => null);
  if (!audio) return null;
  const id = ++nextId;
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      resolve(null);
    }, 30_000);
    pending.set(id, (text) => {
      clearTimeout(timer);
      resolve(text);
    });
    send({ type: "transcribe", id, audio }, [audio.buffer]);
  });
}

/** Removes the saved model files. */
export async function removeListener(): Promise<void> {
  worker?.terminate();
  worker = null;
  loading = null;
  try {
    const cache = await caches.open("transformers-cache");
    for (const req of await cache.keys()) if (req.url.includes("whisper-tiny.en")) await cache.delete(req);
  } catch {
    // Storage blocked: nothing was saved.
  }
  set({ status: "idle", progress: 0, cached: false });
}

/** What Whisper tends to "hear" in silence: treated as nothing heard. */
const SILENCE = /^[\s.[\](]*(blank_audio|silence|music|thank you\.?|you|bye\.?)?[\s.\])]*$/i;
export function heardSomething(text: string | null): boolean {
  return Boolean(text && !SILENCE.test(text));
}
