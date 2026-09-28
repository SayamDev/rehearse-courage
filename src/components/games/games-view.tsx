"use client";

import { words } from "@/lib/age";
import { GAMES } from "@/lib/games";
import { useCourage } from "@/lib/store";
import { ArtHeader } from "@/components/scene/art-header";
import { ToolTile } from "@/components/ui/tool-tile";
import { GAME_META } from "./game-meta";

/** Games ("/games"): short warm-ups to play before a step, or any time. */
export function GamesView() {
  const { age } = useCourage();
  return (
    <div>
      <ArtHeader title="Warm-up games" line="A minute or two each. Nothing to win or lose, just a warm voice before a step." />
      <ul role="list" className="mx-auto mt-8 grid max-w-[1100px] list-none gap-3 px-4 md:grid-cols-2 md:gap-4 md:px-8">
        {GAMES.map((g) => (
          <li key={g.id}>
            <ToolTile href={`/games/${g.id}`} icon={GAME_META[g.id].icon} ink={GAME_META[g.id].ink} title={g.title} line={words(g.line, age)} time={g.time} />
          </li>
        ))}
      </ul>
    </div>
  );
}
