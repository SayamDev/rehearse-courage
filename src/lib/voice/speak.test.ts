import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { clipId, deliveryRate, KIDS_RATE, voiceFor } from "./lines";

vi.mock("./kokoro", () => ({
  checkKokoroCache: vi.fn(async () => false),
  kokoroState: () => ({ status: "idle" }),
  loadKokoro: vi.fn(),
  kokoroClip: vi.fn(),
}));

class FakeAudio {
  static made: FakeAudio[] = [];
  preservesPitch = false;
  playbackRate = 1;
  onplaying: (() => void) | null = null;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  pause = vi.fn();
  play = vi.fn(async () => { this.onplaying?.(); });
  constructor(public src: string) { FakeAudio.made.push(this); }
}
const voices = [
  { lang: "en-US", name: "American enhanced", localService: true },
  { lang: "en-GB", name: "British enhanced", localService: true },
];
class Utterance {
  voice?: typeof voices[number];
  lang = "";
  rate = 1;
  onstart?: () => void;
  onend?: () => void;
  onerror?: () => void;
  constructor(public text: string) {}
}
const synth = {
  getVoices: vi.fn(() => voices),
  speak: vi.fn((u: Utterance) => { u.onstart?.(); u.onend?.(); }),
  cancel: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  FakeAudio.made = [];
  synth.getVoices.mockReturnValue(voices);
  vi.stubGlobal("Audio", FakeAudio);
  vi.stubGlobal("SpeechSynthesisUtterance", Utterance);
  vi.stubGlobal("window", { speechSynthesis: synth });
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ ids: [] }) })));
});
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

for (const accent of ["uk", "us"] as const) {
  test(`${accent} calm playback uses its recording and keeps the slower setting`, async () => {
    const { speak } = await import("./speak");
    const text = "Breathe in slowly.";
    const id = clipId(voiceFor("narrator", "kids", accent, "calm"), text);
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ ids: [id] }) } as Response);
    const done = speak({ role: "narrator", set: "kids", accent, delivery: "calm", text, slower: true });
    await vi.waitFor(() => expect(FakeAudio.made).toHaveLength(1));
    const a = FakeAudio.made[0];
    expect(a.src).toBe(`/voice/${id}.m4a`);
    expect(a.playbackRate).toBeCloseTo(KIDS_RATE * 0.85 * deliveryRate("calm"));
    expect(a.preservesPitch).toBe(true);
    a.onended?.();
    await done;
  });

  test(`${accent} fallback sets language even when no device voices have loaded`, async () => {
    vi.useFakeTimers();
    synth.getVoices.mockReturnValue([]);
    const { speak } = await import("./speak");
    const done = speak({ role: "narrator", set: "grown", accent, delivery: "calm", text: "And breathe out." });
    await vi.advanceTimersByTimeAsync(450);
    await done;
    const u = synth.speak.mock.calls[0][0];
    expect(u.lang).toBe(accent === "uk" ? "en-GB" : "en-US");
    expect(u.rate).toBe(deliveryRate("calm"));
  });
}

test("interrupting a recording resolves it, so a cancelled introduction cannot hang", async () => {
  const { speak, stopSpeaking } = await import("./speak");
  const id = clipId(voiceFor("narrator", "grown", "uk", "calm"), "Introduction");
  vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ ids: [id] }) } as Response);
  const done = speak({ role: "narrator", set: "grown", delivery: "calm", text: "Introduction" });
  await vi.waitFor(() => expect(FakeAudio.made).toHaveLength(1));
  stopSpeaking();
  await done;
  expect(FakeAudio.made[0].pause).toHaveBeenCalled();
  expect(synth.speak).not.toHaveBeenCalled();
});

test("a disappearing card cannot stop a different card's new prompt", async () => {
  const { speak, stopLine, lineKey } = await import("./speak");
  const id = clipId(voiceFor("narrator", "grown", "us", "game"), "New question");
  vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ ids: [id] }) } as Response);
  const done = speak({ role: "narrator", set: "grown", accent: "us", delivery: "game", text: "New question" });
  await vi.waitFor(() => expect(FakeAudio.made).toHaveLength(1));
  stopLine(lineKey("narrator", "grown", "Old question", "us", "game"));
  expect(FakeAudio.made[0].pause).not.toHaveBeenCalled();
  stopLine(lineKey("narrator", "grown", "New question", "us", "game"));
  await done;
  expect(FakeAudio.made[0].pause).toHaveBeenCalled();
});

describe("device fallback", () => {
  test("prefers the selected accent and recovers from a broken recording", async () => {
    const { speak } = await import("./speak");
    const id = clipId(voiceFor("narrator", "grown", "uk", "game"), "Question");
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ ids: [id] }) } as Response);
    const done = speak({ role: "narrator", set: "grown", accent: "uk", delivery: "game", text: "Question" });
    await vi.waitFor(() => expect(FakeAudio.made).toHaveLength(1));
    FakeAudio.made[0].onerror?.();
    await done;
    expect(synth.speak.mock.calls[0][0].voice?.lang).toBe("en-GB");
  });
});
