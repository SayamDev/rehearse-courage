"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { stageFor, type Stage } from "@/lib/companion";
import { missionsDone } from "@/lib/courage";
import { homeModel, skyTint } from "@/lib/home";
import { situationById, SITUATIONS } from "@/lib/content/situations";
import { sceneCrop, SCENES, toCropFrame, type CropKind, type Scene as SceneData } from "@/lib/scenes";
import { useCourage } from "@/lib/store";
import type { Level, RoomId, Species } from "@/lib/types";
import { Companion } from "@/components/scene/companion";
import { PathStones } from "@/components/scene/path-stones";
import { PaperCard } from "@/components/ui/paper-card";
import { ButtonLink } from "@/components/ui/button";
import { StatsPill } from "@/components/ui/stats-pill";

/** Where the companion stands: beside the current stone, or the destination once every earlier step is lit. */
function companionAnchor(scene: SceneData, level: Level) {
  if (level <= 5) return scene.stones[level - 1];
  const dest = scene.destination;
  return { x: dest.x + dest.w / 2, y: dest.y + dest.h / 2 };
}

/**
 * One crop of the room scene: PathStones (decorative, no onPick), the sky
 * warmth overlay, the companion beside the current stone, and the Home
 * header over the top-left corner of the art.
 */
function Scene({
  room,
  situationId,
  level,
  tint,
  crop,
  species,
  stage,
  className = "",
}: {
  room: RoomId;
  situationId: string;
  level: Level;
  tint: number;
  crop: CropKind;
  species: Species;
  stage: Stage;
  className?: string;
}) {
  const scene = SCENES[room];
  const box = sceneCrop(scene, crop);
  const anchor = toCropFrame(companionAnchor(scene, level), box);

  return (
    <div className={`relative overflow-hidden rounded-card ${className}`}>
      <PathStones room={room} situationId={situationId} crop={crop} priority />

      {/* Night tint over the sky, fading as mapLight grows. Colour stays
          dark navy in both themes (chrome), unlike ink which flips. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-[var(--dur-scene)] ease-[var(--ease-out)] motion-reduce:transition-none"
        style={{ opacity: tint, backgroundColor: "var(--chrome)" }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -translate-x-[115%] -translate-y-[55%]"
        style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}
      >
        <Companion species={species} stage={stage} size={56} />
      </div>

      <div className="pointer-events-none absolute left-0 top-0 p-4 sm:p-6">
        <h1 className="text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] text-[var(--on-chrome)]">Rehearse Courage</h1>
        <p className="mt-1 text-sm text-[var(--on-chrome)]/85 sm:text-base">a Rehearse project, by Sayam Ajmal</p>
      </div>
    </div>
  );
}

/**
 * Home ("/"): one suggested step, the courage map for its room, the
 * companion, and today's stats. Renders nothing until the store has
 * hydrated and a companion exists (RedirectIfNew, rendered by the page,
 * sends first-time visitors to /start; this view simply stays blank rather
 * than flashing any Home copy while that happens).
 */
export function HomeView() {
  const store = useCourage();

  if (!store.hydrated || !store.companion) return null;

  const model = homeModel(store, new Date());
  const stage = stageFor(model.points, missionsDone(store.records));

  // All-done: no suggested situation. class-answer is shown fully lit (it
  // is, since every situation including it reached level 6) as the scene's
  // backdrop for the "walked every path" card.
  const situationId = model.done ? SITUATIONS[0].id : model.situationId;
  const level: Level = model.done ? 6 : model.level;
  const room: RoomId = situationById(situationId)?.room ?? "class";
  const tint = model.done ? skyTint(store.records) : model.skyTint;

  const sceneProps = { room, situationId, level, tint, species: store.companion.species, stage };

  return (
    <div className="relative mx-auto max-w-[1100px] px-4 pb-16 pt-6 sm:pt-10">
      <Scene {...sceneProps} crop="island" className="md:hidden" />
      <Scene {...sceneProps} crop="wide" className="hidden md:block" />

      <PaperCard className="relative -mt-16 sm:-mt-20">
        {model.done ? (
          <>
            <p className="text-sm text-muted">Today&apos;s one step</p>
            <h2 className="mt-1 text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] text-ink">You have walked every path.</h2>
            <ButtonLink href="/room/class#add" className="mt-6" icon={ArrowRight}>
              Add your own step
            </ButtonLink>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">Today&apos;s one step</p>
            <h2 className="mt-1 text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] text-ink">{model.title}</h2>
            <p className="mt-4 text-sm text-muted">
              Step {model.level} of 6
              <br />
              <span className="text-ink">{model.levelName}</span>
            </p>
            <ButtonLink href={`/step/${model.situationId}?level=${model.level}`} className="mt-6" icon={ArrowRight}>
              Start
            </ButtonLink>
          </>
        )}
      </PaperCard>

      <div className="mt-6 flex justify-center sm:justify-start">
        <StatsPill braveDays={model.braveDays} points={model.points} />
      </div>
    </div>
  );
}
