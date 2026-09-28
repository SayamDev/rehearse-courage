"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { DownloadSimple, Trash } from "@phosphor-icons/react";
import { updateSettings, type Settings } from "@/lib/state";
import { act, useCourage } from "@/lib/store";
import {
  checkKokoroCache,
  KOKORO_SERVER_STATE,
  kokoroState,
  kokoroSupported,
  loadKokoro,
  onKokoroChange,
  onMeteredConnection,
  removeKokoro,
  voiceProgressText,
} from "@/lib/voice/kokoro";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function useKokoro() {
  return useSyncExternalStore(onKokoroChange, kokoroState, () => KOKORO_SERVER_STATE);
}

/** Seconds since the download started, ticking while it runs (for "time left"). */
function useElapsed(startedAt: number, running: boolean) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [running]);
  return running && now ? Math.max(0, (now - startedAt) / 1000) : 0;
}

/**
 * The natural voice (Kokoro on this device): download on a tap, with its
 * size and a warning on mobile data, progress while it downloads, and a
 * Remove button. Shared by Me and the voice pop-up.
 */
export function NaturalVoice({ onDone }: { onDone?: () => void }) {
  const state = useKokoro();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [metered, setMetered] = useState(false);
  const [message, setMessage] = useState("");
  const progressRef = useRef<HTMLParagraphElement>(null);
  const loading = state.status === "loading";
  const elapsed = useElapsed(state.startedAt, loading);

  useEffect(() => {
    // Detection needs the browser, so it runs once after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(kokoroSupported());
    setMetered(onMeteredConnection());
    void checkKokoroCache();
  }, []);

  useEffect(() => {
    if (loading) progressRef.current?.focus();
  }, [loading]);

  if (supported === null) return null;
  if (!supported) {
    return <p className="mt-2 text-muted">This device is too small for the natural voice. Lines are read by recorded voices and the device&apos;s own voice.</p>;
  }

  const download = async () => {
    setMessage("");
    try {
      await loadKokoro();
      setMessage("Saved on this device. Lines without a recording now use the natural voice.");
      onDone?.();
    } catch {
      setMessage("The download did not finish. You can try again.");
    }
  };

  const remove = async () => {
    await removeKokoro();
    setMessage("Removed from this device.");
  };

  if (loading) {
    const text = voiceProgressText(state, elapsed, "the natural voice");
    return (
      <div className="mt-3">
        <p id="voice-progress-label" ref={progressRef} tabIndex={-1} className="text-ink outline-none">
          {text.label} You can keep using the app.
        </p>
        <div
          role="progressbar"
          aria-labelledby="voice-progress-label"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={text.known ? state.progress : undefined}
          className="mt-2 h-3 overflow-hidden rounded-full bg-surface-2"
        >
          <div className="h-full rounded-full bg-chrome transition-[width] duration-[var(--dur-ui)]" style={{ width: `${text.known ? state.progress : 8}%` }} />
        </div>
        {text.detail ? (
          <p className="tabular mt-1 text-muted" aria-hidden>
            {text.detail}
          </p>
        ) : null}
      </div>
    );
  }

  const saved = state.cached === true || state.status === "ready";
  return (
    <>
      {saved ? (
        <Button variant="secondary" icon={Trash} className="mt-3" onClick={remove}>
          Remove from this device
        </Button>
      ) : (
        <>
          {metered ? <p className="mt-2 text-ink">You seem to be on mobile data. This is a big download, so Wi-Fi is better.</p> : null}
          <Button variant="secondary" icon={DownloadSimple} className="mt-3" onClick={download}>
            Download (about 90 MB)
          </Button>
        </>
      )}
      <p role="status" className="mt-2 min-h-[1.55em] text-ink">
        {message || (state.status === "error" ? "The download did not finish. You can try again." : "")}
      </p>
    </>
  );
}

/** Voices in Me: auto-play (off by default), a slower pace, and the optional natural voice. */
export function VoiceSettings() {
  const store = useCourage();
  const set = (patch: Partial<Settings>) => act((s) => updateSettings(s, patch));
  return (
    <>
      <p className="mt-2 text-ink">Tap Hear it beside a line to hear it read aloud. Every line is also written on screen.</p>
      <div className="mt-3 divide-y divide-line">
        <Switch checked={store.settings.autoPlay} onChange={(v) => set({ autoPlay: v })} label="Play the coach's lines automatically" />
        <Switch checked={store.settings.slowerVoice} onChange={(v) => set({ slowerVoice: v })} label="Read lines a little slower" />
      </div>
      <h3 className="mt-5 text-xl text-ink">Natural voice on this device</h3>
      <p className="mt-1 text-ink">
        Most lines are already recorded. A natural voice you can save on this device reads the rest, like your own steps. Nothing you type leaves the device.
      </p>
      <NaturalVoice />
    </>
  );
}
