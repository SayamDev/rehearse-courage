import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";

/**
 * One body-kit tool: round illustration, title, one line of copy, an arrow
 * and a small "helps with" chip. Matches the two-column tile grid on the
 * kit comp. The whole tile is the link, so touch targets stay generous.
 */
export function ToolTile({
  href,
  art,
  title,
  line,
  helps,
}: {
  href: string;
  art: string;
  title: string;
  line: string;
  helps: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-card border border-line bg-surface p-4 transition-colors duration-[var(--dur-ui)] ease-[var(--ease-out)] hover:bg-surface-2 active:bg-surface-2 focus-visible:outline-3 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-3"
    >
      <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-surface-2">
        <Image src={art} alt="" fill sizes="64px" className="object-cover" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="font-display text-lg font-bold text-ink">{title}</span>
          <ArrowRight
            size={20}
            weight="regular"
            aria-hidden
            className="shrink-0 text-muted transition-transform duration-[var(--dur-ui)] ease-[var(--ease-out)] group-hover:translate-x-0.5"
          />
        </span>
        <span className="mt-0.5 block text-sm text-muted">{line}</span>
        <span className="mt-2 inline-block rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-ink">
          {helps}
        </span>
      </span>
    </Link>
  );
}
