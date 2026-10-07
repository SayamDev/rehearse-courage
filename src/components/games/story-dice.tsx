"use client";

import { useState } from "react";
import { DiceFive } from "@phosphor-icons/react";
import { rollDice, freshRand, STORY_STARTS, type DiceFace } from "@/lib/games";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Button } from "@/components/ui/button";
import { SayAndListen } from "@/components/voice/say-and-listen";
import { SpokenLine } from "@/components/voice/spoken-line";
import { FACE } from "./dice-faces";

const INKS = ["bg-sky", "bg-sun", "bg-coral"];
const STARTS = STORY_STARTS;

/** Story dice: roll three pictures, then tell a tiny story that has all three. Any story counts. */
export function StoryDice() {
  const reduce = useReducedMotion();
  const [rand] = useState(() => ({ current: freshRand() }));
  const [faces, setFaces] = useState<DiceFace[] | null>(null);
  const [roll, setRoll] = useState(0);
  const [start, setStart] = useState(STARTS[0]);

  const go = () => {
    setFaces(rollDice(rand.current));
    setStart(STARTS[Math.floor(rand.current() * STARTS.length)]);
    setRoll((r) => r + 1);
  };

  return (
    <div>
      <ul role="list" className="grid list-none grid-cols-3 gap-3 p-0">
        {[0, 1, 2].map((k) => {
          const f = faces?.[k];
          const Ic = f ? FACE[f].icon : DiceFive;
          return (
            <li key={`${roll}-${k}`}>
              <span
                className={`flex aspect-square items-center justify-center rounded-[22px] border-4 border-die text-[#13262b] shadow-sticker ${f ? INKS[k] : "bg-surface-2 text-muted"} ${
                  f && !reduce ? "dice-roll" : ""
                }`}
                style={{ animationDelay: `${k * 90}ms`, rotate: `${[-4, 3, -2][k]}deg` }}
              >
                <Ic size={48} weight="bold" aria-hidden />
                <span className="sr-only">{f ? FACE[f].word : "Not rolled yet"}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <Button onClick={go} icon={DiceFive} variant={faces ? "secondary" : "primary"} className="mt-5 w-full">
        {faces ? "Roll again" : "Roll the dice"}
      </Button>

      {faces ? (
        <div className="mt-5 border-t border-line pt-5" aria-live="polite">
          <p className="text-ink">
            Tell a tiny story with {FACE[faces[0]].word}, {FACE[faces[1]].word} and {FACE[faces[2]].word}. Three sentences is plenty.
          </p>
          <p className="mt-2 text-muted">
            Stuck? Start with:
          </p>
          <SpokenLine key={roll} role="narrator" delivery="practice" text={start} className="font-semibold text-ink">
            &ldquo;{start}&rdquo;
          </SpokenLine>
          <div className="mt-4">
            <SayAndListen key={roll} label="Tell your story" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
