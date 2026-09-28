import type { ReactNode } from "react";

/**
 * The recurring white sheet: white surface, a hairline border and one soft
 * shadow, 20px corners (the Sticker Book card). The name is kept from the
 * first design so every screen picks the new look up at once.
 */
export function PaperCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-card border-[1.5px] border-line bg-surface p-6 text-ink shadow-card sm:p-8 ${className}`}>{children}</div>;
}
