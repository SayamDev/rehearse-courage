import type { Metadata } from "next";
import Link from "next/link";
import { CloudSlash } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = { title: "Offline - Rehearse Courage" };

const WORKS = [
  { href: "/", label: "Today's step", note: "Practise with the built-in lines and replies" },
  { href: "/kit", label: "Body kit", note: "Breathing, grounding, rescue phrases" },
  { href: "/map", label: "Courage map", note: "Your islands and steps" },
  { href: "/me", label: "Me", note: "Your progress and settings" },
];

/** Shown by the service worker when a page is not saved yet and there is no internet. */
export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 pt-8 md:pt-12">
      <span aria-hidden className="flex size-14 -rotate-6 items-center justify-center rounded-full border-[3px] border-die bg-sky text-[#13262b] shadow-sticker">
        <CloudSlash size={28} weight="bold" />
      </span>
      <h1 className="mt-4 text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] text-ink">You are offline</h1>
      <p className="mt-2 max-w-[56ch] text-muted">
        This page needs the internet. Most of the app still works: steps use the built-in coach replies, and your progress stays on this device.
      </p>
      <ul className="mt-6 grid list-none gap-3 p-0">
        {WORKS.map((w) => (
          <li key={w.href}>
            <Link href={w.href} className="flex flex-col rounded-card border-[1.5px] border-line bg-surface p-4 shadow-card hover:border-stone-dim">
              <span className="font-display text-lg font-bold text-ink">{w.label}</span>
              <span className="text-muted">{w.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
