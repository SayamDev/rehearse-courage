"use client";

import { words } from "@/lib/age";
import { KIT_TOOLS } from "@/lib/content/body";
import { useCourage } from "@/lib/store";
import { ArtHeader } from "@/components/scene/art-header";
import { ToolTile } from "@/components/ui/tool-tile";
import { KIT_META } from "./kit-meta";

const GROUPS = [
  { id: "body", title: "Calm your body", line: "For when nerves show up in your breath, face or hands." },
  { id: "words", title: "Find your words", line: "For when your mind goes blank or words get stuck." },
] as const;

/** Body kit ("/kit"): the tools in two groups, each a tile with a sticker icon and how long it takes. */
export function KitView() {
  const { age } = useCourage();
  return (
    <div>
      <ArtHeader title="Body kit" line="Quick tools for before, during or after a hard moment. Use any of them, in any order." />
      <div className="mx-auto grid max-w-[1100px] gap-10 px-4 pt-8 md:px-8">
        {GROUPS.map((g) => (
          <section key={g.id} aria-labelledby={`kit-${g.id}`}>
            <h2 id={`kit-${g.id}`} className="text-2xl text-ink">
              {g.title}
            </h2>
            <p className="mt-1 text-muted">{g.line}</p>
            <ul role="list" className="mt-4 grid list-none gap-3 p-0 md:grid-cols-2 md:gap-4">
              {KIT_TOOLS.filter((t) => KIT_META[t.id].group === g.id).map((t) => (
                <li key={t.id}>
                  <ToolTile href={`/kit/${t.id}`} icon={KIT_META[t.id].icon} ink={KIT_META[t.id].ink} time={KIT_META[t.id].time} title={t.title} line={words(t.line, age)} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
