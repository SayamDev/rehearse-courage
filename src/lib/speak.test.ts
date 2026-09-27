import { describe, expect, test } from "vitest";
import { createSpeakController, FRAME_MS, rms, VOICE_THRESHOLD, voicedSeconds, type SpeakDeps } from "./speak";

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

describe("createSpeakController", () => {
  /** A fake microphone whose permission prompt resolves only when the test says so. */
  function fakes({ deny = false } = {}) {
    const tracks = { stopped: 0 };
    const stream = { getTracks: () => [{ stop: () => tracks.stopped++ }] } as unknown as MediaStream;
    let answer: (() => void) | null = null;
    const meters = { open: 0, closed: 0 };
    let tick: (() => void) | null = null;
    let level = 0.5;
    const deps: SpeakDeps = {
      getUserMedia: () =>
        new Promise<MediaStream>((resolve, reject) => {
          answer = () => (deny ? reject(new Error("denied")) : resolve(stream));
        }),
      openMeter: async () => {
        meters.open++;
        return { level: () => level, close: () => void meters.closed++ };
      },
      record: null,
      every: (_ms, fn) => {
        tick = fn;
        return () => {
          tick = null;
        };
      },
    };
    const flush = () => new Promise((r) => setTimeout(r, 0));
    return {
      deps,
      tracks,
      meters,
      allow: async () => {
        answer?.();
        await flush();
        await flush();
      },
      tick: (n: number, l = 0.5) => {
        level = l;
        for (let i = 0; i < n; i++) tick?.();
      },
      ticking: () => tick !== null,
    };
  }

  test("counts voice while listening and releases everything on stop", async () => {
    const f = fakes();
    const c = createSpeakController(f.deps);
    void c.start();
    expect(c.get().state).toBe("asking");
    await f.allow();
    expect(c.get().state).toBe("listening");
    f.tick(20);
    f.tick(10, 0);
    c.stop();
    expect(c.get()).toMatchObject({ state: "done", seconds: 2 });
    expect(f.tracks.stopped).toBe(1);
    expect(f.meters.closed).toBe(1);
    expect(f.ticking()).toBe(false);
  });

  test("stop while the permission prompt is open cancels and frees the microphone once granted", async () => {
    const f = fakes();
    const c = createSpeakController(f.deps);
    void c.start();
    c.stop();
    expect(c.get().state).toBe("idle");
    await f.allow();
    expect(c.get().state).toBe("idle");
    expect(f.tracks.stopped).toBe(1);
    expect(f.meters.open).toBe(0);
  });

  test("dispose while the prompt is open (page closed) never leaves the microphone on", async () => {
    const f = fakes();
    const c = createSpeakController(f.deps);
    void c.start();
    c.dispose();
    await f.allow();
    expect(f.tracks.stopped).toBe(1);
    expect(f.meters.open).toBe(0);
    expect(f.ticking()).toBe(false);
  });

  test("a second start while asking or listening is ignored", async () => {
    const f = fakes();
    const c = createSpeakController(f.deps);
    void c.start();
    void c.start();
    await f.allow();
    void c.start();
    expect(f.meters.open).toBe(1);
    c.stop();
  });

  test("reset while listening releases the microphone and goes back to idle", async () => {
    const f = fakes();
    const c = createSpeakController(f.deps);
    void c.start();
    await f.allow();
    f.tick(5);
    c.reset();
    expect(c.get()).toMatchObject({ state: "idle", seconds: 0 });
    expect(f.tracks.stopped).toBe(1);
    expect(f.meters.closed).toBe(1);
  });

  test("a denied permission or no microphone is blocked", async () => {
    const f = fakes({ deny: true });
    const c = createSpeakController(f.deps);
    void c.start();
    await f.allow();
    expect(c.get().state).toBe("blocked");
    const none = createSpeakController({ ...f.deps, getUserMedia: null });
    await none.start();
    expect(none.get().state).toBe("blocked");
  });
});

describe("createSpeakController recordings", () => {
  test("records only while recordings are kept", async () => {
    let recorded = 0;
    const stream = { getTracks: () => [{ stop: () => {} }] } as unknown as MediaStream;
    const deps: SpeakDeps = {
      getUserMedia: async () => stream,
      openMeter: async () => ({ level: () => 0, close: () => {} }),
      record: (_s, done) => {
        recorded++;
        return { stop: () => done(new Blob(["a"])) };
      },
      every: () => () => {},
    };
    const c = createSpeakController(deps);
    await c.start();
    c.stop();
    expect(recorded).toBe(0);
    expect(c.get().recording).toBeNull();
    c.setKeep(true);
    await c.start();
    c.stop();
    expect(recorded).toBe(1);
    expect(c.get().recording).not.toBeNull();
  });
});
