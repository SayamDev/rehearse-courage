"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Heart, MapTrifold, Plant, Rocket } from "@phosphor-icons/react";
import { BADGES } from "@/lib/achievements";
import type { Stage } from "@/lib/companion";
import { ROOM_LABEL } from "@/lib/rooms";
import { allPoints, EVENT_POINTS } from "@/lib/courage";
import { FEEL_LABEL } from "@/lib/journey";
import { rankFor, rankLabel } from "@/lib/rank";
import { checkCrisis } from "@/lib/safety/crisis";
import { MAX_PROUD_NOTE, saveProud } from "@/lib/state";
import { headlineBadge, type StepResult } from "@/lib/step";
import { act, useCourage } from "@/lib/store";
import { FEELINGS, type Feeling, type RoomId } from "@/lib/types";
import { ShareButton } from "@/components/share/share-button";
import { LevelSticker } from "@/components/ui/level-card";
import { Companion } from "@/components/scene/companion";
import { ProgressTrack } from "@/components/scene/progress-track";
import { Lottie } from "@/components/ui/lottie";
import { useReadAloud } from "@/components/voice/spoken-line";
import { FOR_REAL_LINE, STEP_DONE_LINE } from "@/lib/content/body";
import { Button, ButtonLink } from "@/components/ui/button";
import { PaperCard } from "@/components/ui/paper-card";
import { Sticker } from "@/components/ui/sticker";

const TITLE = "text-[clamp(1.75rem,1.2rem+2vw,2.75rem)]";

const STAGE_NEWS: Record<Stage, string> = {
  hiding: "is curled up with their lantern",
  peeking: "is peeking out now",
  waving: "is waving now",
  speaking: "is standing tall now",
};

const badgeTitle = (id: string) => BADGES.find((b) => b.id === id)?.title ?? id;

/** "You spoke for 14 seconds. Last time: 6." Only when seconds were measured; never a judgement of how. */
export function secondsLine(seconds: number | null, lastSeconds: number | null): string | null {
  if (seconds === null) return null;
  const now = `You spoke for ${seconds} second${seconds === 1 ? "" : "s"}.`;
  return lastSeconds === null ? now : `${now} Last time: ${lastSeconds}.`;
}

/**
 * Step complete, shown in place of the step once it is saved: the teal
 * check Lottie with the companion, the six-step track with the new step
 * lit, then the words. Celebrates
 * the attempt, never the quality: heading "You had a go." (or the first
 * new badge's title with a full stop), "That took courage.", seconds
 * spoken when measured, points earned, stickers for new badges, and the
 * companion's news when it grew. The heading takes focus so screen
 * readers hear the result straight away.
 */
