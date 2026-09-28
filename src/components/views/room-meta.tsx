import { BookOpen, Microphone, UsersThree, type Icon } from "@phosphor-icons/react";
import type { RoomId } from "@/lib/types";

/** Phosphor icon per room, as on the map comp's island labels. */
export const ROOM_ICON: Record<RoomId, Icon> = {
  class: BookOpen,
  friends: UsersThree,
  presenting: Microphone,
};

/** Each room's sticker colour (icon discs and labels). */
export const ROOM_DISC: Record<RoomId, string> = {
  class: "bg-sky",
  friends: "bg-grape",
  presenting: "bg-coral",
};
