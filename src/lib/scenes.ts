import { highestLevel, nextLevel } from "./ladder";
import { ROOM_IDS, type RoomId, type StepRecord } from "./types";

export type StoneState = "lit" | "current" | "dim";

/** A crop rectangle, as percentages of the full art (0 to 100). */
export type CropBox = { x: number; y: number; w: number; h: number };

/** "island" fills the frame with just the island (used by PathStones, so stones do not collide on a small phone). "wide" is a gentler crop for screens that want more of the scene (e.g. Home on a laptop); defaults to the full art. */
export type CropKind = "island" | "wide";

export type Scene = {
  /** Path under public/, e.g. "/art/home-class.webp". */
  art: string;
  /** Real pixel size of the art file, used for aspect ratio and next/image sizing. */
  width: number;
  height: number;
  /** Tight crop around the island so it fills the frame on small screens. */
  islandFocus: CropBox;
  /** Gentler crop for a wider view. Defaults to the full art when there is no reason to crop tighter. */
  wideFocus: CropBox;
  /** Exactly 5 stone centres, as percentages of the FULL ART (0 to 100), not the cropped frame. */
  stones: { x: number; y: number }[];
  /** Step 6: the destination hotspot (a box, as percentages of the full art), lit when the mission is done. */
  destination: { x: number; y: number; w: number; h: number; label: string };
  /**
   * True while this scene's art is a stand-in (Friends and Presenting point at
   * the map's island art, not dedicated room art) and its stone coordinates
   * were measured on that stand-in. Re-measure once dedicated art lands.
   */
  provisional?: boolean;
};

const FULL_ART: CropBox = { x: 0, y: 0, w: 100, h: 100 };

/**
 * Scene art and stone/destination coordinates per room. Measured by hand on
 * the real art with the dev coordinate lab at src/app/dev/scenes/page.tsx
 * (click the art to log an x/y percent pair, then copy it here).
 */
export const SCENES: Record<RoomId, Scene> = {
  class: {
    art: "/art/home-class.webp",
    width: 2400,
    height: 1600,
    // The island is small inside the wide dusk-to-dawn sky/sea art, so the
    // island crop zooms tightly onto the path and school; the wide crop is
    // the untouched full art (used where the sky/sea context is wanted).
    islandFocus: { x: 40, y: 6, w: 36, h: 48 },
    wideFocus: FULL_ART,
    // Measured on the real art with /dev/scenes: the dirt path winds from
    // the island's near edge up to the school door at the top of the island.
    stones: [
      { x: 48.2, y: 43.5 },
      { x: 52.8, y: 37 },
      { x: 50.1, y: 30.9 },
      { x: 55.2, y: 26.3 },
      { x: 59.7, y: 21.7 },
    ],
    destination: { x: 60.2, y: 11.8, w: 9, h: 9, label: "the school door" },
  },
  // Friends: dedicated room art is not generated yet (Task 1 gap). Uses the
  // map's Friends island cutout, which already has 6 blank stepping stones
  // baked into the art in a ring around the cottage; the code stones sit on
  // top of 5 of them (measured with /dev/scenes, going around the ring from
  // the far side to the one nearest the door), with the door itself as the
  // destination hotspot.
  friends: {
    art: "/art/island-friends.webp",
    width: 2400,
    height: 2664,
    islandFocus: { x: 12, y: 15, w: 66, h: 55 },
    wideFocus: FULL_ART,
    stones: [
      { x: 22, y: 41.1 },
      { x: 22.5, y: 55.8 },
      { x: 34.4, y: 60.9 },
      { x: 56.5, y: 60.9 },
      { x: 68.6, y: 55.8 },
    ],
    destination: { x: 41.4, y: 23, w: 14, h: 10, label: "the friends' door" },
    provisional: true,
  },
  // Presenting: same situation as Friends. Uses the map's Presenting island
  // cutout, which has 6 blank stepping stones around the little stage;
  // coordinates measured the same way with /dev/scenes.
  presenting: {
    art: "/art/island-presenting.webp",
    width: 2400,
    height: 2690,
    islandFocus: { x: 17, y: 3, w: 62, h: 54 },
    wideFocus: FULL_ART,
    stones: [
      { x: 26.1, y: 28.5 },
      { x: 27.4, y: 37.8 },
      { x: 41.5, y: 44.9 },
      { x: 54.9, y: 44.9 },
      { x: 69.8, y: 37.8 },
    ],
    destination: { x: 30.5, y: 11, w: 16, h: 10, label: "the stage" },
    provisional: true,
  },
};

export function sceneCrop(scene: Scene, crop: CropKind): CropBox {
  return crop === "island" ? scene.islandFocus : scene.wideFocus;
}

/** Maps a point given as a percentage of the full art into a percentage of the given crop frame. */
export function toCropFrame(point: { x: number; y: number }, box: CropBox): { x: number; y: number } {
  return { x: ((point.x - box.x) / box.w) * 100, y: ((point.y - box.y) / box.h) * 100 };
}

/** The crop frame's own pixel aspect ratio (width / height), for an `aspect-ratio` style. */
export function cropAspect(scene: Scene, box: CropBox): number {
  return (scene.width * (box.w / 100)) / (scene.height * (box.h / 100));
}

/**
 * States for all 6 steps (5 stones plus the destination at index 5): levels
 * at or below the highest reached are lit, the next level is current, the
 * rest are dim. Always returns exactly 6 entries.
 */
export function stoneStates(records: StepRecord[], situationId: string): StoneState[] {
  const highest = highestLevel(records, situationId);
  const next = nextLevel(records, situationId);
  const states: StoneState[] = [];
  for (let level = 1; level <= 6; level++) {
    if (level <= highest) states.push("lit");
    else if (level === next) states.push("current");
    else states.push("dim");
  }
  return states;
}

// Re-exported so callers of scenes.ts do not also need to import ROOM_IDS from ./types.
export { ROOM_IDS };
