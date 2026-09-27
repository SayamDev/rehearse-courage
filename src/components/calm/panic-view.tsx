"use client";

import { Suspense, useEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, ShieldCheck, UsersThree, X } from "@phosphor-icons/react";
import { logEvent } from "@/lib/state";
import { act } from "@/lib/store";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Button } from "@/components/ui/button";
import { BreathingLantern } from "./breathing-lantern";
import { Grounding } from "./grounding";

const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

/** The URL without ?calm=1, keeping any other search params. */
function withoutCalm(pathname: string, params: URLSearchParams): string {
  const next = new URLSearchParams(params);
  next.delete("calm");
  const q = next.toString();
  return q ? `${pathname}?${q}` : pathname;
}

function PanicDialog({ onClose }: { onClose: () => void }) {
  const [grounding, setGrounding] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const returnTo = useRef<Element | null>(null);
  const logged = useRef(false);

  // Remember what had focus, move focus in, log the visit, stop the page behind from scrolling.
  useEffect(() => {
    returnTo.current = document.activeElement;
    headingRef.current?.focus();
    // Once per opening (effects can run twice in development).
    if (!logged.current) {
      logged.current = true;
      act((s) => logEvent(s, "panic", new Date()));
    }
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      if (returnTo.current instanceof HTMLElement) returnTo.current.focus();
    };
  }, []);

  // Keep Tab inside the dialog; Escape closes.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !dialogRef.current) return;
    const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === headingRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const reduce = useReducedMotion();

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="panic-title"
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-50 overflow-y-auto bg-canvas"
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-[70dvh] min-h-[420px]">
        <Image src="/art/panic.webp" alt="" fill priority sizes="100vw" className="object-cover object-center" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in srgb, var(--chrome) 70%, transparent), color-mix(in srgb, var(--chrome) 25%, transparent) 30%, transparent 55%, var(--canvas) 100%)",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-full max-w-[900px] flex-col px-4 pb-10 pt-6 md:pt-10">
        <header className="flex items-start justify-between gap-4 text-on-chrome">
          <div className="flex items-start gap-3">
            <ShieldCheck size={36} weight="regular" aria-hidden className="mt-1 shrink-0" />
            <div>
              <h1 id="panic-title" ref={headingRef} tabIndex={-1} className="text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] outline-none">
                Panic now
              </h1>
              <p className="mt-1">Take a breath. There is no rush.</p>
            </div>
          </div>
          <Button variant="chrome" size="md" icon={X} onClick={onClose} aria-label="Close Panic now">
            Close
          </Button>
        </header>

        <div className="mx-auto mt-[18dvh] w-full max-w-[560px] rounded-card bg-surface p-6 shadow-card sm:p-8">
          {grounding ? (
            <Grounding onDone={() => setGrounding(false)} />
          ) : (
            <>
              <BreathingLantern reduce={reduce} />
              <p className="mt-2 text-center text-ink">You are safe. This feeling will pass.</p>
            </>
          )}
        </div>

        {!grounding ? (
          <div className="mx-auto mt-5 grid w-full max-w-[760px] gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setGrounding(true)}
              className="flex min-h-11 items-center gap-4 rounded-card bg-surface p-4 text-left shadow-card transition-colors duration-[var(--dur-ui)] hover:bg-surface-2 active:bg-line/60"
            >
              <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-calm text-surface">
                <Eye size={30} weight="regular" />
              </span>
              <span className="flex-1">
                <span className="block font-display text-xl font-bold text-ink">5-4-3-2-1</span>
                <span className="block text-muted">Ground yourself in the present.</span>
              </span>
              <ArrowRight size={22} weight="regular" aria-hidden className="text-ink" />
            </button>
            <Link
              href="/help"
              className="flex min-h-11 items-center gap-4 rounded-card bg-surface p-4 shadow-card transition-colors duration-[var(--dur-ui)] hover:bg-surface-2 active:bg-line/60"
            >
              <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-chrome text-on-chrome">
                <UsersThree size={30} weight="regular" />
              </span>
              <span className="flex-1">
                <span className="block font-display text-xl font-bold text-ink">Talk to someone</span>
                <span className="block text-muted">Free support lines, any time.</span>
              </span>
              <ArrowRight size={22} weight="regular" aria-hidden className="text-ink" />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PanicLayerInner() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const open = params.get("calm") === "1";

  // Opened in the app (the Panic now link pushed ?calm=1): closing goes
  // back, so the browser's back button and Close do the same thing. Opened
  // straight from a link or a reload: there is nothing to go back to, so
  // closing just drops ?calm=1 from the URL.
  const prevOpen = useRef(open);
  const openedInApp = useRef(false);
  useEffect(() => {
    if (open && !prevOpen.current) openedInApp.current = true;
    if (!open) openedInApp.current = false;
    prevOpen.current = open;
  }, [open]);

  if (!open) return null;

  const close = () => {
    if (openedInApp.current) router.back();
    else router.replace(withoutCalm(pathname, new URLSearchParams(params.toString())), { scroll: false });
  };

  return <PanicDialog onClose={close} />;
}

/**
 * Panic now, available on every route: rendered by the app shell and
 * shown whenever the URL has ?calm=1 (the Panic now button adds it).
 * Full screen, focus trapped, Escape closes. Logs a panic event.
 */
export function PanicLayer() {
  return (
    <Suspense fallback={null}>
      <PanicLayerInner />
    </Suspense>
  );
}
