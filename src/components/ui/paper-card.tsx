import type { ReactNode } from "react";

/**
 * The recurring paper surface: torn edge on all four sides via a CSS mask
 * (public/torn-edge.svg), warm surface tone and one soft shadow. Padding
 * keeps content clear of the tear. When masks are not supported the mask
 * properties are simply ignored, so the fallback is a plain 20px-radius
 * card (radius set unconditionally, mask layered on top).
 */
export function PaperCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-card bg-surface p-6 text-ink shadow-card [mask-image:url(/torn-edge.svg)] [mask-size:100%_100%] [mask-repeat:no-repeat] sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
