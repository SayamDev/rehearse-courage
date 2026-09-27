import { BookOpen, Microphone, UsersThree, type Icon } from "@phosphor-icons/react";
import type { RoomId } from "@/lib/types";

/** Phosphor icon per room, as on the map comp's island labels. */
export const ROOM_ICON: Record<RoomId, Icon> = {
  class: BookOpen,
  friends: UsersThree,
  presenting: Microphone,
};

/** Map island art per room: the cutouts harvested from the map comp (see design/art-manifest.md). */
export const ISLAND_ART: Record<RoomId, string> = {
  class: "/art/island-class.webp",
  friends: "/art/island-friends.webp",
  presenting: "/art/island-presenting.webp",
};
