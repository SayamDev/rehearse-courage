"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { DownloadSimple, ShareNetwork, X, type Icon } from "@phosphor-icons/react";
import { effectiveAge } from "@/lib/age";
import { canvasBlob, cardFileName, drawCard, type CardContent } from "@/lib/share-card";
import { useCourage } from "@/lib/store";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

/** What a share card shows. An icon is drawn from the Phosphor component itself. */
export type ShareCard = Omit<CardContent, "art"> & {
  art: { type: "image"; src: string } | { type: "icon"; icon: Icon; ink: string } | { type: "number"; n: number };
};

/**
 * A button that opens "Share it": a preview of the picture (made on this
 * device), an optional "Add my name", then Share (where the device can
 * share a picture) and Save picture. Nothing leaves the device unless the
 * person sends it somewhere themselves.
 */
export function ShareButton({
  card,
  label = "Share",
  variant = "secondary",
  size = "md",
  className = "",
}: {
  card: ShareCard;
  /** Visible text; add a screen-reader-only part when several Share buttons sit on one page. */
  label?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button ref={trigger} variant={variant} size={size} icon={ShareNetwork} onClick={() => setOpen(true)} className={className}>
        {label}
      </Button>
      {open ? (
        <ShareDialog
          card={card}
          onClose={() => {
            setOpen(false);
            // Back to the button that opened it, so focus is never lost.
            requestAnimationFrame(() => trigger.current?.focus());
          }}
        />
      ) : null}
    </>
  );
}

function ShareDialog({ card, onClose }: { card: ShareCard; onClose: () => void }) {
  const store = useCourage();
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const iconBox = useRef<HTMLSpanElement>(null);
  const [withName, setWithName] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [canShareFiles] = useState(() => {
    try {
      const probe = new File([""], "x.png", { type: "image/png" });
      return typeof navigator !== "undefined" && !!navigator.canShare?.({ files: [probe] });
    } catch {
      return false;
    }
  });
  const kid = effectiveAge(store.age) === "under13";
  const name = store.name;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    d.showModal();
    d.querySelector<HTMLElement>("h2")?.focus();
  }, []);

  // Draw the picture whenever what it shows changes (not on every render of the page behind).
  const drawKey = JSON.stringify({ ...card, art: card.art.type === "icon" ? card.art.ink : card.art, withName, name });
  useEffect(() => {
    let live = true;
    const c = canvas.current;
    if (!c) return;
    const art =
      card.art.type === "icon"
        ? { type: "icon" as const, ink: card.art.ink, svg: iconBox.current?.querySelector("svg")?.outerHTML ?? "" }
        : card.art;
    const kicker = withName && name ? `${name} · ${card.kicker}` : card.kicker;
    void drawCard(c, { ...card, kicker, art }).then(() => {
      if (live) setPreview(c.toDataURL("image/png"));
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawKey]);

  const file = async () => {
    const blob = canvas.current ? await canvasBlob(canvas.current) : null;
    return blob ? new File([blob], cardFileName(card.title), { type: "image/png" }) : null;
  };

  const share = async () => {
    const f = await file();
    if (!f) return;
    try {
      await navigator.share({ files: [f], title: card.title, text: `${card.title} ${card.line}` });
      setStatus("Shared.");
    } catch {
      // Closing the share sheet is not an error worth showing.
    }
  };

  const save = async () => {
    const f = await file();
    if (!f) return;
    const url = URL.createObjectURL(f);
    const a = document.createElement("a");
    a.href = url;
    a.download = f.name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setStatus("Picture saved to your downloads.");
  };

  const IconArt = card.art.type === "icon" ? card.art.icon : null;

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby={titleId}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(30rem,calc(100vw-2rem))] overflow-y-auto rounded-card border-0 bg-surface p-0 text-ink shadow-card ring-1 ring-line backdrop:bg-[color-mix(in_srgb,var(--chrome)_72%,transparent)]"
    >
      <div className="flex flex-col gap-4 px-5 pb-6 pt-5 sm:px-7">
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} tabIndex={-1} className="text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] text-ink outline-none">
            Share it
          </h2>
          <form method="dialog">
            <button
              type="submit"
              aria-label="Close"
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-line bg-surface text-ink transition-colors duration-[var(--dur-ui)] hover:border-stone-dim"
            >
              <X size={20} weight="regular" aria-hidden />
            </button>
          </form>
        </div>

        {/* The icon, drawn once off screen, is copied into the picture. */}
        {IconArt ? (
          <span ref={iconBox} aria-hidden className="pointer-events-none absolute -left-[9999px] size-0 overflow-hidden">
            <IconArt size={160} weight="bold" />
          </span>
        ) : null}
        <canvas ref={canvas} className="hidden" />
        <div className="aspect-square w-full overflow-hidden rounded-2xl border border-line bg-surface-2">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={`Picture to share: ${card.kicker}. ${card.title}. ${card.line}`} className="h-full w-full" />
          ) : null}
        </div>

        {name ? <Switch checked={withName} onChange={setWithName} label="Add my name" /> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {canShareFiles ? (
            <Button icon={ShareNetwork} onClick={() => void share()} disabled={!preview}>
              Share
            </Button>
          ) : null}
          <Button variant={canShareFiles ? "secondary" : "primary"} icon={DownloadSimple} onClick={() => void save()} disabled={!preview}>
            Save picture
          </Button>
        </div>
        <p role="status" className="min-h-[1.55em] text-ink empty:min-h-0">
          {status}
        </p>
        <p className="text-sm text-muted">
          The picture is made on this device. Nothing is sent unless you send it.
          {kid ? " Ask a grown-up before you share it online." : ""}
        </p>
      </div>
    </dialog>
  );
}
