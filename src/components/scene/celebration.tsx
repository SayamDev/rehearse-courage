"use client";

import { useEffect, useState } from "react";
import type { Stage } from "@/lib/companion";
import { sceneCrop, SCENES, toCropFrame } from "@/lib/scenes";
import type { Level, RoomId, Species } from "@/lib/types";
import { Companion } from "./companion";
import { PathStones } from "./path-stones";

/** Fixed spark directions so the burst looks the same every time (no randomness in render). */
const SPARKS = [
  [-70, -60, 120],
  [-40, -90, -80],
  [0, -100, 60],
  [45, -85, -140],
  [75, -50, 90],
  [-85, -10, -60],
  [85, -5, 150],
  [-55, 30, 40],
  [55, 35, -110],
  [-20, -70, 200],
  [25, -65, -30],
  [0, 40, 80],
];

/**
 * The signature moment when a step completes: the room's path with the
 * new stone lighting up, the companion's lantern brightening, and the sky
 * warming one step towards dawn (the night tint eases from before to
 * after). Optional paper sparks when `confetti` is on. Under reduced
 * motion every animation shows its end frame, so it is simply the lit,
 * warmer scene.
 */
export function Celebration({
  room,
  situationId,
  level,
  species,
  stage,
  skyBefore,
  skyAfter,
  confetti,
}: {
  room: RoomId;
  situationId: string;
  level: Level;
  species: Species;
  stage: Stage;
  skyBefore: number;
  skyAfter: number;
  confetti: boolean;
}) {
  const [tint, setTint] = useState(skyBefore);
  // Next frame, so the transition runs from the old sky to the new one.
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setTint(skyAfter));
    return () => window.cancelAnimationFrame(id);
  }, [skyAfter]);

  const scene = SCENES[room];
  const box = sceneCrop(scene, "island");
  const dest = scene.destination;
  const at = toCropFrame(level <= 5 ? scene.stones[level - 1] : { x: dest.x + dest.w / 2, y: dest.y + dest.h / 2 }, box);
  const companionAt = toCropFrame(level <= 5 ? scene.stones[level - 1] : { x: dest.x, y: dest.y + dest.h }, box);

  return (
    <div className="relative">
      <PathStones
        room={room}
        situationId={situationId}
        priority
        overlay={
          // Under the stones: the warming sky, then the new stone's light.
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0 transition-opacity duration-[900ms] ease-[var(--ease-out)]"
              style={{ opacity: tint, background: "linear-gradient(100deg, var(--chrome) 10%, transparent 80%)" }}
            />
            {/* The new stone's light: a warm halo that swells in over the lit stone. */}
            <span
              className="stone-light absolute h-24 w-24 rounded-full"
              style={{
                left: `${at.x}%`,
                top: `${at.y}%`,
                background: "radial-gradient(circle, color-mix(in srgb, var(--amber) 55%, transparent) 0%, transparent 65%)",
              }}
            />
          </div>
        }
      />

      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-card">
        {confetti
          ? SPARKS.map(([dx, dy, rot], i) => (
              <span
                key={i}
                className="spark absolute h-2.5 w-1.5 rounded-[2px]"
                style={
                  {
                    left: `${at.x}%`,
                    top: `${at.y}%`,
                    background: i % 3 === 0 ? "var(--on-chrome)" : "var(--amber)",
                    "--dx": `${dx}px`,
                    "--dy": `${dy}px`,
                    "--rot": `${rot}deg`,
                    animationDelay: `${120 + (i % 4) * 40}ms`,
                  } as React.CSSProperties
                }
              />
            ))
          : null}

        <div
          className="absolute -translate-x-[125%] -translate-y-[55%]"
          style={{ left: `${companionAt.x}%`, top: `${companionAt.y}%` }}
        >
          <span
            className="lantern-up absolute -inset-4 rounded-full"
            style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--amber) 45%, transparent) 0%, transparent 70%)" }}
          />
          <Companion species={species} stage={stage} size={56} />
        </div>
      </div>
    </div>
  );
}
