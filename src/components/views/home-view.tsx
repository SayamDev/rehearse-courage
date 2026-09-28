"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { stageFor, type Stage } from "@/lib/companion";
import { missionsDone } from "@/lib/courage";
import { homeModel } from "@/lib/home";
import { ROOM_LABEL } from "@/lib/rooms";
import { situationById, SITUATIONS } from "@/lib/content/situations";
import { useCourage } from "@/lib/store";
import type { RoomId } from "@/lib/types";
import { Companion } from "@/components/scene/companion";
import { ProgressTrack } from "@/components/scene/progress-track";
import { ButtonLink } from "@/components/ui/button";
import { PaperCard } from "@/components/ui/paper-card";
import { StatsPill } from "@/components/ui/stats-pill";

/** Each island's sticker colour, used for its label wherever the room is named. */
export const ROOM_STICKER: Record<RoomId, string> = { class: "sticker-sky", friends: "sticker-grape", presenting: "sticker-coral" };

/** What the companion is doing, growing with courage points. */
const STAGE_LINE: Record<Stage, string> = {
  hiding: "is curled up with their lantern. Every step helps them come out.",
  peeking: "is peeking out. Keep going.",
  waving: "is waving at you.",
  speaking: "is standing tall, like you.",
};

/**
 * Home ("/"): a greeting, today's one step (with its six-step track and one
 * Start button), the companion, and this week's stats. Renders nothing until the store has
 * hydrated and a companion exists (RedirectIfNew sends first-time visitors
 * to /start).
 */
export function HomeView() {
  const store = useCourage();

  if (!store.hydrated || !store.companion) return null;

  const model = homeModel(store, new Date());
  const stage = stageFor(model.points, missionsDone(store.records));
  const situationId = model.done ? SITUATIONS[0].id : model.situationId;
  const room: RoomId = situationById(situationId)?.room ?? "class";

  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-6 md:px-8 md:pt-12">
      <h1 className="text-[clamp(2rem,1.3rem+2.6vw,3.25rem)] text-ink">
        {store.name ? <>Hi {store.name}, today&apos;s one step</> : <>Today&apos;s one step</>}
      </h1>
      <p className="mt-2 max-w-[48ch] text-muted">One small step is enough for today. Go at your own pace.</p>

      <div className="mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
        <PaperCard>
          {model.done ? (
            <>
              <h2 className="text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] text-ink">You have walked every path.</h2>
              <p className="mt-2 text-muted">Add a step from your own life and keep going.</p>
              <ButtonLink href="/room/class#add" className="mt-6" icon={ArrowRight} iconEnd>
                Add your own step
              </ButtonLink>
            </>
          ) : (
            <>
              <span className={`sticker ${ROOM_STICKER[room]}`}>{ROOM_LABEL[room]}</span>
              <h2 className="mt-4 text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] text-ink">{model.title}</h2>
              <ProgressTrack situationId={model.situationId} className="mt-6" />
              <p className="mt-4 text-ink">
                <span className="font-semibold">
                  Step <span className="tabular">{model.level}</span> of 6:
                </span>{" "}
                {model.levelName}
              </p>
              <ButtonLink href={`/step/${model.situationId}?level=${model.level}`} className="mt-6 w-full sm:w-auto" icon={ArrowRight} iconEnd>
                Start
              </ButtonLink>
            </>
          )}
        </PaperCard>

        <div className="order-first flex items-center gap-5 lg:order-none lg:flex-col lg:gap-4">
          <div className="shrink-0 lg:hidden">
            <Companion species={store.companion.species} stage={stage} size={112} />
          </div>
          <div className="hidden lg:block">
            <Companion species={store.companion.species} stage={stage} size={240} />
          </div>
          <p className="max-w-[26ch] text-ink lg:text-center">
            <span className="font-display text-xl font-bold">{store.companion.name}</span>{" "}
            <span className="text-muted">{STAGE_LINE[stage]}</span>
          </p>
        </div>
      </div>

      <div className="mt-10">
        <StatsPill braveDays={model.braveDays} points={model.points} />
      </div>
    </div>
  );
}
