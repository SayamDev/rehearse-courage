import type { MLCEngine } from "@mlc-ai/web-llm";

/**
 * The opt-in AI that runs on this device (WebLLM, a small Qwen model on the
 * graphics chip). Only for 13 and over, only after the person taps
 * Download in Me, and never downloaded on its own. Once downloaded,
 * nothing it does leaves the device. This file is only ever loaded with
 * `import()`, so people who do not use it never download its code.
 */

export const MODEL_F16 = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";
export const MODEL_F32 = "Qwen2.5-0.5B-Instruct-q4f32_1-MLC";
/** Rounded up, for the Download button. */
export const DOWNLOAD_MB = 300;
const GENERATE_TIMEOUT_MS = 25_000;

/** Half-precision models are smaller and faster, but not every graphics chip supports them. */
export function pickModel(hasF16: boolean): string {
  return hasF16 ? MODEL_F16 : MODEL_F32;
}

type Connection = { saveData?: boolean; type?: string; effectiveType?: string } | undefined;

/** Mobile data or data saver on: say so before downloading. */
export function isMetered(conn: Connection): boolean {
  return !!conn && (conn.saveData === true || conn.type === "cellular" || conn.effectiveType === "2g" || conn.effectiveType === "slow-2g");
}

export function meteredNow(): boolean {
  return isMetered((navigator as Navigator & { connection?: Connection }).connection);
}

type Gpu = { requestAdapter: () => Promise<{ features: { has: (f: string) => boolean } } | null> };

/** Which model this device can run, or null when it has no WebGPU. */
export async function supportedModel(): Promise<string | null> {
  const gpu = (navigator as Navigator & { gpu?: Gpu }).gpu;
  if (!gpu) return null;
  try {
    const adapter = await gpu.requestAdapter();
    return adapter ? pickModel(adapter.features.has("shader-f16")) : null;
  } catch {
    return null;
  }
}

let engine: Promise<MLCEngine> | null = null;

function load(model: string, onProgress?: (fraction: number) => void): Promise<MLCEngine> {
  if (!engine) {
    engine = import("@mlc-ai/web-llm")
      .then((w) => w.CreateMLCEngine(model, { initProgressCallback: (r) => onProgress?.(r.progress) }))
      .catch((err) => {
        engine = null;
        throw err;
      });
  }
  return engine;
}

/** True when the model is already saved on this device. */
export async function isDownloaded(): Promise<boolean> {
  const model = await supportedModel();
  if (!model) return false;
  try {
    const w = await import("@mlc-ai/web-llm");
    return await w.hasModelInCache(model);
  } catch {
    return false;
  }
}

/** Downloads (or loads) the model, reporting progress from 0 to 1. Only called from a button press. */
export async function downloadModel(onProgress: (fraction: number) => void): Promise<void> {
  const model = await supportedModel();
  if (!model) throw new Error("WebGPU is not available");
  await load(model, onProgress);
}

/** Frees the model and deletes every file it saved on this device. */
export async function removeModel(): Promise<void> {
  const current = engine;
  engine = null;
  await current?.then((e) => e.unload()).catch(() => {});
  const w = await import("@mlc-ai/web-llm");
  for (const model of [MODEL_F16, MODEL_F32]) await w.deleteModelAllInfoInCache(model).catch(() => {});
}

/** One short reply from the on-device model, or null. Never downloads: if the model is not saved, it does nothing. */
export async function deviceGenerate(system: string, user: string): Promise<string | null> {
  if (!(await isDownloaded())) return null;
  const model = await supportedModel();
  if (!model) return null;
  const run = async () => {
    const e = await load(model);
    const out = await e.chat.completions.create({
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 160,
      temperature: 0.5,
    });
    return out.choices[0]?.message?.content ?? null;
  };
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), GENERATE_TIMEOUT_MS));
  try {
    return await Promise.race([run(), timeout]);
  } catch {
    return null;
  }
}
