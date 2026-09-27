import Image from "next/image";
import {
  ClockCounterClockwise,
  Compass,
  Keyboard,
  Lifebuoy,
  PenNib,
  SunHorizon,
  type Icon,
} from "@phosphor-icons/react";
import { BADGES } from "@/lib/achievements";

/** Badges with real art in public/art/badges/<id>.webp. */
const ART_IDS = new Set(["first-words", "hand-up", "said-anyway", "back-again", "out-in-the-wild", "calm-captain"]);

/** Neutral die-cut placeholders for badges without art yet, one icon per badge. */
const PLACEHOLDER_ICONS: Record<string, Icon> = {
  "typed-first": Keyboard,
  "rescue-ready": Lifebuoy,
  "room-explorer": Compass,
  "my-own-step": PenNib,
  "then-and-now": ClockCounterClockwise,
  dawn: SunHorizon,
};

const titleOf = (badgeId: string) => BADGES.find((b) => b.id === badgeId)?.title ?? badgeId;

/**
 * A die-cut sticker for one badge: white 4px outline and a soft shadow when
 * earned, a plain stone-dim outline with no icon overlay when it is not.
 * Badges without art yet get a neutral round placeholder with a matching
 * Phosphor icon rather than a TODO graphic.
 */
export function Sticker({ badgeId, earned, size = 96 }: { badgeId: string; earned: boolean; size?: number }) {
  const title = titleOf(badgeId);

  if (!earned) {
    return (
      <div
        role="img"
        aria-label="Not earned yet"
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-full border-2 border-stone-dim bg-surface-2 text-stone-dim"
      >
        <span className="text-sm font-semibold">?</span>
      </div>
    );
  }

  const hasArt = ART_IDS.has(badgeId);
  const PlaceholderIcon = PLACEHOLDER_ICONS[badgeId] ?? Compass;

  return (
    <div
      style={{ width: size, height: size }}
      className="relative overflow-hidden rounded-full bg-surface-2 shadow-card outline outline-4 outline-white"
    >
      {hasArt ? (
        <Image src={`/art/badges/${badgeId}.webp`} alt={title} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-amber text-on-amber">
          <PlaceholderIcon size={Math.round(size * 0.45)} weight="regular" aria-hidden />
        </div>
      )}
    </div>
  );
}
