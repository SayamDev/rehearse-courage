"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, Play, Stop } from "@phosphor-icons/react";
import { useSpeak } from "@/lib/speak";
import { stopSpeaking } from "@/lib/voice/speak";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/ui/speak-button";

/**
 * Say something out loud, then hear yourself back. The recording lives only
 * in this page's memory: it is never saved or sent, and it is gone when you
 * leave or try again. Nothing is measured. `onSpoke` fires once the
 * microphone actually listened (having a go counts, however quiet).
 */
export function SayAndListen({
  label = "Say it",
  onSpoke,
  variant = "primary",
}: {
  label?: string;
  onSpoke?: () => void;
  variant?: "primary" | "secondary";
}) {
  const speak = useSpeak({ keep: true });
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const url = useRef<string | null>(null);

  const release = () => {
    audio.current?.pause();
    audio.current = null;
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = null;
    setPlaying(false);
  };
  useEffect(() => release, []);

  const stop = () => {
    const wasListening = speak.state === "listening";
    speak.stop();
    if (wasListening) onSpoke?.();
  };

  const listen = () => {
    if (playing) {
      release();
      return;
    }
    if (!speak.recording) return;
    stopSpeaking();
    url.current = URL.createObjectURL(speak.recording);
    const a = new Audio(url.current);
    audio.current = a;
    a.onended = release;
    a.onerror = release;
    setPlaying(true);
    void a.play().catch(release);
  };

  const again = () => {
    release();
    speak.reset();
  };

  if (speak.state === "done") {
    return (
      <div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button variant={variant} icon={playing ? Stop : Play} onClick={listen} disabled={!speak.recording}>
            {playing ? "Stop" : "Listen back"}
          </Button>
          <Button variant="secondary" icon={ArrowCounterClockwise} onClick={again}>
            Say it again
          </Button>
        </div>
        <p className="mt-2 text-sm text-muted" role="status">
          {speak.recording ? "Only on this page. It is never saved or sent." : "Getting your recording ready."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <SpeakButton state={speak.state} level={speak.level} seconds={speak.seconds} onStart={speak.start} onStop={stop} label={label} variant={variant} className="w-full" />
      {speak.state === "blocked" ? (
        <p className="mt-2 text-ink" role="status">
          The microphone is off. You can still say it quietly to yourself.
        </p>
      ) : null}
    </div>
  );
}
