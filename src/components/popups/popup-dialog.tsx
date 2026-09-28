"use client";

import type { ReactNode, Ref } from "react";
import { X } from "@phosphor-icons/react";

/**
 * The shared pop-up frame: a native modal <dialog> (focus trap, Escape and
 * the backdrop come with it), a teal banner with the companion,
 * the title and a Close button. Closing in any way calls `onClose`.
 */
export function PopupDialog({
  ref,
  titleId,
  title,
  banner,
  onClose,
  children,
}: {
  ref: Ref<HTMLDialogElement>;
  titleId: string;
  title: string;
  banner: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby={titleId}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(34rem,calc(100vw-2rem))] overflow-y-auto rounded-card border-0 bg-surface p-0 text-ink shadow-card ring-1 ring-line backdrop:bg-[color-mix(in_srgb,var(--chrome)_72%,transparent)]"
    >
      <div className="relative">
        {banner}
        <form method="dialog" className="absolute right-3 top-3">
          <button
            type="submit"
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-line bg-surface text-ink transition-colors duration-[var(--dur-ui)] hover:border-stone-dim"
          >
            <X size={20} weight="regular" aria-hidden />
          </button>
        </form>
      </div>
      <div className="flex flex-col gap-4 px-5 pb-6 pt-4 sm:px-7">
        <h2 id={titleId} tabIndex={-1} className="text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] text-ink outline-none">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}

/** Opens the dialog and starts at its title, so screen readers read it from the top and no button looks pre-selected. */
export function openPopup(d: HTMLDialogElement) {
  d.showModal();
  d.querySelector<HTMLElement>("h2")?.focus();
}

/** A short teal band with the companion in it (the app's only pictures are the firefly, the Body kit and badges). */
export function PopupBanner({ children }: { children?: ReactNode }) {
  return (
    <div className="relative flex h-28 items-end overflow-hidden bg-[color-mix(in_srgb,var(--accent)_22%,var(--surface))] px-5 pb-3 sm:h-32 sm:px-7">
      {children}
    </div>
  );
}
