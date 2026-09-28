"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowsClockwise, Check, Flag, House } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { RESCUE_PHRASES } from "@/lib/content/phrases";
import { READY_LINES, READY_PHRASES } from "@/lib/content/ready";
import { ROOMS, situationById, SITUATIONS } from "@/lib/content/situations";
import { ROOM_LABEL } from "@/lib/rooms";
import { logEvent } from "@/lib/state";
import { act, useCourage } from "@/lib/store";
import { ROOM_IDS, type RoomId } from "@/lib/types";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { BreathingLantern } from "@/components/calm/breathing-lantern";
import { Button, ButtonLink } from "@/components/ui/button";
import { PaperCard } from "@/components/ui/paper-card";
import { SayAndListen } from "@/components/voice/say-and-listen";
import { SpokenLine } from "@/components/voice/spoken-line";
import { ROOM_DISC, ROOM_ICON } from "./room-meta";

const TITLE = "text-[clamp(1.75rem,1.2rem+2vw,2.75rem)]";
const CARD_TITLE = "text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)]";
/** The four screens after choosing the moment. */
const STAGES = ["breathe", "words", "rescue", "go"] as const;
type Stage = "pick" | (typeof STAGES)[number];

type Moment = { id: string; room: RoomId; title: string; ideas: string[]; mission: string };

/**
 * Right before ("/ready"): about a minute, for just before the real thing.
 * Choose what is coming up, take one slow breath, look at (and say) your
 * words, keep one rescue phrase in your pocket, then go. One thing on
 * screen at a time; each screen's heading takes focus. Going counts as a
 * brave day, and afterwards step 6 is one tap away to say how it went.
 */
