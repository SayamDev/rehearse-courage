import { Balloon, ChatCircleDots, DiceFive, PuzzlePiece, Chair, type Icon } from "@phosphor-icons/react";
import type { GameId } from "@/lib/games";

export const GAME_META: Record<GameId, { icon: Icon; ink: string }> = {
  "hot-seat": { icon: Chair, ink: "bg-coral" },
  "story-dice": { icon: DiceFive, ink: "bg-sun" },
  "rescue-snap": { icon: ChatCircleDots, ink: "bg-sky" },
  "word-builder": { icon: PuzzlePiece, ink: "bg-grape" },
  "breath-balloon": { icon: Balloon, ink: "bg-lime" },
};
