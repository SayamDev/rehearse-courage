"use client";

import { useEffect, useId, useRef, useState } from "react";
import { markPopupShown, nameAskDue, popupBlocked } from "@/lib/popups";
import { MAX_NAME, setName } from "@/lib/state";
import { act, useCourage } from "@/lib/store";
import { Companion } from "@/components/scene/companion";
import { Button } from "@/components/ui/button";
import { openPopup, PopupBanner, PopupDialog } from "./popup-dialog";

/**
 * "What should we call you?": asked once, on Home, of people who started
 * before first visit asked for a name. Saving, skipping or closing all count
 * as asked, so it never comes back. The name stays on this device.
 */
export function NameAsk({ pathname, quiet }: { pathname: string; quiet: boolean }) {
  const store = useCourage();
  const ref = useRef<HTMLDialogElement>(null);
  const inputId = useId();
  const [draft, setDraft] = useState("");
  const due = store.hydrated && !quiet && nameAskDue(store, pathname);

  useEffect(() => {
    if (!due) return;
    const t = window.setTimeout(() => {
      const d = ref.current;
      if (!d || d.open || popupBlocked()) return;
      markPopupShown();
      openPopup(d);
    }, 1200);
    return () => window.clearTimeout(t);
  }, [due]);

  if (!due) return null;

  return (
    <PopupDialog
      ref={ref}
      titleId="name-ask-title"
      title="What should we call you?"
      // Any way of closing counts as asked; a typed name is kept only when Save was pressed.
      onClose={() => act((s) => (s.nameAsked ? s : setName(s, null)))}
      banner={
        <PopupBanner>
          <Companion species={store.companion?.species ?? "firefly"} stage="waving" size={72} />
        </PopupBanner>
      }
    >
      <p className="text-ink">
        {store.companion?.name ?? "Your firefly"} would like to know. A first name or a nickname is plenty, and you can
        change it in Me.
      </p>
      <form
        method="dialog"
        onSubmit={() => {
          act((s) => setName(s, draft));
        }}
      >
        <label htmlFor={inputId} className="block font-semibold text-ink">
          Your name
        </label>
        <input
          id={inputId}
          type="text"
          value={draft}
          maxLength={MAX_NAME}
          autoComplete="given-name"
          onChange={(e) => setDraft(e.target.value)}
          className="mt-2 h-12 w-full rounded-full border border-line bg-surface-2 px-5 text-ink focus-visible:outline-3 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-3"
        />
        <p className="mt-2 text-sm text-muted">It stays on this device and is never sent anywhere.</p>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={() => ref.current?.close()} className="w-full sm:w-auto">
            Skip
          </Button>
          <Button type="submit" disabled={!draft.trim()} className="w-full sm:w-auto">
            Save
          </Button>
        </div>
      </form>
    </PopupDialog>
  );
}
