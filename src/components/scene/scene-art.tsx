import Image from "next/image";
import { sceneCrop, SCENES, type CropKind } from "@/lib/scenes";
import type { RoomId } from "@/lib/types";

/**
 * The room's static art, cropped and zoomed to fill its parent frame
 * (the parent owns the frame's size and, when it needs to line stones up,
 * its aspect ratio — see cropAspect in scenes.ts). "island" (the default)
 * zooms onto just the island so it reads at phone width; "wide" is a
 * gentler crop (the full art unless a scene defines otherwise) for screens
 * that want more of the scene around it.
 *
 * Implemented with plain percentage math rather than CSS object-view-box
 * (not yet supported everywhere): an inner layer is sized and shifted so
 * that exactly the crop box fills this component's parent, then the art
 * fills that layer with object-cover.
 */
export function SceneArt({
  room,
  crop = "island",
  priority = false,
  className = "",
}: {
  room: RoomId;
  crop?: CropKind;
  priority?: boolean;
  className?: string;
}) {
  const scene = SCENES[room];
  const box = sceneCrop(scene, crop);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute"
        style={{
          width: `${(100 / box.w) * 100}%`,
          height: `${(100 / box.h) * 100}%`,
          left: `${(-box.x / box.w) * 100}%`,
          top: `${(-box.y / box.h) * 100}%`,
        }}
      >
        <Image
          src={scene.art}
          alt=""
          fill
          sizes="(min-width: 768px) 700px, 100vw"
          priority={priority}
          className={`object-cover ${className}`}
        />
      </div>
    </div>
  );
}
