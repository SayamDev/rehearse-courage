import Image from "next/image";
import { SCENES } from "@/lib/scenes";
import type { RoomId } from "@/lib/types";

/**
 * The room's static art, sized to its real aspect ratio. No UI is baked into
 * this image; stones, the companion and any overlay are drawn on top by the
 * caller so they can scale with the art (see PathStones).
 */
export function SceneArt({
  room,
  priority = false,
  className = "",
}: {
  room: RoomId;
  priority?: boolean;
  className?: string;
}) {
  const scene = SCENES[room];
  return (
    <Image
      src={scene.art}
      alt=""
      fill
      sizes="(min-width: 768px) 700px, 100vw"
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}
