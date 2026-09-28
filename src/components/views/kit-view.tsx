"use client";

import { Waveform } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { KIT_TOOLS } from "@/lib/content/body";
import { useCourage } from "@/lib/store";
import { ArtHeader } from "@/components/scene/art-header";
import { ToolTile } from "@/components/ui/tool-tile";

/** Body kit ("/kit"): the tools as tiles, two columns on laptop and one on a phone. */
export function KitView() {
  const { age } = useCourage();
  return (
    <div>
      <ArtHeader lottie="/lottie/kit.json" title="Body kit" line="Quick tools for when your body feels like too much." />
      <ul role="list" className="relative mx-auto -mt-4 grid max-w-[1100px] list-none gap-3 px-4 md:grid-cols-2 md:gap-5">
        {KIT_TOOLS.map((t, i) => (
          <li key={t.id}>
            <ToolTile
              href={`/kit/${t.id}`}
              art={t.art}
              icon={Waveform}
              title={t.title}
              line={words(t.line, age)}
              helps={words(t.helps, age)}
              eager={i < 2}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
