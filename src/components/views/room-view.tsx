"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Plus } from "@phosphor-icons/react";
import { LEVELS, MAX_CUSTOM } from "@/lib/ladder";
import { defaultStepId, furthestLine, nextLine, ROOM_LABEL, roomSteps, type RoomStep } from "@/lib/rooms";
import { cropAspect, sceneCrop, SCENES } from "@/lib/scenes";
import { addCustomStep } from "@/lib/state";
import { act, useCourage } from "@/lib/store";
import type { Level, RoomId } from "@/lib/types";
import { PathStones } from "@/components/scene/path-stones";
import { Button, ButtonLink } from "@/components/ui/button";
import { PaperCard } from "@/components/ui/paper-card";

const TITLE = "text-[clamp(1.75rem,1.2rem+2vw,2.75rem)]";
const CARD_TITLE = "text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)]";
const EMPTY = "Write a few words first.";

/** One selectable step row. A toggle button (aria-pressed) so the chosen one is announced, not shown by colour alone. */
function StepRow({ step, selected, onSelect }: { step: RoomStep; selected: boolean; onSelect: () => void }) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className={`flex min-h-11 w-full flex-col items-start rounded-2xl border px-4 py-3 text-left transition-colors duration-[var(--dur-feedback)] ease-[var(--ease-out)] ${
          selected
            ? "border-ink bg-surface-2 outline outline-2 outline-ink"
            : "border-line bg-surface hover:bg-surface-2 active:bg-line/60"
        } focus-visible:outline-3 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-3`}
      >
        <span className="font-semibold text-ink">{step.title}</span>
        <span className="tabular text-muted">
          {furthestLine(step.highest)}. {nextLine(step.highest)}
        </span>
      </button>
    </li>
  );
}

/**
 * A room ("/room/[id]"): its scene with the stones for the chosen step,
 * the list of steps in the room (tap to choose which one the stones show),
 * one primary button to practise it, and "Your own steps" with a form to
 * add one (id="add", linked from Home and the map when every path is done).
 */
export function RoomView({ room }: { room: RoomId }) {
  const store = useCourage();
  const steps = roomSteps(store, room);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [chosenLevel, setChosenLevel] = useState<Level | null>(null);
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");
  const inputId = useId();
  const messageId = useId();
  const addRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Content renders only after hydration, so the browser's own jump to
  // #add happens before the section exists; do it once it does.
  useEffect(() => {
    if (store.hydrated && window.location.hash === "#add") {
      addRef.current?.scrollIntoView({ block: "start" });
    }
  }, [store.hydrated]);

  const current = steps.find((s) => s.id === chosenId) ?? steps.find((s) => s.id === defaultStepId(steps));
  const level: Level = chosenLevel ?? current?.next ?? 1;

  // Bring the stones and card into view so choosing a row visibly does
  // something (they are off screen when the list is reached on a phone).
  const choose = (id: string) => {
    setChosenId(id);
    setChosenLevel(null);
    const reduce =
      document.documentElement.dataset.motion === "reduce" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sceneRef.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  };

  const add = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) {
      setMessage(EMPTY);
      inputRef.current?.focus();
      return;
    }
    act((s) => addCustomStep(s, room, draft, new Date()));
    setDraft("");
    setMessage("Added to your own steps.");
  };

  const builtIn = steps.filter((s) => !s.custom);
  const own = steps.filter((s) => s.custom);

  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-6 md:pt-10">
      <Link
        href="/map"
        className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-ink hover:underline"
      >
        <ArrowLeft size={22} weight="regular" aria-hidden />
        Map
      </Link>
      <h1 className={`mt-2 ${TITLE} text-ink`}>{ROOM_LABEL[room]}</h1>

      {store.hydrated && current ? (
        <>
          {/* Capped by height, keeping the crop's aspect so stones line up. */}
          <div
            ref={sceneRef}
            className="mx-auto mt-5 max-w-[720px] scroll-mt-4"
            style={{ width: `min(100%, calc(${cropAspect(SCENES[room], sceneCrop(SCENES[room], "island"))} * max(40dvh, 260px)))` }}
          >
            <PathStones room={room} situationId={current.id} onPick={setChosenLevel} priority />
          </div>

          <PaperCard className="relative mx-auto -mt-6 max-w-[560px] md:-mt-10">
            {/* Announced when a row or stone changes what the card shows. */}
            <div aria-live="polite">
              <p className="text-muted">
                Step <span className="tabular">{level}</span> of 6
              </p>
              <h2 className={`mt-1 ${CARD_TITLE} text-ink`}>{current.title}</h2>
              <p className="mt-2 text-ink">{LEVELS[level - 1].name}</p>
            </div>
            <ButtonLink href={`/step/${current.id}?level=${level}`} className="mt-6" icon={ArrowRight} iconEnd>
              {level === current.next ? "Continue" : `Practise step ${level}`}
            </ButtonLink>
            <p className="mt-4 text-muted">Choose a stone to practise a different step.</p>
          </PaperCard>

          <section aria-labelledby="steps-heading" className="mx-auto mt-10 max-w-[720px]">
            <h2 id="steps-heading" className="text-2xl text-ink">
              Steps on this island
            </h2>
            <ul role="list" className="mt-4 grid list-none gap-3 p-0">
              {builtIn.map((s) => (
                <StepRow key={s.id} step={s} selected={s.id === current.id} onSelect={() => choose(s.id)} />
              ))}
            </ul>
          </section>

          <section
            id="add"
            ref={addRef}
            aria-labelledby="own-heading"
            className="mx-auto mt-10 max-w-[720px] scroll-mt-6"
          >
            <h2 id="own-heading" className="text-2xl text-ink">
              Your own steps
            </h2>
            {own.length > 0 ? (
              <ul role="list" className="mt-4 grid list-none gap-3 p-0">
                {own.map((s) => (
                  <StepRow key={s.id} step={s} selected={s.id === current.id} onSelect={() => choose(s.id)} />
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-muted">Something from your own life you want to practise.</p>
            )}

            <form onSubmit={add} className="mt-5" noValidate>
              <label htmlFor={inputId} className="block font-semibold text-ink">
                Add your own step
              </label>
              <p id={`${inputId}-hint`} className="text-muted">
                For example: ask the librarian for a book. Up to {MAX_CUSTOM} characters.
              </p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <input
                  id={inputId}
                  ref={inputRef}
                  aria-invalid={message === EMPTY}
                  value={draft}
                  maxLength={MAX_CUSTOM}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    if (message) setMessage("");
                  }}
                  aria-describedby={`${inputId}-hint ${messageId}`}
                  className="min-h-[52px] flex-1 rounded-2xl border border-line bg-surface px-4 text-ink placeholder:text-muted focus-visible:border-ink"
                />
                <Button type="submit" variant="secondary" icon={Plus}>
                  Add step
                </Button>
              </div>
              <p id={messageId} role="status" className="mt-2 min-h-[1.55em] text-ink">
                {message}
              </p>
            </form>
          </section>
        </>
      ) : null}
    </div>
  );
}
