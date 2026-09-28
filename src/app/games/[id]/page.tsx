import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GAMES, gameById } from "@/lib/games";
import { GameView } from "@/components/games/game-view";

// Only these games exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

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
