"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Microphone, MicrophoneSlash } from "@phosphor-icons/react";
import { useSpeak } from "@/lib/speak";
import { Button } from "@/components/ui/button";

type Access = "unknown" | "granted" | "denied";

/**
 * Microphone check: asks for the microphone once, up front, so the first
 * speaking step does not start with a browser prompt. After allowing, say
 * hello and a bar moves with your voice for a few seconds, so you know it
 * works. Nothing is recorded or sent. Optional: typing works everywhere.
 */
export function MicCheck({ compact = false }: { compact?: boolean }) {
  const speak = useSpeak();
  const [access, setAccess] = useState<Access>("unknown");
  const [heard, setHeard] = useState(false);

  useEffect(() => {
    let live = true;
    // Where the browser can say whether it is already allowed, skip the question.
    navigator.permissions
      ?.query({ name: "microphone" as PermissionName })
      .then((p) => {
        if (!live) return;
        setAccess(p.state === "granted" ? "granted" : p.state === "denied" ? "denied" : "unknown");
        p.onchange = () => setAccess(p.state === "granted" ? "granted" : p.state === "denied" ? "denied" : "unknown");
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (speak.state === "listening") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAccess("granted");
      const t = window.setTimeout(() => speak.stop(), 3500);
      return () => window.clearTimeout(t);
    }
    if (speak.state === "blocked") setAccess("denied");
  }, [speak.state, speak]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if ((speak.level ?? 0) > 0.25) setHeard(true);
  }, [speak.level]);

  const listening = speak.state === "listening" || speak.state === "asking";

  return (
    <div className={`rounded-card border-[1.5px] border-line bg-surface-2 ${compact ? "p-4" : "p-5"}`}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={`flex size-11 shrink-0 -rotate-6 items-center justify-center rounded-full border-[3px] border-die text-[#13262b] shadow-sticker ${
            access === "denied" ? "bg-line" : access === "granted" ? "bg-accent" : "bg-sky"
          }`}
        >
          {access === "denied" ? <MicrophoneSlash size={22} weight="bold" /> : <Microphone size={22} weight="bold" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold text-ink">Your microphone</p>
          <p className="text-muted">
            {access === "denied"
              ? "It is off in this browser. That is fine: you can type every step instead. To turn it on, use the lock or site settings next to the address bar."
              : "Some steps ask you to speak. Nothing you say is recorded or sent unless you choose to keep recordings."}
          </p>
        </div>
      </div>

      {listening ? (
        <div className="mt-4" role="status">
          <p className="font-semibold text-ink">{speak.state === "asking" ? "Allow it in the box your browser shows." : "Say hello..."}</p>
          <div aria-hidden className="mt-2 h-3 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-accent transition-[width] duration-100" style={{ width: `${Math.round((speak.level ?? 0) * 100)}%` }} />
          </div>
        </div>
      ) : access === "granted" ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="inline-flex items-center gap-2 font-semibold text-accent-text" role="status">
            <CheckCircle size={20} weight="fill" aria-hidden />
            {speak.state === "done" ? (heard ? "Heard you. The microphone works." : "Ready. It was quiet, so speak up a little if you like.") : "Microphone ready."}
          </p>
          <Button variant="secondary" size="md" icon={Microphone} onClick={() => void speak.start()}>
            Test it
          </Button>
        </div>
      ) : access === "unknown" ? (
        <Button variant="secondary" icon={Microphone} className="mt-4 w-full sm:w-auto" onClick={() => void speak.start()}>
          Allow the microphone
        </Button>
      ) : null}
    </div>
  );
}
