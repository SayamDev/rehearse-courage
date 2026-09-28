"use client";

import type { GameId } from "@/lib/games";
import { BreathBalloon } from "./breath-balloon";
import { DescribeIt } from "./describe-it";
import { KeepItGoing } from "./keep-it-going";
import { SayItLike } from "./say-it-like";
import { GameShell } from "./game-shell";
import { HotSeat } from "./hot-seat";
import { RescueSnap } from "./rescue-snap";
import { StoryDice } from "./story-dice";
import { WordBuilder } from "./word-builder";

const GAME: Record<GameId, () => React.ReactNode> = {
  "hot-seat": () => <HotSeat />,
  "story-dice": () => <StoryDice />,
  "rescue-snap": () => <RescueSnap />,
  "word-builder": () => <WordBuilder />,
  "breath-balloon": () => <BreathBalloon />,
  "say-it-like": () => <SayItLike />,
  "describe-it": () => <DescribeIt />,
  "keep-it-going": () => <KeepItGoing />,
};

export function GameView({ id }: { id: GameId }) {
  return <GameShell id={id}>{GAME[id]()}</GameShell>;
}
