"use client";

import { LEVELS } from "@/lib/ladder";
import { SCENES, stoneStates, type StoneState } from "@/lib/scenes";
import { useCourage } from "@/lib/store";
import type { Level, RoomId } from "@/lib/types";
import { SceneArt } from "./scene-art";

const STATE_WORD: Record<StoneState, string> = { lit: "done", current: "current", dim: "not yet" };

const STONE_CLASS: Record<StoneState, string> = {
  lit: "bg-amber text-on-amber shadow-glow",
  current: "bg-amber text-on-amber shadow-glow stone-pulse",
  dim: "border-2 border-stone-dim bg-transparent text-stone-dim",
};

const DEST_CLASS: Record<StoneState, string> = {
  lit: "rounded-2xl outline outline-3 outline-amber shadow-glow bg-amber/10",
  current: "rounded-2xl outline outline-2 outline-dashed outline-stone-dim/80 stone-pulse",
  dim: "",
};

function stoneLabel(level: number, state: StoneState) {
  return `Step ${level}, ${LEVELS[level - 1].name}, ${STATE_WORD[state]}`;
}

/**
 * The 5 numbered stepping stones plus the step 6 destination hotspot, drawn
 * over the room's SceneArt from the ladder progress for one situation.
 * States come from the shared courage store, never from props, so any
 * screen that renders this stays in sync automatically.
 *
 * Pass `onPick` to make the stones and destination real buttons (used on
 * the room screen to choose a step). Without it, the whole path is a single
 * decorative group with a text summary for assistive tech (used on Home,
 * where the destination is Start, not the stones).
 */
export function PathStones({
  room,
  situationId,
  onPick,
}: {
  room: RoomId;
  situationId: string;
  onPick?: (level: Level) => void;
}) {
  const { records } = useCourage();
  const scene = SCENES[room];
  const states = stoneStates(records, situationId);
  const interactive = Boolean(onPick);

  const summary = states.map((s, i) => `step ${i + 1} ${STATE_WORD[s]}`).join(", ");

  return (
    <div
      className="relative w-full overflow-hidden rounded-card"
      style={{ aspectRatio: `${scene.width} / ${scene.height}` }}
      {...(interactive ? {} : { role: "img", "aria-label": `Path: ${summary}.` })}
    >
      <SceneArt room={room} />
      <div aria-hidden={interactive ? undefined : true}>
        {scene.stones.map((pt, i) => {
          const level = i + 1;
          const state = states[i];
          const style = { left: `${pt.x}%`, top: `${pt.y}%` };
          const shared =
            "absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-display text-base font-bold transition-colors duration-[var(--dur-ui)]";

          if (interactive) {
            return (
              <button
                key={level}
                type="button"
                onClick={() => onPick?.(level as Level)}
                aria-label={stoneLabel(level, state)}
                style={style}
                className={`${shared} ${STONE_CLASS[state]} focus-visible:outline-3 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-3 hover:brightness-95 active:brightness-90`}
              >
                {level}
              </button>
            );
          }

          return (
            <div key={level} style={style} className={`${shared} ${STONE_CLASS[state]}`}>
              {level}
            </div>
          );
        })}

        {interactive ? (
          <button
            type="button"
            onClick={() => onPick?.(6 as Level)}
            aria-label={`Step 6, Try it for real, ${scene.destination.label}, ${STATE_WORD[states[5]]}`}
            style={{
              left: `${scene.destination.x}%`,
              top: `${scene.destination.y}%`,
              width: `${scene.destination.w}%`,
              height: `${scene.destination.h}%`,
            }}
            className={`absolute transition-[box-shadow,outline-color] duration-[var(--dur-ui)] ${DEST_CLASS[states[5]]}`}
          />
        ) : (
          <div
            style={{
              left: `${scene.destination.x}%`,
              top: `${scene.destination.y}%`,
              width: `${scene.destination.w}%`,
              height: `${scene.destination.h}%`,
            }}
            className={`absolute ${DEST_CLASS[states[5]]}`}
          />
        )}
      </div>
    </div>
  );
}