export function ReadyView({ initial }: { initial: string | null }) {
  const store = useCourage();
  const reduce = useReducedMotion();
  const [picked, setPicked] = useState<string | null>(initial);
  const [stage, setStage] = useState<Stage>(initial ? "breathe" : "pick");
  const [phrase, setPhrase] = useState(0);
  const [went, setWent] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  // Each new screen starts at its heading (not on the first load, so the page reads from the top).
  useEffect(() => {
    if (moved.current) heading.current?.focus();
    moved.current = true;
  }, [stage, went]);

  if (!store.hydrated) return null;

  const moment = picked ? momentFor(picked, store) : null;
  // A link to a step that is not on this device: just ask.
  const current: Stage = stage !== "pick" && !moment ? "pick" : stage;

  const starred = RESCUE_PHRASES.filter((p) => store.savedPhrases.includes(p.id));
  const phrases = starred.length > 0 ? starred : READY_PHRASES.map((id) => RESCUE_PHRASES.find((p) => p.id === id)!).filter(Boolean);
  const rescue = phrases[phrase % phrases.length];

  const go = (to: Stage) => {
    setStage(to);
    window.scrollTo({ top: 0 });
  };
  const index = current === "pick" ? -1 : STAGES.indexOf(current);
  const back = () => go(index <= 0 ? "pick" : STAGES[index - 1]);
  const next = () => go(STAGES[index + 1]);

  const going = () => {
    if (!moment) return;
    act((s) => logEvent(s, "ready", new Date(), moment.id));
    setWent(true);
  };

  return (
    <div className="mx-auto max-w-[640px] px-4 pt-6 md:pt-10">
      {current === "pick" ? (
        <Link href="/" className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 font-semibold text-muted hover:text-ink">
          <ArrowLeft size={20} weight="bold" aria-hidden />
          Home
        </Link>
      ) : (
        <button type="button" onClick={back} className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 font-semibold text-muted hover:text-ink">
          <ArrowLeft size={20} weight="bold" aria-hidden />
          Back
        </button>
      )}
      <p className="mt-1 font-semibold text-muted">Right before</p>

      {current === "pick" ? (
        <>
          <h1 ref={heading} tabIndex={-1} className={`${TITLE} text-ink outline-none`}>
            What&apos;s coming up?
          </h1>
          <p className="mt-1 text-muted">About a minute to get ready. Pick the moment that is closest.</p>
          <div className="mt-6 grid gap-6">
            {ROOM_IDS.map((room) => {
              const RoomIcon = ROOM_ICON[room];
              const own = store.customSteps.filter((c) => c.room === room);
              return (
                <section key={room} aria-labelledby={`ready-${room}`}>
                  <h2 id={`ready-${room}`} className="flex items-center gap-2 text-xl text-ink">
                    <span aria-hidden className={`flex size-9 -rotate-6 items-center justify-center rounded-full border-[3px] border-die text-[#13262b] shadow-sticker ${ROOM_DISC[room]}`}>
                      <RoomIcon size={18} weight="bold" />
                    </span>
                    {words(ROOMS.find((r) => r.id === room)!.name, store.age)}
                  </h2>
                  <ul role="list" className="mt-3 grid list-none gap-2 p-0 sm:grid-cols-2">
                    {[
                      ...SITUATIONS.filter((s) => s.room === room).map((s) => ({ id: s.id, title: words(s.title, store.age) })),
                      ...own.map((c) => ({ id: c.id, title: c.text })),
                    ].map((m) => (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setPicked(m.id);
                            go("breathe");
                          }}
                          className="flex min-h-11 w-full items-center justify-between gap-2 rounded-2xl border border-line bg-surface px-4 py-3 text-left font-semibold text-ink transition-colors duration-[var(--dur-feedback)] hover:bg-surface-2 focus-visible:outline-3 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-3"
                        >
                          {m.title}
                          <ArrowRight size={18} weight="bold" aria-hidden className="shrink-0 text-muted" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </>
      ) : moment ? (
        <>
          <ol aria-label={`Step ${index + 1} of ${STAGES.length}`} className="mt-2 flex list-none gap-1.5 p-0">
            {STAGES.map((s, i) => (
              <li key={s} aria-hidden className={`h-2 flex-1 rounded-full ${i <= index ? "bg-accent" : "bg-surface-2"}`} />
            ))}
          </ol>
          <p className="mt-3 text-muted">
            {ROOM_LABEL[moment.room]}: {moment.title}
          </p>

          <PaperCard className="mt-3">
            {current === "breathe" ? (
              <>
                <h1 ref={heading} tabIndex={-1} className={`${CARD_TITLE} text-ink outline-none`}>
                  One slow breath first
                </h1>
                <p className="mt-1 text-muted">In as the light grows, slowly out as it shrinks. One or two is plenty.</p>
                <div className="mt-6">
                  <BreathingLantern reduce={reduce} />
                </div>
                <Button className="mt-6 w-full sm:w-auto" icon={ArrowRight} iconEnd onClick={next}>
                  Next
                </Button>
              </>
            ) : null}

            {current === "words" ? (
              <>
                <h1 ref={heading} tabIndex={-1} className={`${CARD_TITLE} text-ink outline-none`}>
                  Your words
                </h1>
                <p className="mt-1 text-muted">Pick one, or use your own. You only need the first few words.</p>
                {moment.ideas.length > 0 ? (
                  <ul role="list" className="mt-4 grid list-none gap-2 p-0">
                    {moment.ideas.map((i) => (
                      <li key={i} className="rounded-2xl bg-surface-2 px-4 py-2">
                        <SpokenLine role="narrator" text={i} className="py-1.5 text-lg font-semibold text-ink" />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 rounded-2xl bg-surface-2 p-4 text-lg font-semibold text-ink">{moment.title}</p>
                )}
                <p className="mt-5 text-ink">Say it once, quietly, if you can. It helps your mouth know the way.</p>
                <div className="mt-3">
                  <SayAndListen label="Say it once" variant="secondary" />
                </div>
                <Button className="mt-6 w-full sm:w-auto" icon={ArrowRight} iconEnd onClick={next}>
                  Next
                </Button>
              </>
            ) : null}

            {current === "rescue" && rescue ? (
              <>
                <h1 ref={heading} tabIndex={-1} className={`${CARD_TITLE} text-ink outline-none`}>
                  If your mind goes blank
                </h1>
                <p className="mt-1 text-muted">Keep this one in your pocket. Everyone needs a moment sometimes.</p>
                <div className="mt-4 rounded-card border-[1.5px] border-line bg-surface-2 p-5" aria-live="polite">
                  <SpokenLine
                    role="narrator"
                    text={words(rescue.text, store.age)}
                    className="font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] font-bold leading-tight text-ink"
                  >
                    &ldquo;{words(rescue.text, store.age)}&rdquo;
                  </SpokenLine>
                  <p className="mt-2 text-muted">{words(rescue.when, store.age)}</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button icon={ArrowRight} iconEnd onClick={next}>
                    Next
                  </Button>
                  {phrases.length > 1 ? (
                    <Button variant="secondary" icon={ArrowsClockwise} onClick={() => setPhrase((n) => n + 1)}>
                      Another phrase
                    </Button>
                  ) : null}
                </div>
              </>
            ) : null}

            {current === "go" && !went ? (
              <>
                <h1 ref={heading} tabIndex={-1} className={`${CARD_TITLE} text-ink outline-none`}>
                  You are ready enough
                </h1>
                <div className="mt-3 grid gap-3">
                  <SpokenLine role="narrator" text={words(READY_LINES.wobbly, store.age)} autoPlay className="text-lg text-ink" />
                  <div className="rounded-2xl bg-surface-2 px-4 py-3">
                    <p className="text-muted">Your moment</p>
                    <p className="font-semibold text-ink">{moment.mission}</p>
                  </div>
                </div>
                <Button className="mt-6 w-full sm:w-auto" icon={Flag} onClick={going}>
                  I&apos;m going
                </Button>
                <p className="mt-3 text-muted">It is fine to change your mind. Getting ready still counts.</p>
              </>
            ) : null}

            {current === "go" && went ? (
              <>
                <h1 ref={heading} tabIndex={-1} className={`${CARD_TITLE} text-ink outline-none`}>
                  Go for it
                </h1>
                <div className="mt-3">
                  <SpokenLine role="narrator" text={words(READY_LINES.go, store.age)} autoPlay className="text-lg text-ink" />
                </div>
                <p className="mt-3 flex items-center gap-2 text-ink">
                  <Check size={20} weight="bold" aria-hidden className="text-accent-text" />
                  Getting ready counts as a brave day.
                </p>
                <p className="mt-4 text-ink">Afterwards, come back and say how it went. Trying counts just the same.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <ButtonLink href={`/step/${moment.id}?level=6`} variant="secondary" icon={ArrowRight} iconEnd>
                    Say how it went
                  </ButtonLink>
                  <ButtonLink href="/" variant="secondary" icon={House}>
                    Home
                  </ButtonLink>
                </div>
              </>
            ) : null}
          </PaperCard>
        </>
      ) : null}
    </div>
  );
}

function momentFor(id: string, store: ReturnType<typeof useCourage>): Moment | null {
  const s = situationById(id);
  if (s) {
    return { id, room: s.room, title: words(s.title, store.age), ideas: s.ideas.map((i) => words(i, store.age)), mission: words(s.mission, store.age) };
  }
  const own = store.customSteps.find((c) => c.id === id);
  return own ? { id, room: own.room, title: own.text, ideas: [], mission: own.text } : null;
}
