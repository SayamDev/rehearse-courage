import Link from "next/link";
import { ArrowRight, Clock, type Icon } from "@phosphor-icons/react";

/**
 * One Body kit tool: a sticker icon, the title, one line on what it is for,
 * and roughly how long it takes. The whole tile is the link.
 */
export function ToolTile({
  href,
  icon: IconCmp,
  ink,
  title,
  line,
  time,
}: {
  href: string;
  icon: Icon;
  /** The sticker's background class, e.g. "bg-sky". */
  ink: string;
  title: string;
  line: string;
  time: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full items-center gap-4 rounded-card border-[1.5px] border-line bg-surface p-4 shadow-card transition-[transform,border-color] duration-[var(--dur-ui)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-stone-dim"
    >
      <span
        aria-hidden
        className={`flex size-14 shrink-0 -rotate-6 items-center justify-center rounded-full border-[3px] border-die text-[#13262b] shadow-sticker transition-transform duration-[var(--dur-ui)] group-hover:rotate-0 ${ink}`}
      >
        <IconCmp size={28} weight="bold" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg font-bold leading-tight text-ink">{title}</span>
        <span className="mt-0.5 block text-muted">{line}</span>
        <span className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-ink">
          <Clock size={16} weight="bold" aria-hidden />
          {time}
        </span>
      </span>
      <ArrowRight size={20} weight="bold" aria-hidden className="shrink-0 text-muted transition-transform duration-[var(--dur-ui)] group-hover:translate-x-0.5" />
    </Link>
  );
}
