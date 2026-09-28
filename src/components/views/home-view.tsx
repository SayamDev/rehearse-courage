"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { stageFor, type Stage } from "@/lib/companion";
import { missionsDone } from "@/lib/courage";
import { homeModel } from "@/lib/home";
import { situationById, SITUATIONS } from "@/lib/content/situations";
import { sceneCrop, SCENES, toCropFrame, type CropKind, type Scene as SceneData } from "@/lib/scenes";
import { useCourage } from "@/lib/store";
import type { Level, RoomId, Species } from "@/lib/types";
import { Companion } from "@/components/scene/companion";
import { PathStones } from "@/components/scene/path-stones";
import { SceneBand } from "@/components/scene/scene-band";
import { PaperCard } from "@/components/ui/paper-card";
import { ButtonLink } from "@/components/ui/button";
import { StatsPill } from "@/components/ui/stats-pill";

/** Where the companion stands: beside the current stone, or at the destination's lower-left corner (clear of stone 5 and the door) once every earlier step is lit. */
function companionAnchor(scene: SceneData, level: Level) {
  if (level <= 5) return scene.stones[level - 1];
  const dest = scene.destination;
  return { x: dest.x, y: dest.y + dest.h };
}

/**
 * One crop of the room scene: PathStones (decorative, no onPick), the sky
 * warmth overlay and the companion beside the current stone. The frame
 * keeps the art's own aspect ratio so stones line up, and runs edge to edge:
 * the island crop on phones, the full-width band on laptops.
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
    <div className={`relative overflow-hidden ${className}`}>
      <PathStones
        room={room}
        situationId={situationId}
        crop={crop}
        rounded={false}
        priority
        overlay={
          // Night tint from the moon side, fading as mapLight grows. Colour
          // stays dark navy in both themes (chrome), unlike ink which flips.
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-opacity duration-[var(--dur-scene)] ease-[var(--ease-out)]"
            style={{ opacity: tint, background: "linear-gradient(100deg, var(--chrome) 10%, transparent 80%)" }}
          />
        }
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -translate-x-[125%] -translate-y-[55%]"
        style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}
      >
        <Companion species={species} stage={stage} size={crop === "island" ? 52 : 72} />
      </div>
    </div>
  );
}

const TITLE = "text-[clamp(1.75rem,1.2rem+2vw,2.75rem)]";

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
  const tint = model.skyTint;

  const sceneProps = { room, situationId, level, tint, species: store.companion.species, stage };
  const homeHeader = (
    <header>
      <h1 className={TITLE}>Rehearse Courage</h1>
      <p className="mt-1">a Rehearse project, by Sayam Ajmal</p>
    </header>
  );

  return (
    <div className="relative">
      {/* Phone: the island crop has no open sky, so the header sits on the
          canvas above it (never text over busy art). Laptop: it sits over
          the night sky in the top-left of the full-width band, as in the comp. */}
      <header className="px-4 pb-3 pt-4 md:hidden">
        <h1 className={`${TITLE} text-ink`}>Rehearse Courage</h1>
        <p className="mt-1 text-muted">a Rehearse project, by Sayam Ajmal</p>
      </header>
      <Scene {...sceneProps} crop="island" className="md:hidden" />

      {/* Tablets get the whole art (taller, so a portrait screen is not left
          half empty); laptops get the band, trimmed so the card, stats and nav
          all fit on a 900px-tall screen. */}
      <SceneBand className="hidden md:block lg:hidden" header={homeHeader}>
        <Scene {...sceneProps} crop="wide" />
      </SceneBand>
      <SceneBand className="hidden lg:block" header={homeHeader}>
        <Scene {...sceneProps} crop="band" />
      </SceneBand>

      <div className="px-4">
        <PaperCard className="relative mx-auto mt-4 max-w-[560px] md:-mt-[clamp(7rem,13vw,13rem)]">
          {model.done ? (
            <>
              <h2 className="text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] text-ink">You have walked every path.</h2>
              <ButtonLink href="/room/class#add" className="mt-6" icon={ArrowRight} iconEnd>
                Add your own step
              </ButtonLink>
            </>
          ) : (
            <>
              <p className="text-muted">{store.name ? <>Hi {store.name}, today&apos;s one step</> : <>Today&apos;s one step</>}</p>
              <h2 className="mt-1 text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] text-ink">{model.title}</h2>
              <p className="mt-3 text-muted">
                Step <span className="tabular">{model.level}</span> of 6
                <br />
                <span className="text-ink">{model.levelName}</span>
              </p>
              <ButtonLink href={`/step/${model.situationId}?level=${model.level}`} className="mt-5" icon={ArrowRight} iconEnd>
                Start
              </ButtonLink>
            </>
          )}
        </PaperCard>

        <div className="mt-4 flex justify-center">
          <StatsPill braveDays={model.braveDays} points={model.points} />
        </div>
      </div>
    </div>
  );
}
