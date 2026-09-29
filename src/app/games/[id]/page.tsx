import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { gameById } from "@/lib/games";
import { GameView } from "@/components/games/game-view";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const game = gameById(id);
  return { title: game ? `${game.title} - Rehearse Courage` : "Rehearse Courage" };
}

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = gameById(id);
  if (!game) notFound();
  return <GameView id={game.id} />;
}
