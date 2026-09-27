import { describe, expect, test } from "vitest";
import { FRAME_MS, rms, VOICE_THRESHOLD, voicedSeconds } from "./speak";

describe("voicedSeconds", () => {
  test("silence is zero", () => {
    expect(voicedSeconds(new Array(50).fill(0), 0.02, 100)).toBe(0);
    expect(voicedSeconds([], 0.02, 100)).toBe(0);
  });

  test("all voice counts every frame", () => {
    expect(voicedSeconds(new Array(30).fill(0.2), 0.02, 100)).toBe(3);
  });

  test("mixed frames count only those at or above the threshold", () => {
    const frames = [...new Array(20).fill(0.1), ...new Array(40).fill(0.001), ...new Array(20).fill(0.02)];
    expect(voicedSeconds(frames, 0.02, 100)).toBe(4);
  });

  test("rounds to whole seconds", () => {
    expect(voicedSeconds(new Array(14).fill(0.5), 0.02, 100)).toBe(1);
    expect(voicedSeconds(new Array(15).fill(0.5), 0.02, 100)).toBe(2);
  });

  test("defaults are sane: a quiet voice counts, near silence does not", () => {
    expect(voicedSeconds([0.03], VOICE_THRESHOLD, FRAME_MS * 10)).toBe(1);
    expect(voicedSeconds([0.005], VOICE_THRESHOLD, FRAME_MS * 10)).toBe(0);
  });
});

describe("rms", () => {
  test("of silence and a constant signal", () => {
    expect(rms([])).toBe(0);
    expect(rms([0, 0, 0])).toBe(0);
    expect(rms([0.5, -0.5, 0.5, -0.5])).toBeCloseTo(0.5);
  });
});
