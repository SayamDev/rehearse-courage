"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Leaf, PawPrint, type Icon } from "@phosphor-icons/react";
import { act } from "@/lib/store";
import { setAge, setCompanion, setHardThings } from "@/lib/state";
import { AGE_OPTIONS, TOTAL_STEPS, hardThingOptions, nextStep, prevStep, toggleHardThing } from "@/lib/onboarding";
import { SPECIES } from "@/lib/companion";
import type { AgeBand, HardThing, Species } from "@/lib/types";
import { SceneArt } from "@/components/scene/scene-art";
import { Companion } from "@/components/scene/companion";
import { PaperCard } from "@/components/ui/paper-card";
import { Button } from "@/components/ui/button";

// The heading is focused programmatically (tabIndex=-1) purely to move the
// screen reader's position, not as a visible focus target. outline-none
// suppresses that ring; it reliably beats globals.css's :focus-visible rule
// because that rule lives in Tailwind's "base" cascade layer, below
// "utilities" (see globals.css). Real controls (buttons, links, the input)
// are untouched and keep their normal focus-visible ring.
const headingClass = "text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] text-ink outline-none";

const COMPANION_ICONS: Partial<Record<Species, Icon>> = { hedgehog: PawPrint, fox: Leaf };

const speciesName = (id: Species) => SPECIES.find((s) => s.id === id)?.name ?? id;

function PlaceholderCompanion({ icon: IconCmp }: { icon: Icon }) {
  return (
    <div
      role="img"
      aria-hidden
      className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-white bg-surface-2 text-muted shadow-card"
    >
      <IconCmp size={40} weight="regular" aria-hidden />
    </div>
  );
}

/**
 * Four calm screens (age, what feels hard, companion, name) shown one at a
 * time over the home-class art at night. Nothing here is required: every
 * step can be skipped, and the whole flow can be left half-done (see
 * page.tsx's redirect, which only cares whether a companion exists yet).
 */
export function FirstVisit() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [age, setAgeDraft] = useState<AgeBand | null>(null);
  const [hardThings, setHardDraft] = useState<HardThing[]>([]);
  const [species, setSpeciesDraft] = useState<Species>("firefly");
  const [name, setNameDraft] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  function advance() {
    setStep((s) => nextStep(s));
  }

  function back() {
    setStep((s) => prevStep(s));
  }

  function finish() {
    act((s) => setCompanion(setHardThings(setAge(s, age), hardThings), species, name));
    router.push("/");
  }

  function skip() {
    if (step >= TOTAL_STEPS) {
      finish();
      return;
    }
    advance();
  }

  return (
    <div className="relative mx-auto max-w-[720px] px-4 pb-16 pt-6 sm:pt-14">
      {/* Shorter than other screens' hero art on phones: /start has no bottom
          nav to absorb Panic now, so the tallest step (companion picker)
          needs to fit above Panic's fixed corner without scrolling past it;
          see the overlap check in the fix-1 screenshots/report. */}
      <div className="relative h-[20vh] min-h-[140px] overflow-hidden rounded-card sm:h-[320px]">
        {/* object-top: this frame is wider than the art's own aspect ratio, so
            object-cover's default center crop cuts the school and flag off
            the top at wide widths. Anchoring to the top keeps them in frame
            at every width; only the waterfall/lower island is ever trimmed. */}
        <SceneArt room="class" crop="wide" priority className="object-top" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in srgb, var(--chrome) 68%, transparent), color-mix(in srgb, var(--chrome) 30%, transparent) 65%, var(--canvas) 96%)",
          }}
        />
      </div>

      <PaperCard className="relative -mt-16 sm:-mt-24">
        <p aria-live="polite" className="mb-4 text-sm text-muted">
          {step} of {TOTAL_STEPS}
        </p>

        {step > 1 ? (
          <button
            type="button"
            onClick={back}
            className="mb-3 -ml-2 flex h-11 items-center gap-1 rounded-full px-2 text-sm font-semibold text-muted transition-colors duration-[var(--dur-ui)] ease-[var(--ease-out)] hover:text-ink focus-visible:outline-3 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-3"
          >
            <ArrowLeft size={18} weight="regular" aria-hidden />
            Back
          </button>
        ) : null}

        {step === 1 ? (
          <StepAge headingRef={headingRef} age={age} onPick={(value) => { setAgeDraft(value); advance(); }} />
        ) : null}
        {step === 2 ? (
          <StepHardThings
            headingRef={headingRef}
            hardThings={hardThings}
            onToggle={(id) => setHardDraft((prev) => toggleHardThing(prev, id))}
            onContinue={advance}
          />
        ) : null}
        {step === 3 ? (
          <StepCompanion
            headingRef={headingRef}
            species={species}
            onPick={(value) => { setSpeciesDraft(value); advance(); }}
          />
        ) : null}
        {step === 4 ? (
          <StepName headingRef={headingRef} species={species} name={name} onNameChange={setNameDraft} onFinish={finish} />
        ) : null}

        <button
          type="button"
          onClick={skip}
          className="mt-5 flex h-11 items-center rounded-full px-2 text-sm font-semibold text-muted transition-colors duration-[var(--dur-ui)] ease-[var(--ease-out)] hover:text-ink focus-visible:outline-3 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-3"
        >
          Skip
        </button>
      </PaperCard>
    </div>
  );
}