export function StepDone({
  result,
  room,
  title,
  outcome = "did",
}: {
  result: StepResult;
  room: RoomId;
  title: string;
  /** Step 6: did it, or tried (which counts just the same). */
  outcome?: "did" | "tried";
}) {
  const store = useCourage();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Said out loud too, once, when read-aloud is on.
  const read = useReadAloud();
  useEffect(() => {
    read(result.level === 6 ? FOR_REAL_LINE : STEP_DONE_LINE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lead = headlineBadge(result.newBadges);
  // Step 6 is the real thing: the biggest moment in the app gets its own celebration.
  const forReal = result.level === 6;
  // "I tried" gets the courage animation and its own words; the for-real animation says "You did it".
  const didIt = forReal && outcome === "did";
  const heading = didIt ? "You did it for real." : forReal ? "You tried it for real." : lead ? `${badgeTitle(lead)}.` : "You had a go.";
  const levelUp = result.levelAfter > result.levelBefore;
  const seconds = secondsLine(result.seconds, result.lastSeconds);
  const grew = result.stageAfter !== result.stageBefore && store.companion;

  return (
    <div className="mx-auto max-w-[640px] px-4 pt-6 md:pt-10">
      <p className="text-muted">
        {ROOM_LABEL[room]} step <span className="tabular">{result.level}</span>: {title}
      </p>

      <PaperCard className="relative mt-4">
        {store.companion ? (
          <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
            <Companion species={store.companion.species} stage={forReal ? "speaking" : result.stageAfter} size={forReal ? 84 : 64} />
          </div>
        ) : null}
        {didIt ? (
          <Lottie src="/lottie/for-real.json" themed still={!store.settings.confetti} className="-ml-2 aspect-[720/360] w-full max-w-[520px]" />
        ) : (
          <Lottie src="/lottie/courage.json" themed still={!store.settings.confetti} className="-ml-2 aspect-[640/260] w-full max-w-[440px]" />
        )}
        <ProgressTrack situationId={result.situationId} className="mx-auto mt-4 max-w-[420px]" />
        <div className="mt-6 flex items-center gap-4">
          {result.newBadges.length > 0 ? (
            <div className="flex shrink-0 -space-x-6">
              {result.newBadges.map((id) => (
                <Sticker key={id} badgeId={id} earned size={72} eager />
              ))}
            </div>
          ) : null}
          {/* Step 6: the animation already says it in big type, so the heading is for screen readers only. */}
          <h1 ref={headingRef} tabIndex={-1} className={didIt ? "sr-only" : `${TITLE} text-ink outline-none`}>
            {heading}
          </h1>
        </div>

        {forReal ? (
          <div className="mt-3 rounded-card bg-[color-mix(in_srgb,var(--sun)_20%,var(--surface))] p-4">
            <p className="text-lg font-semibold text-ink">
              {didIt ? "That was the real thing: the biggest step there is." : "Trying the real thing is the biggest step there is, however it went."}
            </p>
            <p className="mt-1 text-ink">Take a moment to notice how it felt. Next time it will be a little easier.</p>
          </div>
        ) : (
          <p className="sr-only">That took courage.</p>
        )}
        {seconds ? <p className="tabular mt-1 text-ink">{seconds}</p> : null}
        <p className="tabular mt-3 font-semibold text-ink">+{result.points} courage points</p>
        {result.newBadges.length > 1 ? (
          <p className="mt-1 text-muted">New badges: {result.newBadges.map(badgeTitle).join(", ")}.</p>
        ) : null}
        {grew ? (
          <p className="mt-3 text-ink">
            {store.companion?.name} {STAGE_NEWS[result.stageAfter]}.
          </p>
        ) : null}
        {levelUp ? <LevelUp /> : null}

        {forReal ? <Reflect situationId={result.situationId} at={result.at} title={title} outcome={outcome} /> : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <ButtonLink href="/map" icon={MapTrifold}>
            Back to practice areas
          </ButtonLink>
          {result.level === 6 ? (
            <ButtonLink href={`/room/${room}`} variant="secondary" icon={ArrowRight} iconEnd>
              Back to the area
            </ButtonLink>
          ) : (
            <ButtonLink href={`/step/${result.situationId}?level=${result.nextLevel}`} variant="secondary" icon={ArrowRight} iconEnd>
              One more step
            </ButtonLink>
          )}
        </div>
      </PaperCard>
    </div>
  );
}

/** Reaching a new courage level: the number sticker, its name, and a way to share it. */
function LevelUp() {
  const store = useCourage();
  // The store already holds this step, so this is the new level.
  const rank = rankFor(allPoints(store));
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-card bg-surface-2 p-4">
      <LevelSticker level={rank.level} size={48} />
      <p className="min-w-0 flex-1 basis-40">
        <span className="block text-sm font-semibold text-muted">New courage level</span>
        <span className="block font-display text-lg font-bold leading-tight text-ink">{rankLabel(rank)}</span>
      </p>
      <ShareButton
        label="Share"
        card={{ kicker: "I reached a new courage level", title: rankLabel(rank), line: "Small steps. Real courage.", art: { type: "number", n: rank.level } }}
      />
    </div>
  );
}

/**
 * After a real-life try: how did it feel (three gentle choices, all fine)
 * and, if they want, one line for their proud moments. Kept on this
 * device. The note is checked for support needs like anything typed.
 */
function Reflect({ situationId, at, title, outcome }: { situationId: string; at: string; title: string; outcome: "did" | "tried" }) {
  const router = useRouter();
  const [feel, setFeel] = useState<Feeling | null>(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const noteId = useId();
  const savedRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (saved) savedRef.current?.focus();
  }, [saved]);

  const save = () => {
    if (note.trim() && checkCrisis(note).crisis) {
      router.push(`/help?crisis=1&from=${encodeURIComponent(`/step/${situationId}?level=6`)}`);
      return;
    }
    act((s) => saveProud(s, { situationId, at, outcome, feel, note }));
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="mt-6 border-t border-line pt-5">
        <p ref={savedRef} tabIndex={-1} className="flex items-center gap-2 font-semibold text-ink outline-none">
          <Heart size={20} weight="bold" aria-hidden className="text-accent-text" />
          Saved to your proud moments.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <ShareButton
            card={{
              kicker: outcome === "did" ? "I did it for real" : "I tried it for real",
              title,
              line: feel ? `${FEEL_LABEL[feel]}.` : "Small steps. Real courage.",
              art: { type: "icon", icon: Heart, ink: "bg-coral" },
            }}
          />
          <Link href="/journey" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-accent-text hover:underline">
            See your journey
            <ArrowRight size={18} weight="bold" aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section aria-labelledby={`${noteId}-heading`} className="mt-6 border-t border-line pt-5">
      <h2 id={`${noteId}-heading`} className="text-xl text-ink">
        How did it feel?
      </h2>
      <p className="text-muted">If you want to say. Every answer is a good one.</p>
      <div role="group" aria-label="How did it feel?" className="mt-3 flex flex-wrap gap-2">
        {FEELINGS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={feel === f}
            onClick={() => setFeel(feel === f ? null : f)}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 font-semibold transition-colors duration-[var(--dur-feedback)] focus-visible:outline-3 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-3 ${
              feel === f ? "border-ink bg-surface-2 text-ink outline outline-2 outline-ink" : "border-line bg-surface text-ink hover:bg-surface-2"
            }`}
          >
            {feel === f ? <Check size={16} weight="bold" aria-hidden /> : null}
            {FEEL_LABEL[f]}
          </button>
        ))}
      </div>
      <label htmlFor={noteId} className="mt-4 block font-semibold text-ink">
        A line for your proud moments (optional)
      </label>
      <p id={`${noteId}-hint`} className="text-muted">
        What you did, or how it went. Kept only on this device.
      </p>
      <textarea
        id={noteId}
        aria-describedby={`${noteId}-hint`}
        rows={2}
        maxLength={MAX_PROUD_NOTE}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="mt-2 block w-full rounded-2xl border border-line bg-surface px-4 py-3 text-ink placeholder:text-muted focus-visible:border-ink"
      />
      <Button variant="secondary" icon={Heart} onClick={save} className="mt-4">
        Save to my proud moments
      </Button>
    </section>
  );
}

/**
 * Not yet, at step 6: said kindly, and it still counts (a brave day and a
 * few points). Offers a smaller way in, Right before for when the moment
 * comes, and the way back.
 */
export function NotYet({ situationId, room, title }: { situationId: string; room: RoomId; title: string }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);
  return (
    <div className="mx-auto max-w-[640px] px-4 pt-6 md:pt-10">
      <p className="text-muted">
        {ROOM_LABEL[room]} step <span className="tabular">6</span>: {title}
      </p>
      <PaperCard className="mt-4">
        <span aria-hidden className="flex size-14 -rotate-6 items-center justify-center rounded-full border-[3px] border-die bg-lime text-[#13262b] shadow-sticker">
          <Plant size={28} weight="bold" />
        </span>
        <h1 ref={headingRef} tabIndex={-1} className={`mt-4 ${TITLE} text-ink outline-none`}>
          Not yet is fine.
        </h1>
        <p className="mt-2 text-lg text-ink">Being honest about today takes courage too. The real moment will still be there when you are ready.</p>
        <p className="tabular mt-3 font-semibold text-ink">+{EVENT_POINTS.notYet?.points ?? 5} courage points</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <ButtonLink href={`/step/${situationId}?level=5`} icon={ArrowRight} iconEnd>
            Practise step 5 again
          </ButtonLink>
          <ButtonLink href={`/ready?s=${encodeURIComponent(situationId)}`} variant="secondary" icon={Rocket}>
            Get ready for the moment
          </ButtonLink>
        </div>
        <Link href={`/room/${room}`} className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-semibold text-accent-text hover:underline">
          Back to the area
          <ArrowRight size={18} weight="bold" aria-hidden />
        </Link>
      </PaperCard>
    </div>
  );
}
