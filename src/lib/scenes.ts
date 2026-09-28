import { highestLevel, nextLevel } from "./ladder";
import { ROOM_IDS, type RoomId, type StepRecord } from "./types";

export type StoneState = "lit" | "current" | "dim";

/** A crop rectangle, as percentages of the full art (0 to 100). */
export type CropBox = { x: number; y: number; w: number; h: number };

/** "island" fills the frame with just the island (used by PathStones, so stones do not collide on a small phone). "wide" is a gentler crop for screens that want more of the scene (e.g. Home on a laptop); defaults to the full art. */
export type CropKind = "island" | "wide" | "step";

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
  /** Optional art for the practice step banner (e.g. the classroom); falls back to the island crop of `art`. */
  step?: { art: string; width: number; height: number; focus: CropBox };
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
    step: { art: "/art/step-class.webp", width: 1536, height: 1024, focus: { x: 12, y: 2, w: 76, h: 42 } },
  },
  // Friends: a park island (oak, picnic table), the dirt path ends at the
  // gazebo. Coordinates measured on the real art with a percent grid.
  friends: {
    art: "/art/room-friends.webp",
    width: 1536,
    height: 1024,
    islandFocus: { x: 38, y: 10, w: 34, h: 42 },
    wideFocus: FULL_ART,
    stones: [
      { x: 49, y: 43.5 },
      { x: 54, y: 39.5 },
      { x: 58, y: 35 },
      { x: 62, y: 31.5 },
      { x: 65, y: 26.5 },
    ],
    destination: { x: 61.5, y: 12, w: 9, h: 13, label: "the gazebo" },
  },
  // Presenting: a small open-air stage with benches; the path ends at the
  // stage steps. Measured the same way.
  presenting: {
    art: "/art/room-presenting.webp",
    width: 1536,
    height: 1024,
    islandFocus: { x: 36, y: 9, w: 34, h: 43 },
    wideFocus: FULL_ART,
    stones: [
      { x: 48.3, y: 44.5 },
      { x: 53, y: 40.2 },
      { x: 56.2, y: 36 },
      { x: 54.5, y: 31.2 },
      { x: 52.9, y: 26 },
    ],
    destination: { x: 45.5, y: 11.5, w: 14.5, h: 14.5, label: "the stage" },
  },
};

export function sceneCrop(scene: Scene, crop: CropKind): CropBox {
  if (crop === "step") return scene.step?.focus ?? scene.islandFocus;
  return crop === "island" ? scene.islandFocus : scene.wideFocus;
}

/** The art file for a crop: the step banner has its own art when the scene defines one. */
export function sceneArt(scene: Scene, crop: CropKind): string {
  return crop === "step" && scene.step ? scene.step.art : scene.art;
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
