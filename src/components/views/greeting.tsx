"use client";

import { useEffect, useState } from "react";
import { dayKey } from "@/lib/dates";
import { greetingLottie, type GlyphAtlas } from "@/lib/lottie/greeting";
import { Lottie } from "@/components/ui/lottie";
import { useDarkTheme } from "@/lib/use-dark-theme";

const SEEN_KEY = "courage:greeted";
let atlasLoad: Promise<GlyphAtlas | null> | null = null;
const loadAtlas = () =>
  (atlasLoad ??= fetch("/lottie/glyphs.json")
    .then((r) => (r.ok ? (r.json() as Promise<GlyphAtlas>) : null))
    .catch(() => {
      atlasLoad = null;
      return null;
    }));

/**
 * The Home heading: "Hi Sam, today's one step" as kinetic type, the name
 * stamping in over a sun sweep. It plays on the first visit of the day and
 * is still after that. The real heading is always there for screen
 * readers; until the type is ready (or for a name with letters the atlas
 * does not have) the plain heading shows instead.
 */
export function Greeting({ name, className = "" }: { name: string | null; className?: string }) {
  const dark = useDarkTheme();
  const [doc, setDoc] = useState<{ data: object; ratio: number; width: number } | null>(null);
  const [still, setStill] = useState(true);
  const text = name ? `Hi ${name}, today's one step` : "Today's one step";

  useEffect(() => {
    let live = true;
    void loadAtlas().then((atlas) => {
      if (!live || !atlas) return;
      const data = greetingLottie(atlas, name, dark ? "dark" : "light");
      if (!data) return;
      const today = dayKey(new Date());
      let seen = false;
      try {
        seen = localStorage.getItem(SEEN_KEY) === today;
        localStorage.setItem(SEEN_KEY, today);
      } catch {
        // Private mode: it simply plays each visit.
      }
      setStill(seen);
      setDoc({ data, ratio: data.w / data.h, width: data.w });
    });
    return () => {
      live = false;
    };
  }, [name, dark]);

  return (
    <div className={className}>
      <h1 className={doc ? "sr-only" : "text-[clamp(1.75rem,1.2rem+2.4vw,3rem)] text-ink"}>{text}</h1>
      {doc ? (
        <Lottie data={doc.data} still={still} className="w-full" style={{ aspectRatio: doc.ratio, maxWidth: Math.min(doc.width * 0.62, 560) }} />
      ) : null}
    </div>
  );
}
