"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Sparkle } from "@phosphor-icons/react";
import { browserAiDeps } from "@/lib/ai/browser";
import { canUseOnline, tidyAnswer, transcribeAnswer } from "@/lib/ai/client";
import { TIDY_UNAVAILABLE } from "@/lib/content/coach-replies";
import { checkCrisis } from "@/lib/safety/crisis";
import { useSpeak, waitForRecording } from "@/lib/speak";
import { useCourage } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/ui/speak-button";

/** Saying the tidy version out loud. Seconds only, on the device, never judged. */
function SayItBack() {
  const speak = useSpeak();
  return (
    <div className="mt-4">
      <SpeakButton state={speak.state} onStart={speak.start} onStop={speak.stop} label="Say the tidy version" />
      <p role="status" className="mt-2 text-ink empty:hidden">
        {speak.state === "done" ? "You said it out loud. That is the practice." : speak.state === "blocked" ? "The microphone is off. Saying it in your head counts too." : ""}
      </p>
    </div>
  );
}

/**
 * "Say it messy, then tidy" (13 and over): type or say a sentence however
 * it comes out, get a tidy version in your own words, then say that back.
 * Only shown when online help or the on-device model is on. Nothing is
 * saved, and a crisis check runs on the device before anything is sent.
 */
export function TidyTool({ onCrisis }: { onCrisis: () => void }) {
  const store = useCourage();
  const online = canUseOnline(store);
  const speak = useSpeak({ capture: online });
  const [messy, setMessy] = useState("");
  const [tidy, setTidy] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const id = useId();
  const tidyRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (tidy) tidyRef.current?.focus();
  }, [tidy]);

  const deps = () => browserAiDeps(store.settings.deviceModel);

  // Speaking fills the box with what was heard (online only), so it can be read before tidying.
  const stopSpeaking = async () => {
    const wasListening = speak.state === "listening";
    speak.stop();
    if (!wasListening) return;
    setBusy(true);
    setStatus("Writing down what you said.");
    const heard = await transcribeAnswer(store, await waitForRecording(speak.latest), speak.latest().seconds, deps());
    speak.reset();
    setBusy(false);
    if (heard.kind === "crisis") return onCrisis();
    if (heard.kind === "text") {
      setMessy((m) => (m.trim() ? `${m.trim()} ${heard.text}` : heard.text).slice(0, 600));
      setStatus("Here is what you said. You can change it, then tidy it.");
    } else {
      setStatus("That did not come through. You can type it instead.");
    }
  };

  const doTidy = async () => {
    if (busy) return;
    if (!messy.trim()) {
      setStatus("Write or say a few words first.");
      return;
    }
    if (checkCrisis(messy).crisis) return onCrisis();
    setBusy(true);
    setTidy(null);
    setStatus("Tidying.");
    const out = await tidyAnswer(store, messy, deps());
    setBusy(false);
    if (out.kind === "crisis") return onCrisis();
    if (out.kind === "tidy") {
      setTidy(out.text);
      setStatus("");
    } else {
      setStatus(TIDY_UNAVAILABLE);
    }
  };

  return (
    <section aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="text-2xl text-ink">
        Say it messy, then tidy
      </h2>
      <p className="mt-1 text-ink">Get it out however it comes. Then tidy it into a sentence you can say back.</p>

      <label htmlFor={id} className="mt-4 block font-semibold text-ink">
        Your messy version
      </label>
      <p id={`${id}-hint`} className="text-muted">
        {online ? "Type it, or say it and it will be written down. " : "Type it. "}
        Not saved.{" "}
        <Link href="/privacy#ai" className="underline">
          How this works
        </Link>
      </p>
      <textarea
        id={id}
        rows={3}
        maxLength={600}
        value={messy}
        onChange={(e) => setMessy(e.target.value)}
        aria-describedby={`${id}-hint ${id}-status`}
        className="mt-2 block w-full rounded-2xl border border-line bg-surface px-4 py-3 text-ink focus-visible:border-ink"
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {online ? (
          <SpeakButton state={speak.state} onStart={speak.start} onStop={stopSpeaking} label="Say it messy" variant="secondary" />
        ) : null}
        <Button variant={tidy ? "secondary" : "primary"} icon={Sparkle} onClick={doTidy} aria-disabled={busy}>
          Tidy it
        </Button>
      </div>
      <p id={`${id}-status`} role="status" className="mt-3 text-ink empty:hidden">
        {status}
      </p>

      {tidy ? (
        <div className="mt-4 rounded-card bg-surface-2 p-5">
          <p className="text-muted">Tidy version</p>
          <p ref={tidyRef} tabIndex={-1} className="mt-1 font-display text-[clamp(1.35rem,1.1rem+1vw,1.75rem)] font-bold text-ink outline-none">
            {tidy}
          </p>
          <SayItBack />
        </div>
      ) : null}
    </section>
  );
}
