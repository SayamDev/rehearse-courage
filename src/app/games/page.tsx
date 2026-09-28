import type { Metadata } from "next";
import { GamesView } from "@/components/games/games-view";

export const metadata: Metadata = { title: "Warm-up games - Rehearse Courage" };

export default function GamesPage() {
  return <GamesView />;
}
