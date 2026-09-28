"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, MapTrifold } from "@phosphor-icons/react";
import { BADGES } from "@/lib/achievements";
import type { Stage } from "@/lib/companion";
import { ROOM_LABEL } from "@/lib/rooms";
import { headlineBadge, type StepResult } from "@/lib/step";
import { useCourage } from "@/lib/store";
import type { RoomId } from "@/lib/types";
import { Companion } from "@/components/scene/companion";
import { ProgressTrack } from "@/components/scene/progress-track";
import { Lottie } from "@/components/ui/lottie";
import { ButtonLink } from "@/components/ui/button";
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
export function StepDone({ result, room, title }: { result: StepResult; room: RoomId; title: string }) {
  const store = useCourage();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const lead = headlineBadge(result.newBadges);
  const heading = lead ? `${badgeTitle(lead)}.` : "You had a go.";
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
            <Companion species={store.companion.species} stage={result.stageAfter} size={64} />
          </div>
        ) : null}
        <Lottie src="/lottie/courage.json" themed still={!store.settings.confetti} className="-ml-2 aspect-[640/260] w-full max-w-[440px]" />
        <ProgressTrack situationId={result.situationId} className="mx-auto mt-4 max-w-[420px]" />
        <div className="mt-6 flex items-center gap-4">
          {result.newBadges.length > 0 ? (
            <div className="flex shrink-0 -space-x-6">
              {result.newBadges.map((id) => (
                <Sticker key={id} badgeId={id} earned size={72} eager />
              ))}
            </div>
          ) : null}
          <h1 ref={headingRef} tabIndex={-1} className={`${TITLE} text-ink outline-none`}>
            {heading}
          </h1>
        </div>

        <p className="sr-only">That took courage.</p>
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

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <ButtonLink href="/map" icon={MapTrifold}>
            Back to the map
          </ButtonLink>
          {result.level === 6 ? (
            <ButtonLink href={`/room/${room}`} variant="secondary" icon={ArrowRight} iconEnd>
              Back to the island
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
