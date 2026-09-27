"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight, DeviceMobile, Lifebuoy, Path, Star, type Icon } from "@phosphor-icons/react";
import { markPopupShown, welcomeDue } from "@/lib/popups";
import { markWelcomed } from "@/lib/state";
import { act, useCourage } from "@/lib/store";
import { Companion } from "@/components/scene/companion";
import { Button } from "@/components/ui/button";
import { openPopup, PopupBanner, PopupDialog } from "./popup-dialog";

function Point({ icon: IconCmp, title, children }: { icon: Icon; title: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl bg-surface-2 p-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-chrome text-on-chrome">
        <IconCmp size={20} weight="regular" aria-hidden />
      </span>
      <span>
        <span className="block font-semibold text-ink">{title}</span>
        <span className="block text-ink">{children}</span>
      </span>
    </li>
  );
}

/**
 * First visit only: after naming the firefly, a short guide to how the app
 * works, on Home, before any practice. Closing it in any way counts as seen.
 */
export function WelcomeGuide({ pathname, quiet }: { pathname: string; quiet: boolean }) {
  const store = useCourage();
  const ref = useRef<HTMLDialogElement>(null);
  const due = store.hydrated && !quiet && welcomeDue(store, pathname);
  const name = store.companion?.name ?? "Your firefly";

  useEffect(() => {
    if (!due) return;
    const t = window.setTimeout(() => {
      const d = ref.current;
      if (!d || d.open || document.querySelector("dialog[open], [role=dialog]")) return;
      markPopupShown();
      openPopup(d);
    }, 700);
    return () => window.clearTimeout(t);
  }, [due]);

  if (!due) return null;

  return (
    <PopupDialog
      ref={ref}
      titleId="welcome-title"
      title={`${name} is ready when you are`}
      onClose={() => act(markWelcomed)}
      banner={
        <PopupBanner art={<Image src="/art/home-class.webp" alt="" fill sizes="34rem" className="object-cover object-[50%_30%]" />}>
          <Companion species="firefly" stage="hiding" size={72} />
        </PopupBanner>
      }
    >
      <p className="text-ink">A few things that help, before your first step.</p>
      <ul role="list" className="grid list-none gap-2 p-0">
        <Point icon={Path} title="One small step at a time">
          Each situation has six steps, from thinking it to trying it for real. Go up or down whenever you like.
        </Point>
        <Point icon={Star} title="Every go counts">
          {name} grows braver each time you try. Points are for trying, never for how you sound.
        </Point>
        <Point icon={Lifebuoy} title="Panic now is always here">
          In the corner of every page: slow breathing, grounding, and people you can talk to.
        </Point>
        <Point icon={DeviceMobile} title="It stays on this device">
          No account and no ads. Your practice is saved in this browser, and only you can see it.
        </Point>
      </ul>
      <form method="dialog">
        <Button type="submit" icon={ArrowRight} iconEnd className="w-full sm:w-auto">
          Let&apos;s start
        </Button>
      </form>
    </PopupDialog>
  );
}
