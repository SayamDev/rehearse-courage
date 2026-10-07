"use client";

import { useId, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Star } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { RESCUE_PHRASES } from "@/lib/content/phrases";
import { checkCrisis } from "@/lib/safety/crisis";
import { logEvent, toggleSavedPhrase } from "@/lib/state";
import { act, useCourage } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { SayAndListen } from "@/components/voice/say-and-listen";
import { SpokenLine } from "@/components/voice/spoken-line";

/**
 * Rescue phrases, one at a time, starred ones first. Say it out loud and
 * listen back (kept only on this page), or type it. Having a go counts,
 * however quiet: a rescue event is logged once per phrase, which feeds the
 * Rescue ready badge and daily quests. Star a phrase to keep it at the top.
 */
export function RescueDeck({ onCrisis }: { onCrisis: () => void }) {
  const { age, savedPhrases } = useCourage();
  // The order is fixed when the deck opens, so starring never moves the card you are on.
  const [order] = useState(() => [...RESCUE_PHRASES].sort((a, b) => Number(savedPhrases.includes(b.id)) - Number(savedPhrases.includes(a.id))));
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState("");
  const [practised, setPractised] = useState<Set<string>>(() => new Set());
  const fieldId = useId();
  const phrase = order[i];
  const done = practised.has(phrase.id);
  const starred = savedPhrases.includes(phrase.id);
  const text = words(phrase.text, age);

  const markPractised = () => {
    if (done) return;
    act((s) => logEvent(s, "rescue", new Date()));
    setPractised((p) => new Set(p).add(phrase.id));
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

  const go = (to: number) => {
    setTyped("");
    setI((to + order.length) % order.length);
  };

  return (
    <section aria-labelledby="rescue-heading">
      <h2 id="rescue-heading" className="sr-only">
        Practise a rescue phrase
      </h2>

      <div className="flex items-center justify-between gap-3">
        <p className="tabular text-sm font-semibold text-muted">
          Phrase {i + 1} of {order.length}
        </p>
        <ol aria-hidden className="flex list-none gap-1.5 p-0">
          {order.map((p, j) => (
            <li
              key={p.id}
              className={`size-2.5 rounded-full ${j === i ? "bg-ink" : practised.has(p.id) ? "bg-accent" : "bg-line"}`}
            />
          ))}
        </ol>
      </div>

      <div className="mt-3 rounded-card border-[1.5px] border-line bg-surface-2 p-5" aria-live="polite">
        <div className="flex items-start justify-between gap-3">
          <SpokenLine role="narrator" delivery="practice" text={text} autoPlay className="font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] font-bold leading-tight text-ink">
            &ldquo;{text}&rdquo;
          </SpokenLine>
        </div>
        <p className="mt-2 text-muted">{words(phrase.when, age)}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={starred}
            onClick={() => act((s) => toggleSavedPhrase(s, phrase.id))}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 font-semibold transition-colors duration-[var(--dur-feedback)] ${
              starred ? "border-die bg-sun text-[#13262b] shadow-sticker" : "border-line bg-surface text-ink hover:border-stone-dim"
            }`}
          >
            <Star size={18} weight={starred ? "fill" : "bold"} aria-hidden />
            {starred ? "In my phrases" : "Save to my phrases"}
          </button>
          {done ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-accent-text">
              <Check size={18} weight="bold" aria-hidden />
              Practised
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <SayAndListen key={phrase.id} onSpoke={markPractised} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Button variant="secondary" icon={ArrowLeft} onClick={() => go(i - 1)}>
          Back
        </Button>
        <Button variant="secondary" icon={ArrowRight} iconEnd onClick={() => go(i + 1)}>
          Next
        </Button>
      </div>

      <details className="group mt-5 rounded-card border-[1.5px] border-line px-4">
        <summary className="flex min-h-12 cursor-pointer items-center font-semibold text-ink">Type it instead</summary>
        <form
          className="pb-4"
          onSubmit={(e) => {
            e.preventDefault();
            submitTyped();
          }}
        >
          <label htmlFor={fieldId} className="block text-muted">
            Typing it counts too. It is not saved.
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id={fieldId}
              value={typed}
              maxLength={200}
              onChange={(e) => setTyped(e.target.value)}
              className="min-h-[52px] min-w-0 flex-1 rounded-[var(--radius-control)] border-2 border-line bg-surface px-4 text-ink focus-visible:border-ink"
            />
            <Button type="submit" variant="secondary" icon={Check}>
              Done
            </Button>
          </div>
        </form>
      </details>
    </section>
  );
}
