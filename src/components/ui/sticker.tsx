import Image from "next/image";
import {
  CalendarCheck,
  CalendarStar,
  Compass,
  Crown,
  GameController,
  Heart,
  Lightning,
  Plant,
  Rocket,
  Sparkle,
  Trophy,
  type Icon,
} from "@phosphor-icons/react";
import { BADGES } from "@/lib/achievements";

/** Badges with painted art in public/art/badges/<id>.webp. */
const ART_IDS = new Set([
  "first-words",
  "typed-first",
  "hand-up",
  "said-anyway",
  "back-again",
  "out-in-the-wild",
  "calm-captain",
  "rescue-ready",
  "room-explorer",
  "my-own-step",
  "then-and-now",
  "dawn",
]);

/** Newer badges, until their art is painted: a bold icon on a sticker ink. */
export const BADGE_ICON: Record<string, { icon: Icon; ink: string }> = {
  "tiny-dare": { icon: Lightning, ink: "bg-sun" },
  "dare-collector": { icon: Sparkle, ink: "bg-sun" },
  "ready-steady": { icon: Rocket, ink: "bg-sky" },
  "not-yet": { icon: Plant, ink: "bg-lime" },
  "proud-moment": { icon: Heart, ink: "bg-coral" },
  "game-explorer": { icon: GameController, ink: "bg-grape" },
  "brave-3": { icon: CalendarCheck, ink: "bg-sky" },
  "brave-7": { icon: CalendarStar, ink: "bg-grape" },
  "brave-30": { icon: Trophy, ink: "bg-sun" },
  "brave-100": { icon: Crown, ink: "bg-coral" },
};

/** What a badge looks like on a share card: its painting, or its icon sticker. */
export function badgeShareArt(badgeId: string): { type: "image"; src: string } | { type: "icon"; icon: Icon; ink: string } {
  if (ART_IDS.has(badgeId)) return { type: "image", src: `/art/badges/${badgeId}.webp` };
  const i = BADGE_ICON[badgeId];
  return { type: "icon", icon: i?.icon ?? Compass, ink: i?.ink ?? "bg-accent" };
}

const titleOf = (badgeId: string) => BADGES.find((b) => b.id === badgeId)?.title ?? badgeId;

/**
 * A die-cut sticker for one badge. Earned: white 4px outline and a soft
 * shadow, art in colour (a neutral icon only for an unknown id). Unearned:
 * a faint stone-dim ring around a grayscale, low-opacity trace of the same
 * art, so the shape is recognisable but clearly not earned yet.
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
  const iconSticker = BADGE_ICON[badgeId];
  const PlaceholderIcon = iconSticker?.icon ?? Compass;
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
        <div role="img" aria-label={title} className={`flex h-full w-full items-center justify-center text-[#13262b] ${iconSticker?.ink ?? "bg-surface-2"}`}>
          <PlaceholderIcon size={Math.round(size * 0.46)} weight="bold" aria-hidden />
        </div>
      )}
    </div>
  );
}
