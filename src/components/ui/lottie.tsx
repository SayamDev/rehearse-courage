"use client";

import { useEffect, useRef } from "react";

/** Reduced motion from the device or from Me (data-motion on <html>). */
function prefersReducedMotion(): boolean {
  return document.documentElement.dataset.motion === "reduce" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Plays one of the app's Lottie animations (public/lottie, built by
 * scripts/lottie/build.mjs). The player loads only when an animation is on
 * screen. Under reduced motion it shows the final frame and never moves.
 * Always decorative: the text beside it says what happened.
 */
export function Lottie({ src, loop = false, className = "" }: { src: string; loop?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    let destroy: (() => void) | null = null;
    void (async () => {
      const [{ default: lottie }, data] = await Promise.all([
        import("lottie-web/build/player/lottie_light"),
        fetch(src).then((r) => r.json()),
      ]);
      if (!live || !ref.current) return;
      const reduce = prefersReducedMotion();
      const anim = lottie.loadAnimation({
        container: ref.current,
        renderer: "svg",
        loop: loop && !reduce,
        autoplay: !reduce,
        animationData: data,
      });
      if (reduce) anim.addEventListener("DOMLoaded", () => anim.goToAndStop(anim.totalFrames - 1, true));
      destroy = () => anim.destroy();
    })().catch(() => null);
    return () => {
      live = false;
      destroy?.();
    };
  }, [src, loop]);

  return <div ref={ref} aria-hidden className={className} />;
}
