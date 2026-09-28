"use client";

import { useState } from "react";
import { ArrowCounterClockwise, ArrowRight } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { BUILD_SENTENCES, scramble, freshRand, sentenceWords, shuffle } from "@/lib/games";
import { useCourage } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { SayAndListen } from "@/components/voice/say-and-listen";
import { SpokenLine } from "@/components/voice/spoken-line";

/**
 * Word builder: tap the words in order to put a sentence back together
 * (tap a placed word to take it back). Any order you are happy with is
 * fine; the usual order is shown alongside, then say it out loud.
 */
export function WordBuilder() {
  const { age } = useCourage();
  const [rand] = useState(() => ({ current: freshRand() }));
  const [order] = useState(() => shuffle(BUILD_SENTENCES, rand.current));
  const [i, setI] = useState(0);
  const target = sentenceWords(words(order[i % order.length], age));
  const [pool, setPool] = useState(() => scramble(target, rand.current).map((word, k) => ({ word, k })));
  const [placed, setPlaced] = useState<{ word: string; k: number }[]>([]);
  const complete = pool.length === 0;
  const built = placed.map((p) => p.word).join(" ");
  const same = built === target.join(" ");

  const reset = (n: number) => {
    const t = sentenceWords(words(order[n % order.length], age));
    setI(n);
    setPlaced([]);
    setPool(scramble(t, rand.current).map((word, k) => ({ word, k })));
  };

  const chip =
    "min-h-11 rounded-[12px] border-[3px] px-3.5 font-display text-lg font-bold transition-[transform,background-color] duration-[var(--dur-feedback)] active:scale-95";

  return (
    <div>
      <p className="tabular text-sm font-semibold text-muted">Sentence {(i % order.length) + 1}</p>
      <div
        aria-label="Your sentence"
        className={`mt-2 flex min-h-24 flex-wrap content-start items-start gap-2 rounded-card border-2 p-3 ${complete ? "border-accent bg-surface-2" : "border-dashed border-line bg-surface-2"}`}
      >
        {placed.length === 0 ? <span className="self-center px-1 text-muted">Tap the words below, in order.</span> : null}
        {placed.map((p) => (
          <button
            key={p.k}
            type="button"
            aria-label={`${p.word}, placed. Tap to take back`}
            onClick={() => {
              setPlaced((xs) => xs.filter((x) => x.k !== p.k));
              setPool((xs) => [...xs, p]);
            }}
            className={`${chip} border-die bg-accent text-on-accent shadow-sticker`}
          >
            {p.word}
          </button>
        ))}
      </div>

      <ul role="list" aria-label="Words to place" className="mt-4 flex min-h-12 list-none flex-wrap gap-2 p-0">
        {pool.map((p) => (
          <li key={p.k}>
            <button
              type="button"
              onClick={() => {
                setPool((xs) => xs.filter((x) => x.k !== p.k));
                setPlaced((xs) => [...xs, p]);
              }}
              className={`${chip} border-line bg-surface text-ink hover:border-stone-dim`}
            >
              {p.word}
            </button>
          </li>
        ))}
      </ul>

      {complete ? (
        <div className="mt-5 border-t border-line pt-5" aria-live="polite">
          <p className="font-semibold text-ink">{same ? "That reads well." : "Your way works. The usual order is:"}</p>
          <div className="mt-1">
            <SpokenLine role="narrator" text={target.join(" ")} autoPlay className="text-ink">
              &ldquo;{target.join(" ")}&rdquo;
            </SpokenLine>
          </div>
          <p className="mb-3 mt-1 text-muted">Now say it out loud, once or twice.</p>
          <SayAndListen key={i} label="Say it" />
          <Button variant="secondary" icon={ArrowRight} iconEnd onClick={() => reset(i + 1)} className="mt-3 w-full">
            Next sentence
          </Button>
        </div>
      ) : placed.length > 0 ? (
        <Button variant="secondary" icon={ArrowCounterClockwise} size="md" onClick={() => reset(i)} className="mt-4">
          Start this one again
        </Button>
      ) : null}
    </div>
  );
}
