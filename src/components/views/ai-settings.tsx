"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DownloadSimple, Trash } from "@phosphor-icons/react";
import { aiAllowed } from "@/lib/age";
import { DOWNLOAD_MB, downloadModel, meteredNow, removeModel, supportedModel } from "@/lib/ai/device";
import { updateSettings, type Settings } from "@/lib/state";
import { act, useCourage } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type Phase = "checking" | "unsupported" | "ready" | "downloading" | "removing";

/**
 * The on-device model: download on a tap (with its size, and a warning on
 * mobile data), progress while it downloads, and removal. Checking support
 * only asks the browser for WebGPU; the model's code is not loaded until
 * the person taps Download.
 */
function DeviceModel({ on, set }: { on: boolean; set: (patch: Partial<Settings>) => void }) {
  const [phase, setPhase] = useState<Phase>("checking");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [metered, setMetered] = useState(false);
  const removeRef = useRef<HTMLButtonElement>(null);
  const downloadRef = useRef<HTMLButtonElement>(null);
  const progressRef = useRef<HTMLParagraphElement>(null);
  const moveFocus = useRef<"remove" | "download" | null>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    let live = true;
    supportedModel().then((m) => {
      if (!live) return;
      setMetered(meteredNow());
      setPhase(m ? "ready" : "unsupported");
    });
    return () => {
      live = false;
    };
  }, []);

  // The Download button is replaced by the progress bar: keep focus on the page, not lost.
  useEffect(() => {
    if (phase === "downloading") progressRef.current?.focus();
  }, [phase]);

  // After a download or removal the pressed button is gone; focus its replacement.
  useEffect(() => {
    if (phase !== "ready" || !moveFocus.current) return;
    (moveFocus.current === "remove" ? removeRef : downloadRef).current?.focus();
    moveFocus.current = null;
  }, [phase, on]);

  const download = async () => {
    setMessage("");
    setProgress(0);
    setPhase("downloading");
    try {
      await downloadModel((p) => setProgress(p));
      // Left the page (or deleted everything) meanwhile: do not write into a fresh store.
      if (!alive.current) return;
      set({ deviceModel: true });
      moveFocus.current = "remove";
      setMessage("Saved on this device. Cobi and tidy can now work without the internet.");
    } catch {
      moveFocus.current = "download";
      setMessage("The download did not finish. You can try again.");
    }
    setPhase("ready");
  };

  const remove = async () => {
    if (phase === "removing") return;
    setPhase("removing");
    await removeModel().catch(() => {});
    set({ deviceModel: false });
    moveFocus.current = "download";
    setMessage("Removed from this device.");
    setPhase("ready");
  };

  if (phase === "checking") return null;
  if (phase === "unsupported") {
    return <p className="mt-2 text-muted">This browser cannot run AI on the device. Online help and Cobi&apos;s own replies still work.</p>;
  }

  const pct = Math.round(progress * 100);
  return (
    <>
      {phase === "downloading" ? (
        <div className="mt-3">
          <p id="model-progress-label" ref={progressRef} tabIndex={-1} className="text-ink outline-none">
            Downloading. You can keep using the app.
          </p>
          <div
            role="progressbar"
            aria-labelledby="model-progress-label"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            className="mt-2 h-3 overflow-hidden rounded-full bg-surface-2"
          >
            <div className="h-full rounded-full bg-chrome" style={{ width: `${pct}%` }} />
          </div>
          <p className="tabular mt-1 text-muted" aria-hidden>
            {pct}%
          </p>
        </div>
      ) : on ? (
        <Button ref={removeRef} variant="secondary" icon={Trash} className="mt-3" onClick={remove} aria-disabled={phase === "removing"}>
          Remove from this device
        </Button>
      ) : (
        <>
          {metered ? <p className="mt-2 text-ink">You seem to be on mobile data. This is a big download, so Wi-Fi is better.</p> : null}
          <Button ref={downloadRef} variant="secondary" icon={DownloadSimple} className="mt-3" onClick={download}>
            Download (about {DOWNLOAD_MB} MB)
          </Button>
        </>
      )}
      <p role="status" className="mt-2 text-ink">
        {message}
      </p>
    </>
  );
}

/**
 * AI help in Me. Under 13 (or no age set) sees a plain sentence and no
 * switches. For 13 and over: online help on or off, and the optional
 * on-device model.
 */
export function AiSettings() {
  const store = useCourage();
  const set = (patch: Partial<Settings>) => act((s) => updateSettings(s, patch));

  if (!aiAllowed(store.age)) {
    return (
      <>
        <p className="mt-2 text-ink">AI help is only for people aged 13 and over. Everything else works the same, and nothing leaves this device.</p>
        {/* A model saved earlier (before the age changed) can still be removed. */}
        {store.settings.deviceModel ? <DeviceModel on set={set} /> : null}
      </>
    );
  }

  return (
    <>
      <p className="mt-2 text-ink">
        Cobi can answer what you actually said, and tidy a messy sentence. Your words are sent without your name, not saved, and not used to train AI.{" "}
        <Link href="/privacy#ai" className="font-semibold underline">
          How this works
        </Link>
      </p>
      <div className="mt-3 divide-y divide-line">
        <Switch checked={store.settings.onlineHelp} onChange={(v) => set({ onlineHelp: v })} label="Online AI help" />
      </div>
      <h3 className="mt-5 text-xl text-ink">AI on this device</h3>
      <p className="mt-1 text-ink">
        A small AI model you can save on this device, used when online help is off or not available. Once saved, nothing it does leaves the device.
      </p>
      <DeviceModel on={store.settings.deviceModel} set={set} />
    </>
  );
}
