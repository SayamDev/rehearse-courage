"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { gameById, type GameId } from "@/lib/games";
import { logEvent } from "@/lib/state";
import { act, useCourage } from "@/lib/store";
import { PaperCard } from "@/components/ui/paper-card";

/** One game's page: back to the games, the title and line, and the game in a card. Logs a game event once. */
export function GameShell({ id, children }: { id: GameId; children: ReactNode }) {
  const { age, hydrated } = useCourage();
  const game = gameById(id)!;
  const logged = useRef(false);

  useEffect(() => {
    if (!hydrated || logged.current) return;
    logged.current = true;
    act((s) => logEvent(s, "game", new Date(), id));
  }, [hydrated, id]);

  return (
    <div className="mx-auto max-w-[720px] px-4 pt-6 md:pt-10">
      <Link href="/games" className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 font-semibold text-muted hover:text-ink">
        <ArrowLeft size={20} weight="bold" aria-hidden />
        Games
      </Link>
      <h1 className="mt-2 text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] text-ink">{game.title}</h1>
      <p className="mt-1 text-muted">{words(game.line, age)}</p>
      <PaperCard className="mt-6">{children}</PaperCard>
      <p className="mt-4 text-sm text-muted">Nothing is scored, and nothing you say is saved.</p>
    </div>
  );
}
