import Image from "next/image";
import type { Stage } from "@/lib/companion";
import { SPECIES } from "@/lib/companion";
import type { Species } from "@/lib/types";

/**
 * Firefly stills (public/art/firefly/*.webp) do not exist yet, see
 * design/art-manifest.md. Once they land, fill this map by stage (and, if
 * hedgehog/fox get their own art in Plan 6, add per-species maps of the same
 * shape) — nothing else in this component needs to change.
 */
const FIREFLY_STILL: Partial<Record<Stage, string>> = {};

/** Fallback: a portrait crop of the firefly already drawn on the breathing kit tile. */
const FIREFLY_FALLBACK = "/art/kit/breathing.webp";

const STAGE_WORD: Record<Stage, string> = {
  hiding: "curled up",
  peeking: "peeking out",
  waving: "waving",
  speaking: "standing tall",
};

/** Lantern glow strength (0 to 1) by stage; brighter as courage grows. */
const GLOW_STRENGTH: Record<Stage, number> = { hiding: 0.12, peeking: 0.32, waving: 0.58, speaking: 0.9 };

const speciesName = (id: Species) => SPECIES.find((s) => s.id === id)?.name ?? id;

/**
 * The companion portrait: a round frame with a lantern glow behind it whose
 * strength follows `stage`. Hedgehog and fox do not have their own art
 * until Plan 6, so they fall back to the firefly's still with a dev-only
 * note (never shown to real users).
 */
export function Companion({ species, stage, size = 96 }: { species: Species; stage: Stage; size?: number }) {
  const isFirefly = species === "firefly";
  const src = FIREFLY_STILL[stage] ?? FIREFLY_FALLBACK;
  const glow = GLOW_STRENGTH[stage];

  return (
    <div style={{ width: size, height: size }} className="relative shrink-0">
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ boxShadow: `0 0 ${Math.round(size * 0.6)}px ${Math.round(size * 0.2)}px rgb(255 171 11 / ${glow})` }}
      />
      <div
        role="img"
        aria-label={`${speciesName(species)} companion, ${STAGE_WORD[stage]}`}
        className="relative h-full w-full overflow-hidden rounded-full border-2 border-white bg-surface-2 shadow-card"
      >
        <Image
          src={src}
          alt=""
          fill
          sizes={`${size}px`}
          className="scale-125 object-cover"
        />
      </div>
      {!isFirefly && process.env.NODE_ENV !== "production" ? (
        <span className="sr-only">Dev note: {speciesName(species)} has no art yet, showing the firefly as a stand-in.</span>
      ) : null}
    </div>
  );
}
