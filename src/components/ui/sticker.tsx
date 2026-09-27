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
 * A die-cut sticker for one badge. Earned: white 4px outline and a soft
 * shadow, art in colour when it exists, a neutral (not amber) placeholder
 * with a matching Phosphor icon when it does not; amber is reserved for
 * buttons, lit stones, the current nav item and glow. Unearned: a faint
 * stone-dim ring around a desaturated, low-opacity trace of the same badge
 * (the art itself grayscale and dim, or the same placeholder icon in
 * outline style) so the shape is recognisable but clearly not earned yet.
 */
export function Sticker({
  badgeId,
  earned,
  size = 96,
  eager = false,
}: {
  badgeId: string;
  earned: boolean;
  size?: number;
  /** Load the art immediately instead of lazily. For a badge shown above the fold on its own (e.g. the Badges screen's own art), not for grids. */
  eager?: boolean;
}) {
  const title = titleOf(badgeId);
  const hasArt = ART_IDS.has(badgeId);
  const PlaceholderIcon = PLACEHOLDER_ICONS[badgeId] ?? Compass;
  const loading = eager ? "eager" : "lazy";

  if (!earned) {
    return (
      <div
        role="img"
        aria-label={`${title}. Not earned yet`}
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center overflow-hidden rounded-full border-2 border-stone-dim bg-surface-2 text-stone-dim"
      >
        {hasArt ? (
          <Image
            src={`/art/badges/${badgeId}.webp`}
            alt=""
            fill
            sizes={`${size}px`}
            loading={loading}
            className="object-cover opacity-35 grayscale"
          />
        ) : (
          <PlaceholderIcon size={Math.round(size * 0.45)} weight="regular" aria-hidden />
        )}
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="relative overflow-hidden rounded-full bg-surface-2 shadow-card outline outline-4 outline-white"
    >
      {hasArt ? (
        <Image
          src={`/art/badges/${badgeId}.webp`}
          alt={title}
          fill
          sizes={`${size}px`}
          loading={loading}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-surface-2 text-ink">
          <PlaceholderIcon size={Math.round(size * 0.45)} weight="regular" aria-hidden />
        </div>
      )}
    </div>
  );
}
