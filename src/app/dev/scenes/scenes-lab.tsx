"use client";

import { type MouseEvent, useState } from "react";
import Image from "next/image";
import type { Stage } from "@/lib/companion";
import { Companion } from "@/components/scene/companion";
import { PathStones } from "@/components/scene/path-stones";
import { SCENES } from "@/lib/scenes";
import { ROOM_IDS, type RoomId, type StepRecord } from "@/lib/types";

type Point = { x: number; y: number };

const STAGES: Stage[] = ["hiding", "peeking", "waving", "speaking"];

// A fixed, fabricated ladder used only by the PathStones preview below, so
// lit, current and dim all show at once without touching real progress
// (highest 2 done, step 3 current, 4 to 6 not yet).
const MID_PROGRESS: StepRecord[] = [
  { situationId: "preview", level: 1, at: "2026-01-01T00:00:00.000Z", seconds: 4, typed: false, roughDay: false },
  { situationId: "preview", level: 2, at: "2026-01-02T00:00:00.000Z", seconds: 6, typed: false, roughDay: false },
];

/** Click-to-log coordinate lab: click the art to record an x/y percent pair, shown here and in the console, ready to paste into scenes.ts. */
export function ScenesLab() {
  const [room, setRoom] = useState<RoomId>("class");
  const [points, setPoints] = useState<Point[]>([]);
  const scene = SCENES[room];

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * 1000) / 10;
    const y = Math.round(((event.clientY - rect.top) / rect.height) * 1000) / 10;
    const point = { x, y };
    setPoints((prev) => [...prev, point]);
    console.log(`{ x: ${x}, y: ${y} }`);
  }

  function pickRoom(next: RoomId) {
    setRoom(next);
    setPoints([]);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold text-ink">Scene coordinate lab</h1>
        <p className="text-muted">
          Click the art to log a percent x/y pair, logged here and to the console. Amber dots are the current stones
          in scenes.ts; the amber box is the destination hotspot; blue dots are clicks from this session.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {ROOM_IDS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => pickRoom(r)}
            className={`rounded-full border px-4 py-2 text-sm capitalize ${r === room ? "border-amber bg-amber text-on-amber" : "border-line bg-surface-2 text-ink"}`}
          >
            {r}
          </button>
        ))}
        <button type="button" onClick={() => setPoints([])} className="rounded-full border border-line bg-surface-2 px-4 py-2 text-sm text-ink">
          Clear clicks
        </button>
      </div>

      <div
        onClick={handleClick}
        className="relative w-full cursor-crosshair overflow-hidden rounded-card border border-line"
        style={{ aspectRatio: `${scene.width} / ${scene.height}` }}
      >
        <Image src={scene.art} alt="" fill sizes="100vw" className="object-cover" priority />
        {scene.stones.map((pt, i) => (
          <div
            key={`stone-${i}`}
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber ring-2 ring-white"
            style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
          />
        ))}
        <div
          className="absolute border-2 border-amber"
          style={{
            left: `${scene.destination.x}%`,
            top: `${scene.destination.y}%`,
            width: `${scene.destination.w}%`,
            height: `${scene.destination.h}%`,
          }}
        />
        {points.map((pt, i) => (
          <div
            key={`click-${i}`}
            className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-focus ring-1 ring-white"
            style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
          />
        ))}
      </div>

      <ul className="font-mono text-sm text-muted">
        {points.map((pt, i) => (
          <li key={i}>{`{ x: ${pt.x}, y: ${pt.y} }`}</li>
        ))}
      </ul>

      <section className="flex flex-col gap-4 border-t border-line pt-6">
        <h2 className="font-display text-xl font-bold text-ink">PathStones preview (real component)</h2>
        <p className="text-muted">
          A mid-progress example (steps 1 and 2 done, step 3 current, 4 to 6 not yet) so lit, current and dim all
          show, at a card width and again at a phone width, to check spacing.
        </p>
        <div className="flex flex-wrap items-start gap-6">
          <div className="w-full max-w-xl">
            <PathStones room={room} situationId="preview" onPick={() => {}} previewRecords={MID_PROGRESS} />
          </div>
          <div className="w-[340px]">
            <PathStones room={room} situationId="preview" onPick={() => {}} previewRecords={MID_PROGRESS} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-line pt-6 pb-10">
        <h2 className="font-display text-xl font-bold text-ink">Companion preview (real component)</h2>
        <div className="flex flex-wrap gap-6">
          {STAGES.map((stage) => (
            <div key={stage} className="flex flex-col items-center gap-2">
              <Companion species="firefly" stage={stage} size={96} />
              <span className="text-xs text-muted">{stage}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
