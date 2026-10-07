"use client";

import { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { DESCRIBE_HINTS, DICE_FACES, freshRand, nextIndex } from "@/lib/games";
import { useCourage } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { SayAndListen } from "@/components/voice/say-and-listen";
import { SpokenLine } from "@/components/voice/spoken-line";
import { FACE } from "./dice-faces";

const INKS = ["bg-sky", "bg-sun", "bg-coral", "bg-grape", "bg-lime"];

/**
 * Describe it: a picture you describe out loud without saying its name,
 * as if to someone who cannot see it. Good practice for finding other
 * words when the one you want will not come. Questions help when stuck.
 */
export function DescribeIt() {
  const { age } = useCourage();
  // Random only on a tap, so the page the server sends matches the first render.
  const [rand] = useState(() => ({ current: freshRand() }));
  const [i, setI] = useState(0);
  const [turn, setTurn] = useState(0);
  const [done, setDone] = useState(0);
  const face = FACE[DICE_FACES[i]];
  const Ic = face.icon;
  const name = face.word.replace(/^(a|an|the) /, "");

  return (
    <div>
      <div className="flex flex-col items-center gap-4 rounded-card border-[1.5px] border-line bg-surface-2 p-5 text-center sm:p-6" aria-live="polite">
        <span
          className={`flex size-28 -rotate-3 items-center justify-center rounded-[26px] border-4 border-die text-[#13262b] shadow-sticker ${INKS[turn % INKS.length]}`}
        >
          <Ic size={60} weight="bold" aria-hidden />
          <span className="sr-only">The picture is {face.word}.</span>
        </span>
        <p className="text-lg text-ink">
          Describe it without saying <span className="font-bold">&ldquo;{name}&rdquo;</span>.
        </p>
      </div>

      <details className="group mt-4 rounded-2xl bg-surface-2 px-4">
        <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-ink">Stuck? Questions that help</summary>
        <ul className="grid gap-1 pb-3">
          {DESCRIBE_HINTS.map((h) => (
            <li key={`${turn}-${h.grown}`}>
              <SpokenLine role="narrator" delivery="game" text={words(h, age)} className="py-2 text-ink" />
            </li>
          ))}
        </ul>
      </details>

      <div className="mt-5">
        <SayAndListen key={turn} label="Describe it out loud" onSpoke={() => setDone((n) => n + 1)} />
      </div>
      <Button variant="secondary" icon={ArrowRight} iconEnd onClick={() => {
          setI((n) => nextIndex(n, DICE_FACES.length, rand.current));
          setTurn((t) => t + 1);
        }} className="mt-3 w-full">
        Next picture
      </Button>
      {done > 0 ? (
        <p role="status" className="tabular mt-4 text-center font-semibold text-ink">
          {done === 1 ? "One picture described. Finding other words is a real skill." : `${done} pictures described. Finding other words is a real skill.`}
        </p>
      ) : null}
    </div>
  );
}
