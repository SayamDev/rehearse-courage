"use client";

import type { CSSProperties } from "react";
import { LEVELS } from "@/lib/ladder";
import { cropAspect, sceneCrop, SCENES, stoneStates, toCropFrame, type CropKind, type StoneState } from "@/lib/scenes";
import { useCourage } from "@/lib/store";
import type { Level, RoomId, StepRecord } from "@/lib/types";
import { SceneArt } from "./scene-art";

const STATE_WORD: Record<StoneState, string> = { lit: "done", current: "current", dim: "not yet" };

// Dim stones get a solid paper fill (not just a thin outline) so they stay
// legible over busy art; lit and current stay amber, current adds the pulse.
const STONE_CLASS: Record<StoneState, string> = {
  lit: "bg-amber text-on-amber shadow-glow",
  current: "bg-amber text-on-amber shadow-glow stone-pulse",
  // Ink (not stone-dim) numerals on dim stones: stone-dim on the surface
  // fill reads under 4.5:1, ink clears it comfortably in both themes.
  dim: "border-2 border-stone-dim bg-surface text-ink shadow-card",
};

const DEST_CLASS: Record<StoneState, string> = {
  lit: "rounded-2xl outline outline-3 outline-amber shadow-glow bg-amber/10",
  current: "rounded-2xl outline outline-2 outline-dashed outline-stone-dim/80 stone-pulse",
  dim: "",
};

// Visual stone size shrinks with the frame (container query width) so five
// stones never collide on a phone, but never exceeds DESIGN.md's 44px coin.
const STONE_VISUAL: CSSProperties = { width: "clamp(26px, 7cqw, 44px)", height: "clamp(26px, 7cqw, 44px)" };

function stoneLabel(level: number, state: StoneState) {
  return `Step ${level}, ${LEVELS[level - 1].name}, ${STATE_WORD[state]}`;
}

/**
 * The 5 numbered stepping stones plus the step 6 destination hotspot, drawn
 * over the room's SceneArt from the ladder progress for one situation.
 * States come from the shared courage store, never from props (except
 * `previewRecords`, for dev-only fixed-state previews), so any screen that
 * renders this stays in sync automatically.
 *
 * `crop` picks how much of the art fills the frame: "island" (the default)
 * zooms onto just the island so stones stay legible and spaced apart on a
 * phone; "wide" is a gentler view. Stone and destination coordinates are
 * always authored against the full art in scenes.ts and converted into
 * whichever crop frame is showing.
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
  crop = "island",
  previewRecords,
}: {
  room: RoomId;
  situationId: string;
  onPick?: (level: Level) => void;
  crop?: CropKind;
  /** Testing only: overrides the courage store's records so a fixed state (e.g. a mid-progress example) can be rendered without touching real progress. Used by the dev scene lab. */
  previewRecords?: StepRecord[];
}) {
  const store = useCourage();
  const records = previewRecords ?? store.records;
  const scene = SCENES[room];
  const box = sceneCrop(scene, crop);
  const states = stoneStates(records, situationId);
  const interactive = Boolean(onPick);

  const summary = states.map((s, i) => `step ${i + 1} ${STATE_WORD[s]}`).join(", ");

  return (
    <div
      className="relative w-full overflow-hidden rounded-card"
      style={{ aspectRatio: cropAspect(scene, box), containerType: "inline-size" }}
      {...(interactive ? {} : { role: "img", "aria-label": `Path: ${summary}.` })}
    >
      <SceneArt room={room} crop={crop} />
      <div aria-hidden={interactive ? undefined : true}>
        {scene.stones.map((raw, i) => {
          const level = i + 1;
          const state = states[i];
          const pt = toCropFrame(raw, box);
          const posStyle = { left: `${pt.x}%`, top: `${pt.y}%` };

          if (interactive) {
            // The button itself is the 44px minimum hit area (invisible
            // background); the visible coin inside it is the one that
            // shrinks with the frame, via an invisible padding ring.
            return (
              <button
                key={level}
                type="button"
                onClick={() => onPick?.(level as Level)}
                aria-label={stoneLabel(level, state)}
                style={posStyle}
                className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-transparent focus-visible:outline-3 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-3"
              >
                <span
                  style={STONE_VISUAL}
                  className={`flex items-center justify-center rounded-full font-display text-base font-bold transition-colors duration-[var(--dur-ui)] hover:brightness-95 active:brightness-90 ${STONE_CLASS[state]}`}
                >
                  {level}
                </span>
              </button>
            );
          }

          return (
            <div
              key={level}
              style={{ ...posStyle, ...STONE_VISUAL }}
              className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-display text-base font-bold ${STONE_CLASS[state]}`}
            >
              {level}
            </div>
          );
        })}

        {(() => {
          const dest = toCropFrame({ x: scene.destination.x, y: scene.destination.y }, box);
          const destW = (scene.destination.w / box.w) * 100;
          const destH = (scene.destination.h / box.h) * 100;
          const destStyle = { left: `${dest.x}%`, top: `${dest.y}%`, width: `${destW}%`, height: `${destH}%` };

          if (interactive) {
            return (
              <button
                type="button"
                onClick={() => onPick?.(6 as Level)}
                aria-label={`Step 6, Try it for real, ${scene.destination.label}, ${STATE_WORD[states[5]]}`}
                style={destStyle}
                className={`absolute transition-[box-shadow,outline-color] duration-[var(--dur-ui)] ${DEST_CLASS[states[5]]}`}
              />
            );
          }

          return <div style={destStyle} className={`absolute ${DEST_CLASS[states[5]]}`} />;
        })()}
      </div>
    </div>
  );
}
