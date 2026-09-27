"use client";

import Image from "next/image";
import { Waveform } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { KIT_TOOLS } from "@/lib/content/body";
import { useCourage } from "@/lib/store";
import { ToolTile } from "@/components/ui/tool-tile";

/**
 * A banner of scene art with the page title over the dark night sky side.
 * The kit's own header art is not made yet (see design/art-manifest.md), so
 * this uses the quiet hill from Panic now until it is.
 */
export function ArtHeader({ title, line, art = "/art/panic.webp" }: { title: string; line: string; art?: string }) {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <Image src={art} alt="" fill priority sizes="100vw" className="object-cover object-[50%_30%]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, color-mix(in srgb, var(--chrome) 88%, transparent), color-mix(in srgb, var(--chrome) 60%, transparent) 55%, color-mix(in srgb, var(--chrome) 15%, transparent))",
          }}
        />
      </div>
      <header className="relative mx-auto max-w-[1100px] px-4 pb-10 pt-8 text-on-chrome md:pb-16 md:pt-12">
        <h1 className="text-[clamp(1.75rem,1.2rem+2vw,2.75rem)]">{title}</h1>
        <p className="mt-1 max-w-[36ch]">{line}</p>
      </header>
    </div>
  );
}

/** Body kit ("/kit"): the tools as tiles, two columns on laptop and one on a phone. */
export function KitView() {
  const { age } = useCourage();
  return (
    <div>
      <ArtHeader title="Body kit" line="Quick tools for when your body feels like too much." />
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
