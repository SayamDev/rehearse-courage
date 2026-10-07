"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Play, Stop } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { ACCEPTANCE_LINES, SPEECH_TOOLS } from "@/lib/content/body";
import type { AgeBand } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SayAndListen } from "@/components/voice/say-and-listen";
import { SpokenLine } from "@/components/voice/spoken-line";

type Tool = (typeof SPEECH_TOOLS)[number];

/** Easy start and light touch: one practice word at a time, with a visual cue for how to start it. */
function WordPractice({ tool }: { tool: Tool }) {
  const [i, setI] = useState(0);
  const word = tool.practice[i];
  const go = (to: number) => setI((to + tool.practice.length) % tool.practice.length);
  const [first, rest] = [word.slice(0, 1), word.slice(1)];

  return (
    <div>
      <div className="rounded-card border-[1.5px] border-line bg-surface-2 p-5 text-center" aria-live="polite">
        <p className="tabular text-sm font-semibold text-muted">
          Word {i + 1} of {tool.practice.length}
        </p>
        <p className="mt-3 font-display text-[clamp(2rem,1.4rem+2.4vw,3rem)] font-bold leading-tight text-ink">
          {tool.id === "light-contact" ? (
            <>
              {/* The first sound, drawn light: touch it gently. */}
              <span className="font-normal text-accent-text underline decoration-dotted decoration-2 underline-offset-8">{first}</span>
              {rest}
            </>
          ) : (
            word
          )}
        </p>
        {tool.id === "easy-onset" ? (
          <div aria-hidden className="mx-auto mt-4 h-3 max-w-[260px] overflow-hidden rounded-full bg-line">
            {/* Restarts for each word: the sound grows from a whisper. */}
            <div key={word} className="swell h-full rounded-full bg-accent" />
          </div>
        ) : null}
        <p className="mt-3 text-sm text-muted">
          {tool.id === "easy-onset" ? "Let a little breath out first, then let the sound grow, like the bar." : "Touch the first sound lightly, as if it were fragile."}
        </p>
        <div className="mt-3 flex justify-center">
          <SpokenLine role="narrator" text={word} delivery="practice" autoPlay className="sr-only">
            {word}
          </SpokenLine>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Button variant="secondary" size="md" icon={ArrowLeft} onClick={() => go(i - 1)}>
          Back
        </Button>
        <Button variant="secondary" size="md" icon={ArrowRight} iconEnd onClick={() => go(i + 1)}>
          Next word
        </Button>
      </div>
    </div>
  );
}

/** Pausing: a sentence in chunks. The pacer lights one chunk at a time, with a rest between, so you can read along. */
function Pacer({ tool }: { tool: Tool }) {
  const [at, setAt] = useState(-1);
  const [resting, setResting] = useState(false);
  const timer = useRef<number | null>(null);
  const running = at >= 0;

  const clear = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => clear, []);

  const step = (k: number) => {
    if (k >= tool.practice.length) {
      setAt(-1);
      setResting(false);
      return;
    }
    setAt(k);
    setResting(false);
    // Say the chunk, then a real pause before the next one.
    timer.current = window.setTimeout(() => {
      setResting(true);
      timer.current = window.setTimeout(() => step(k + 1), 1100);
    }, 1400 + tool.practice[k].length * 45);
  };

  const toggle = () => {
    clear();
    if (running) {
      setAt(-1);
      setResting(false);
    } else step(0);
  };

  return (
    <div>
      <div className="rounded-card border-[1.5px] border-line bg-surface-2 p-5">
        <p className="font-display text-[clamp(1.4rem,1.1rem+1.2vw,1.9rem)] font-bold leading-relaxed">
          {tool.practice.map((chunk, k) => (
            <span key={chunk}>
              <span
                className={`rounded-lg px-1 transition-colors duration-[var(--dur-ui)] ${
                  k === at && !resting ? "bg-accent text-on-accent" : k < at || (k === at && resting) ? "text-ink" : running ? "text-muted" : "text-ink"
                }`}
              >
                {chunk}
              </span>
              {k < tool.practice.length - 1 ? (
                <span aria-hidden className={`mx-1 inline-block size-2 rounded-full align-middle ${k === at && resting ? "bg-calm" : "bg-line"}`} />
              ) : null}
            </span>
          ))}
        </p>
        <p className="mt-3 text-sm text-muted" role="status">
          {running ? (resting ? "Pause." : "Say this part.") : "The dots are pauses. Press Start and read along."}
        </p>
      </div>
      <Button variant="secondary" icon={running ? Stop : Play} onClick={toggle} className="mt-3 w-full">
        {running ? "Stop the pacer" : "Start the pacer"}
      </Button>
    </div>
  );
}

/**
 * Speech tools: options, never rules, never measured. Choose one tool at a
 * time; each has something to do (a word to start gently, a pacer to read
 * along with, a word to touch lightly), then say it and listen back.
 */
export function SpeechPractice({ age }: { age: AgeBand | null }) {
  const [id, setId] = useState<Tool["id"]>(SPEECH_TOOLS[0].id);
  const tool = SPEECH_TOOLS.find((t) => t.id === id)!;

  return (
    <>

      <p className="text-ink">Options, not rules. Pick one, try it, and hear how it felt. Talking your own way is always fine.</p>
      <h2 className="mt-6 text-2xl text-ink">Try a tool, if you want</h2>
      <div role="group" aria-label="Speech tools" className="mt-3 grid grid-cols-3 gap-1 rounded-full bg-surface-2 p-1">
        {SPEECH_TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={t.id === id}
            onClick={() => setId(t.id)}
            className={`min-h-11 rounded-full px-2 text-sm font-bold transition-colors duration-[var(--dur-feedback)] sm:text-base ${
              t.id === id ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink"
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <SpokenLine role="narrator" text={words(tool.how, age)} delivery="calm" className="text-ink" />
      </div>
      <div className="mt-4">{tool.id === "pausing" ? <Pacer key={tool.id} tool={tool} /> : <WordPractice key={tool.id} tool={tool} />}</div>

      <div className="mt-6 border-t border-line pt-5">
        <p className="mb-2 font-semibold text-ink">Now try it out loud</p>
        <SayAndListen key={tool.id} label="Say it" />
      </div>
      <aside className="mt-8 rounded-card bg-[color-mix(in_srgb,var(--calm)_12%,var(--surface))] p-5">
        <h2 className="text-xl text-ink">Worth remembering first</h2>
        <ul className="mt-2 grid list-disc gap-1.5 pl-5 text-ink marker:text-calm">
          {ACCEPTANCE_LINES.map((l) => (
            <li key={l.kid}>{words(l, age)}</li>
          ))}
        </ul>
      </aside>
    </>
  );
}
