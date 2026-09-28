"use client";

import { useState } from "react";
import { ArrowRight, Check, Sparkle } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { RESCUE_PHRASES } from "@/lib/content/phrases";
import { freshRand, shuffle, SNAP_ROUNDS } from "@/lib/games";
import { useCourage } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { SpokenLine } from "@/components/voice/spoken-line";

const phrase = (id: string) => RESCUE_PHRASES.find((p) => p.id === id)!;

/**
 * Rescue snap: a tricky moment, three phrases, pick the one that helps.
 * There is no wrong pick: another phrase "could work too", and the best
 * fit is shown so it sticks for next time.
 */
export function RescueSnap() {
  const { age } = useCourage();
  const [rand] = useState(() => ({ current: freshRand() }));
  const [order] = useState(() => shuffle(SNAP_ROUNDS, rand.current));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [snaps, setSnaps] = useState(0);
  const round = order[i];
  const [options, setOptions] = useState(() => shuffle([order[0].answer, ...order[0].others], rand.current));
  const finished = i >= order.length;

  const pick = (id: string) => {
    if (picked) return;
    setPicked(id);
    if (id === round.answer) setSnaps((n) => n + 1);
  };

  const next = () => {
    const n = i + 1;
    setI(n);
    setPicked(null);
    if (n < order.length) setOptions(shuffle([order[n].answer, ...order[n].others], rand.current));
  };

  if (finished) {
    return (
      <div className="text-center">
        <span aria-hidden className="mx-auto flex size-16 -rotate-6 items-center justify-center rounded-full border-4 border-die bg-sun text-[#13262b] shadow-sticker">
          <Sparkle size={32} weight="fill" />
        </span>
        <h2 className="mt-4 text-2xl text-ink">That is every moment.</h2>
        <p className="mt-2 text-ink">
          You snapped {snaps} of {order.length} straight away. Every phrase you looked at is one more you know.
        </p>
        <Button
          className="mt-6"
          onClick={() => {
            setI(0);
            setSnaps(0);
            setOptions(shuffle([order[0].answer, ...order[0].others], rand.current));
          }}
        >
          Play again
        </Button>
      </div>
    );
  }

  const right = picked === round.answer;
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="tabular text-sm font-semibold text-muted">
          Moment {i + 1} of {order.length}
        </p>
        <ol aria-hidden className="flex list-none gap-1.5 p-0">
          {order.map((r, k) => (
            <li key={r.answer} className={`size-2.5 rounded-full ${k < i ? "bg-accent" : k === i ? "bg-ink" : "bg-line"}`} />
          ))}
        </ol>
      </div>
      <div className="mt-3 rounded-card border-[1.5px] border-line bg-surface-2 p-5">
        <SpokenLine role="narrator" text={words(round.moment, age)} autoPlay className="font-display text-xl font-bold leading-snug text-ink" />
      </div>
      <p className="mt-5 font-semibold text-ink">Which words would help?</p>
      <ul role="list" className="mt-2 grid list-none gap-2 p-0">
        {options.map((id) => {
          const text = words(phrase(id).text, age);
          const isAnswer = id === round.answer;
          const state = !picked ? "idle" : isAnswer ? "best" : id === picked ? "picked" : "rest";
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => pick(id)}
                aria-pressed={id === picked}
                disabled={Boolean(picked) && state === "rest"}
                className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-[var(--radius-control)] border-2 px-4 py-2 text-left font-semibold transition-colors duration-[var(--dur-feedback)] ${
                  state === "best"
                    ? "border-die bg-accent text-on-accent shadow-sticker"
                    : state === "picked"
                      ? "border-stone-dim bg-surface-2 text-ink"
                      : state === "rest"
                        ? "border-line bg-surface text-muted"
                        : "border-line bg-surface text-ink hover:border-stone-dim"
                }`}
              >
                &ldquo;{text}&rdquo;
                {state === "best" ? <Check size={20} weight="bold" aria-hidden /> : null}
              </button>
            </li>
          );
        })}
      </ul>
      {picked ? (
        <div className="mt-4" role="status">
          <p className="font-semibold text-ink">{right ? "Snap. That one fits." : "That could work too. This one fits really well:"}</p>
          {!right ? <p className="mt-1 text-ink">&ldquo;{words(phrase(round.answer).text, age)}&rdquo;</p> : null}
          <p className="mt-1 text-sm text-muted">Try saying it quietly to yourself.</p>
          <Button icon={ArrowRight} iconEnd onClick={next} className="mt-4 w-full sm:w-auto">
            {i + 1 < order.length ? "Next moment" : "Finish"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
