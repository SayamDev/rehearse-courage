"use client";

import { useState } from "react";
import { ArrowRight, Check } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { freshRand, KEEP_GOING, nextIndex } from "@/lib/games";
import { useCourage } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { SayAndListen } from "@/components/voice/say-and-listen";
import { SpokenLine } from "@/components/voice/spoken-line";

/**
 * Keep it going: a friend says something about their day, and you find a
 * question to ask back. A follow-up question is the easiest way to keep a
 * chat going without having to talk about yourself. Two ideas are there if
 * you want them.
 */
export function KeepItGoing() {
  const { age } = useCourage();
  // Random only on a tap, so the page the server sends matches the first render.
  const [rand] = useState(() => ({ current: freshRand() }));
  const [i, setI] = useState(0);
  const [asked, setAsked] = useState(0);
  const [done, setDone] = useState(false);
  const turn = KEEP_GOING[i];
  const says = words(turn.says, age);

  const ask = () => {
    setAsked((n) => n + 1);
    setDone(true);
  };
  const next = () => {
    setDone(false);
    setI((n) => nextIndex(n, KEEP_GOING.length, rand.current));
  };

  return (
    <div>
      <figure className="rounded-card border-[1.5px] border-line bg-surface-2 p-5 sm:p-6" aria-live="polite">
        <figcaption className="text-muted">A friend says</figcaption>
        <div className="mt-1">
          <SpokenLine key={i} role="friend" text={says} as="blockquote" autoPlay className="font-display text-[clamp(1.4rem,1.1rem+1.2vw,1.9rem)] font-bold leading-tight text-ink">
            &ldquo;{says}&rdquo;
          </SpokenLine>
        </div>
      </figure>

      <p className="mt-4 font-semibold text-ink">What could you ask them back?</p>
      <details key={i} className="group mt-2 rounded-2xl bg-surface-2 px-4">
        <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-ink">Show two ideas</summary>
        <ul className="grid gap-1 pb-3">
          {turn.ideas.map((idea) => (
            <li key={idea.grown}>
              <SpokenLine role="narrator" text={words(idea, age)} className="py-2 text-ink" />
            </li>
          ))}
        </ul>
      </details>

      {done ? (
        <p role="status" className="tabular mt-4 text-center font-semibold text-ink">
          {asked === 1 ? "One question asked. That keeps a chat going." : `${asked} questions asked. That keeps a chat going.`}
        </p>
      ) : (
        <div className="mt-5">
          <SayAndListen key={i} label="Ask your question out loud" onSpoke={ask} />
          <Button variant="secondary" icon={Check} onClick={ask} className="mt-3 w-full">
            I asked it in my head
          </Button>
        </div>
      )}
      <Button variant={done ? "primary" : "secondary"} icon={ArrowRight} iconEnd onClick={next} className="mt-3 w-full">
        Next
      </Button>
    </div>
  );
}
