"use client";

import { useId, useState } from "react";
import { ArrowRight, Check } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { RESCUE_PHRASES } from "@/lib/content/phrases";
import { checkCrisis } from "@/lib/safety/crisis";
import { useSpeak } from "@/lib/speak";
import { logEvent } from "@/lib/state";
import { act, useCourage } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/ui/speak-button";

/**
 * Rescue phrases, one at a time. "Say it" practises it out loud on the
 * device (nothing is recorded or sent); typing it counts too. Courage
 * first: having a go counts, however quiet it was, so a spoken attempt is
 * counted once the microphone was listening, whatever the seconds. Either way
 * a rescue event is logged once per phrase, which feeds the Rescue ready
 * badge and daily quests. "Next" moves on.
 */
export function RescueDeck({ onCrisis }: { onCrisis: () => void }) {
  const { age, settings } = useCourage();
  const speak = useSpeak({ keep: settings.keepRecordings });
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState("");
  const [practised, setPractised] = useState<Set<string>>(() => new Set());
  const fieldId = useId();
  const phrase = RESCUE_PHRASES[i];
  const done = practised.has(phrase.id);

  const markPractised = () => {
    if (done) return;
    act((s) => logEvent(s, "rescue", new Date()));
    setPractised((p) => new Set(p).add(phrase.id));
  };

  // Counts once actually listening; stopping while the permission prompt is up does not.
  const stop = () => {
    const wasListening = speak.state === "listening";
    speak.stop();
    if (wasListening) markPractised();
  };

  const submitTyped = () => {
    if (!typed.trim()) return;
    if (checkCrisis(typed).crisis) {
      onCrisis();
      return;
    }
    markPractised();
    setTyped("");
  };

  const next = () => {
    speak.reset();
    setTyped("");
    setI((i + 1) % RESCUE_PHRASES.length);
  };

  return (
    <section aria-labelledby="rescue-heading">
      <h2 id="rescue-heading" className="sr-only">
        Practise a rescue phrase
      </h2>
      <div className="rounded-card bg-surface-2 p-5" aria-live="polite">
        <p className="tabular text-muted">
          Phrase {i + 1} of {RESCUE_PHRASES.length}
        </p>
        <p className="mt-2 font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] font-bold text-ink">
          &ldquo;{words(phrase.text, age)}&rdquo;
        </p>
        <p className="mt-2 text-ink">{words(phrase.when, age)}</p>
        {done ? (
          <p className="mt-3 flex items-center gap-2 font-semibold text-ink">
            <Check size={20} weight="regular" aria-hidden />
            Practised. It will be ready when you need it.
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <SpeakButton state={speak.state} onStart={speak.start} onStop={stop} label="Say it" />
        <Button variant="secondary" icon={ArrowRight} onClick={next}>
          Next
        </Button>
      </div>
      {speak.state === "blocked" ? (
        <p className="mt-3 text-ink" role="status">
          The microphone is off. You can type it instead.
        </p>
      ) : null}

      <form
        className="mt-5"
        onSubmit={(e) => {
          e.preventDefault();
          submitTyped();
        }}
      >
        <label htmlFor={fieldId} className="block font-semibold text-ink">
          Or type it
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id={fieldId}
            value={typed}
            maxLength={200}
            onChange={(e) => setTyped(e.target.value)}
            className="min-h-[52px] flex-1 rounded-2xl border border-line bg-surface px-4 text-ink focus-visible:border-ink"
          />
          <Button type="submit" variant="secondary" icon={Check}>
            Done
          </Button>
        </div>
      </form>
    </section>
  );
}
