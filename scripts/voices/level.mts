import { readFileSync, writeFileSync } from "node:fs";
import type { Delivery } from "../../src/lib/voice/lines";

/** Attenuate locally generated WAVs before AAC encoding. Leave headroom for codec peaks. */
export function levelWav(path: string, delivery: Delivery) {
  const wav = readFileSync(path);
  if (wav.toString("ascii", 0, 4) !== "RIFF" || wav.toString("ascii", 8, 12) !== "WAVE") throw new Error("Expected a WAV recording");
  let format = 0, bits = 0, offset = 0, length = 0;
  for (let at = 12; at + 8 <= wav.length;) {
    const size = wav.readUInt32LE(at + 4);
    const chunk = wav.toString("ascii", at, at + 4);
    if (chunk === "fmt ") { format = wav.readUInt16LE(at + 8); bits = wav.readUInt16LE(at + 22); }
    if (chunk === "data") { offset = at + 8; length = Math.min(size, wav.length - offset); }
    at += 8 + size + (size % 2);
  }
  if (!offset || !length || !((format === 3 && bits === 32) || (format === 1 && bits === 16))) throw new Error("Unsupported or empty recording");
  const bytes = bits / 8;
  const read = (at: number) => format === 3 ? wav.readFloatLE(at) : wav.readInt16LE(at) / 32768;
  let peak = 0, squared = 0, active = 0;
  for (let at = offset; at < offset + length; at += bytes) {
    const sample = read(at);
    if (!Number.isFinite(sample)) throw new Error("Invalid audio sample");
    peak = Math.max(peak, Math.abs(sample));
    if (Math.abs(sample) > 0.01) { squared += sample * sample; active++; }
  }
  if (!active || peak < 0.01) throw new Error("Silent recording");
  const target = delivery === "calm" ? -20 : -18;
  const gain = Math.min(1, 0.8 / peak, 10 ** (target / 20) / Math.sqrt(squared / active));
  for (let at = offset; at < offset + length; at += bytes) {
    const sample = read(at) * gain;
    if (format === 3) wav.writeFloatLE(sample, at);
    else wav.writeInt16LE(Math.round(sample * 32768), at);
  }
  writeFileSync(path, wav);
}
