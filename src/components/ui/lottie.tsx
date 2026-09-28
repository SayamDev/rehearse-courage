"use client";

import { useEffect, useRef } from "react";
import { useDarkTheme } from "@/lib/use-dark-theme";

/** Reduced motion from the device or from Me (data-motion on <html>). */
function prefersReducedMotion(): boolean {
  return document.documentElement.dataset.motion === "reduce" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Plays one of the app's Lottie animations (public/lottie, built by
 * scripts/lottie/build.mjs). It starts once half of it is on screen. Under reduced motion it shows the final frame and never moves.
 * Always decorative: the text beside it says what happened.
 */
export function Lottie({
  src,
  data: given,
  still = false,
  loop = false,
  themed = false,
  className = "",
  style,
}: {
  src?: string;
  /** A document built in the browser, instead of a file (the Home greeting). */
  data?: object;
  /** Show the final frame without playing (e.g. already seen today). */
  still?: boolean;
  style?: React.CSSProperties;
  loop?: boolean;
  /** The animation has a "-dark.json" twin (type in light ink) for dark colours. */
  themed?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Only animations with a dark twin redraw when the colours change.
  const darkNow = useDarkTheme();
  const dark = themed && darkNow;
  // After the first play, a redraw (new colours) goes straight to the last frame instead of playing again.
  const played = useRef(false);

  useEffect(() => {
    let live = true;
    let destroy: (() => void) | null = null;
    void (async () => {
      const [{ default: lottie }, data] = await Promise.all([
        import("lottie-web/build/player/lottie_light"),
        given ?? fetch(dark ? src!.replace(/\.json$/, "-dark.json") : src!).then((r) => r.json()),
      ]);
      if (!live || !ref.current) return;
      const reduce = still || played.current || prefersReducedMotion();
      played.current = true;
      const anim = lottie.loadAnimation({
        container: ref.current,
        renderer: "svg",
        loop: loop && !reduce,
        autoplay: false,
        animationData: data,
      });
      if (reduce) {
        anim.addEventListener("DOMLoaded", () => anim.goToAndStop(anim.totalFrames - 1, true));
        destroy = () => anim.destroy();
        return;
      }
      // Starts when at least half of it is on screen, so nothing plays unseen.
      const seen = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            anim.play();
            seen.disconnect();
          }
        },
        { threshold: 0.5 },
      );
      seen.observe(ref.current);
      destroy = () => {
        seen.disconnect();
        anim.destroy();
      };
    })().catch(() => null);
    return () => {
      live = false;
      destroy?.();
    };
  }, [src, given, still, loop, dark]);

  return <div ref={ref} aria-hidden className={className} style={style} />;
}
