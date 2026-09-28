"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AppleLogo, Broom, Devices, DownloadSimple, type Icon } from "@phosphor-icons/react";
import { askToKeepData, markPopupShown, popupBlocked, saveNudgeDue } from "@/lib/popups";
import { saveBackupFile } from "@/lib/save-backup";
import { updateSettings } from "@/lib/state";
import { act, useCourage } from "@/lib/store";
import { Companion } from "@/components/scene/companion";
import { Button } from "@/components/ui/button";
import { openPopup, PopupBanner, PopupDialog } from "./popup-dialog";

/** Safari (on iPhone, iPad or a Mac) can clear a site's data after about a week away. */
function isSafari() {
  const ua = navigator.userAgent;
  return /safari/i.test(ua) && !/chrome|chromium|crios|fxios|edg|android/i.test(ua);
}

function Risk({ icon: IconCmp, children }: { icon: Icon; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl bg-surface-2 p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-chrome text-on-chrome">
        <IconCmp size={18} weight="regular" aria-hidden />
      </span>
      <span className="pt-1.5 text-ink">{children}</span>
    </li>
  );
}

/**
 * "Keep your progress safe": progress lives only in this browser, so after
 * a few steps this explains what can wipe it and offers a backup file.
 * Once per visit at most, until they save a backup (it rests for 30 days)
 * or tick "Don't show this again".
 */
export function SaveNudge({ quiet }: { quiet: boolean }) {
  const store = useCourage();
  const ref = useRef<HTMLDialogElement>(null);
  const [stop, setStop] = useState(false);
  const [saved, setSaved] = useState(false);
  const [safari, setSafari] = useState(false);
  const stopId = useId();
  const due = store.hydrated && !quiet && saveNudgeDue(store, new Date());
  const name = store.companion?.name ?? "your firefly";

  // Once there is progress to keep, quietly ask the browser not to clear it.
  useEffect(() => {
    if (store.hydrated && store.records.length > 0) void askToKeepData();
  }, [store.hydrated, store.records.length]);

  useEffect(() => {
    if (!due) return;
    const t = window.setTimeout(() => {
      const d = ref.current;
      if (!d || d.open || popupBlocked()) return;
      setSafari(isSafari());
      markPopupShown();
      openPopup(d);
    }, 1600);
    return () => window.clearTimeout(t);
  }, [due]);

  // Stay mounted while open, even after saving makes it no longer due.
  if (!due && !saved) return null;

  const save = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hydrated: _h, ...state } = store;
    saveBackupFile(state);
    void askToKeepData(true);
    setSaved(true);
  };

  return (
    <PopupDialog
      ref={ref}
      titleId="save-nudge-title"
      title="Keep your progress safe"
      onClose={() => {
        if (stop) act((s) => updateSettings(s, { saveNudgeOff: true }));
        setSaved(false);
      }}
      banner={
        <PopupBanner>
          <Companion species="firefly" stage="waving" size={72} />
        </PopupBanner>
      }
    >
      <p className="text-ink">
        Your steps, your badges and {name} are saved in this browser, not in an account. A few things can wipe them:
      </p>
      <ul role="list" className="grid list-none gap-2 p-0">
        <Risk icon={Broom}>
          <strong>Clearing your browser data</strong>, or practising in a private window.
        </Risk>
        <Risk icon={Devices}>
          <strong>Another phone, computer or browser</strong> starts fresh.
        </Risk>
        {safari ? (
          <Risk icon={AppleLogo}>
            <strong>Safari</strong> can clear it after about a week away.
          </Risk>
        ) : null}
      </ul>

      <div>
        {saved ? (
          <p role="status" className="font-semibold text-ink">
            Backup saved. Keep the file somewhere safe.
          </p>
        ) : (
          <Button icon={DownloadSimple} onClick={save} className="w-full sm:w-auto">
            Save a backup
          </Button>
        )}
        <p className="mt-2 text-muted">A backup is one small file. Restore it in Me, on any device, to carry on where you left off.</p>
      </div>

      <form method="dialog" className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor={stopId} className="flex min-h-11 cursor-pointer items-center gap-3 text-ink">
          <input id={stopId} type="checkbox" checked={stop} onChange={(e) => setStop(e.target.checked)} className="h-5 w-5 accent-[var(--chrome)]" />
          Don&apos;t show this again
        </label>
        <Button type="submit" variant="secondary" className="w-full sm:w-auto">
          {saved ? "Done" : "Not now"}
        </Button>
      </form>
    </PopupDialog>
  );
}
