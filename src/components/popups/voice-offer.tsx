"use client";

import { useEffect, useRef } from "react";
import { markPopupShown, popupBlocked, voiceOfferDue } from "@/lib/popups";
import { markVoiceOffered } from "@/lib/state";
import { act, useCourage } from "@/lib/store";
import { checkKokoroCache, kokoroSupported } from "@/lib/voice/kokoro";
import { Companion } from "@/components/scene/companion";
import { Button } from "@/components/ui/button";
import { NaturalVoice } from "@/components/views/voice-settings";
import { openPopup, PopupBanner, PopupDialog } from "./popup-dialog";

/**
 * "A natural voice for every line": offered once, on Home, after a first
 * practice. Never downloads by itself; the person taps Download (with the
 * size and a mobile-data warning). Closing in any way counts as offered,
 * and the same download stays in Me.
 */
export function VoiceOffer({ pathname, quiet }: { pathname: string; quiet: boolean }) {
  const store = useCourage();
  const ref = useRef<HTMLDialogElement>(null);
  const due = store.hydrated && !quiet && voiceOfferDue(store, pathname);

  useEffect(() => {
    if (!due) return;
    let live = true;
    const t = window.setTimeout(async () => {
      const d = ref.current;
      if (!live || !d || d.open || popupBlocked()) return;
      // Nothing to offer on a device too small for it, or where it is already saved.
      if (!kokoroSupported() || (await checkKokoroCache())) {
        act(markVoiceOffered);
        return;
      }
      markPopupShown();
      openPopup(d);
    }, 1400);
    return () => {
      live = false;
      window.clearTimeout(t);
    };
  }, [due]);

  if (!due) return null;

  return (
    <PopupDialog
      ref={ref}
      titleId="voice-offer-title"
      title="A natural voice for every line"
      onClose={() => act(markVoiceOffered)}
      banner={
        <PopupBanner>
          <Companion species={store.companion?.species ?? "firefly"} stage="speaking" size={72} />
        </PopupBanner>
      }
    >
      <p className="text-ink">
        The teacher, your friends and Cobi already have recorded voices. Tap Hear it beside a line to listen.
      </p>
      <p className="text-ink">
        For everything else, like your own steps, you can save a natural voice on this device. It is free, works without the internet once
        saved, and nothing you type leaves the device.
      </p>
      <NaturalVoice onDone={() => act(markVoiceOffered)} />
      <form method="dialog" className="flex justify-end">
        <Button type="submit" variant="secondary" className="w-full sm:w-auto">
          Not now
        </Button>
      </form>
    </PopupDialog>
  );
}