function StepAge({
  headingRef,
  age,
  onPick,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  age: AgeBand | null;
  onPick: (value: AgeBand) => void;
}) {
  return (
    <div>
      <h1 ref={headingRef} tabIndex={-1} className={headingClass}>
        How old are you?
      </h1>
      <p className="mt-2 text-muted">This keeps the app right for you. Skip if you would rather not say.</p>
      <div className="mt-5 flex flex-col gap-2">
        {AGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={age === option.value}
            onClick={() => onPick(option.value)}
            className="flex min-h-11 items-center justify-between rounded-full border border-line bg-surface-2 px-5 py-3 text-left font-semibold text-ink transition-colors duration-[var(--dur-ui)] ease-[var(--ease-out)] hover:bg-line/50 active:bg-line/70 focus-visible:outline-3 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-3"
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="mt-5 text-sm text-muted">Everything stays on this device. No account.</p>
    </div>
  );
}

function StepHardThings({
  headingRef,
  hardThings,
  onToggle,
  onContinue,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  hardThings: HardThing[];
  onToggle: (id: HardThing) => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <h1 ref={headingRef} tabIndex={-1} className={headingClass}>
        What feels hard right now?
      </h1>
      <p className="mt-2 text-muted">Choose as many as fit. Skip if none feel right.</p>
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="What feels hard right now">
        {hardThingOptions().map((option) => {
          const pressed = hardThings.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={pressed}
              onClick={() => onToggle(option.id)}
              className={`flex min-h-11 items-center rounded-full border px-4 py-2.5 font-semibold transition-colors duration-[var(--dur-ui)] ease-[var(--ease-out)] focus-visible:outline-3 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-3 ${
                pressed
                  ? "border-transparent bg-chrome text-on-chrome"
                  : "border-line bg-surface-2 text-ink hover:bg-line/50 active:bg-line/70"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <Button variant="primary" className="mt-6 w-full sm:w-auto" onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
}

function StepCompanion({
  headingRef,
  species,
  onPick,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  species: Species;
  onPick: (value: Species) => void;
}) {
  return (
    <div>
      <h1 ref={headingRef} tabIndex={-1} className={headingClass}>
        Pick a companion
      </h1>
      <p className="mt-2 text-muted">They will keep you company while you practise. You can change this any time.</p>
      <div className="mt-5 flex flex-col gap-2">
        {SPECIES.map((option) => {
          const selected = species === option.id;
          const IconCmp = COMPANION_ICONS[option.id];
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onPick(option.id)}
              className={`flex min-h-11 items-center gap-4 rounded-card border px-4 py-3 text-left transition-colors duration-[var(--dur-ui)] ease-[var(--ease-out)] focus-visible:outline-3 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-3 ${
                selected ? "border-amber bg-surface-2" : "border-line bg-surface-2/60 hover:bg-surface-2"
              }`}
            >
              {IconCmp ? <PlaceholderCompanion icon={IconCmp} /> : <Companion species="firefly" stage="hiding" size={96} />}
              <span>
                <span className={`block font-semibold ${selected ? "text-amber" : "text-ink"}`}>{option.name}</span>
                {IconCmp ? <span className="block text-sm text-muted">Grows up with you</span> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepName({
  headingRef,
  species,
  name,
  onNameChange,
  onFinish,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  species: Species;
  name: string;
  onNameChange: (value: string) => void;
  onFinish: () => void;
}) {
  const placeholder = speciesName(species);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onFinish();
      }}
    >
      <h1 ref={headingRef} tabIndex={-1} className={headingClass}>
        Give them a name
      </h1>
      <p className="mt-2 text-muted">Skip to keep the name {placeholder}.</p>
      <label htmlFor="companion-name" className="mb-2 mt-5 block font-semibold text-ink">
        Name
      </label>
      <input
        id="companion-name"
        type="text"
        value={name}
        maxLength={24}
        placeholder={placeholder}
        onChange={(e) => onNameChange(e.target.value)}
        className="h-12 w-full rounded-full border border-line bg-surface-2 px-5 text-ink placeholder:text-muted focus-visible:outline-3 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-3"
      />
      <Button type="submit" variant="primary" className="mt-6 w-full sm:w-auto">
        Let&apos;s go
      </Button>
    </form>
  );
}
