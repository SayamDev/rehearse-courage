"use client";

import { useState } from "react";
import { ArrowsClockwise, Cards } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { freshRand, nextIndex, SAY_LINES, SAY_STYLES } from "@/lib/games";
import { useCourage } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { SayAndListen } from "@/components/voice/say-and-listen";
import { SpokenLine } from "@/components/voice/spoken-line";

/**
 * Say it like: an everyday line and a style (a whisper, a robot, a news
 * reader). Saying it in a silly voice takes the pressure off the words.
 * There is no right way, and nothing is checked.
 */
export function SayItLike() {
  const { age } = useCourage();
  // Random only on a tap, so the page the server sends matches the first render.
  const [rand] = useState(() => ({ current: freshRand() }));
  const [line, setLine] = useState(0);
  const [style, setStyle] = useState<number | null>(null);
  const [said, setSaid] = useState(0);

  const text = words(SAY_LINES[line], age);
  const how = style === null ? null : words(SAY_STYLES[style], age);

  return (
    <div>
      <div className="rounded-card border-[1.5px] border-line bg-surface-2 p-5 text-center sm:p-6" aria-live="polite">
        <p className="text-muted">Hear the everyday version, then make it your own</p>
        <SpokenLine role="narrator" delivery="practice" text={text} className="font-display text-[clamp(1.4rem,1.1rem+1.2vw,1.9rem)] font-bold leading-tight text-ink">
          &ldquo;{text}&rdquo;
        </SpokenLine>
        {how ? (
          <p className="mt-4">
            <span className="sticker sticker-grape text-base">{how}</span>
          </p>
        ) : (
          <p className="mt-4 text-muted">Deal a card to find out how.</p>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Button icon={Cards} variant={how ? "secondary" : "primary"} onClick={() => setStyle((s) => nextIndex(s ?? -1, SAY_STYLES.length, rand.current))}>
          {how ? "New style" : "Deal a card"}
        </Button>
        <Button variant="secondary" icon={ArrowsClockwise} onClick={() => setLine((n) => nextIndex(n, SAY_LINES.length, rand.current))}>
          New line
        </Button>
      </div>

      {how ? (
        <div className="mt-5 border-t border-line pt-5">
          <p className="mb-2 font-semibold text-ink">Say it {how}. Then listen back if you like.</p>
          <SayAndListen key={`${line}-${style}`} label="Say it" onSpoke={() => setSaid((n) => n + 1)} />
          {said > 0 ? (
            <p role="status" className="tabular mt-3 text-center font-semibold text-ink">
              {said === 1 ? "One style tried. Your voice is warming up." : `${said} styles tried. Your voice is warming up.`}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
