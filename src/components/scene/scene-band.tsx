import type { ReactNode } from "react";

/**
 * A full-bleed band of scene art, as in the comps: the art spans the whole
 * width instead of sitting as a boxed card on the canvas, and its lower edge
 * dissolves into the canvas so the paper card below can overlap it. On very
 * wide screens the art stops at 1680px and its sides fade out too.
 *
 * `header` sits over the night sky in the top-left, on the same left edge as
 * the page content (max 1100px), with a soft chrome scrim so it stays AA
 * readable at any sky tint.
 */
export function SceneBand({
  children,
  header,
  className = "",
}: {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative mx-auto max-w-[1680px] min-[1680px]:[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        {children}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4"
          style={{ background: "linear-gradient(to bottom, transparent, var(--canvas))" }}
        />
      </div>
      {header ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 h-[60%] w-[70%] max-w-[900px]"
            style={{ background: "radial-gradient(ellipse at top left, color-mix(in srgb, var(--chrome) 72%, transparent) 25%, transparent 70%)" }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
            <div className="mx-auto max-w-[1100px] px-4 pt-6 md:px-8 md:pt-10">
              {/* Only the header itself takes clicks, so stones under the scrim stay tappable. */}
              <div className="pointer-events-auto w-fit max-w-[60%] text-on-chrome">{header}</div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
