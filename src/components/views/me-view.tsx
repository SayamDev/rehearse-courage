"use client";

import { useId, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DownloadSimple, Trash, UploadSimple } from "@phosphor-icons/react";
import { removeModel } from "@/lib/ai/device";
import { backupFilename, exportBackup, importBackup } from "@/lib/backup";
import { stageFor, type Stage } from "@/lib/companion";
import { braveDaysThisWeek, missionsDone, totalPoints } from "@/lib/courage";
import { AGE_OPTIONS, hardThingOptions, toggleHardThing } from "@/lib/onboarding";
import { setAge, setHardThings, updateSettings, type Settings, type TextSize, type Theme } from "@/lib/state";
import { act, clearEverything, useCourage } from "@/lib/store";
import { Companion } from "@/components/scene/companion";
import { Button } from "@/components/ui/button";
import { PaperCard } from "@/components/ui/paper-card";
import { StatsPill } from "@/components/ui/stats-pill";
import { Switch } from "@/components/ui/switch";
import { AiSettings } from "./ai-settings";

const STAGE_WORD: Record<Stage, string> = {
  hiding: "Curled up with their lantern",
  peeking: "Peeking out",
  waving: "Waving",
  speaking: "Standing tall",
};

const TEXT_SIZES: { value: TextSize; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "large", label: "Large" },
  { value: "larger", label: "Larger" },
];

const THEMES: { value: Theme; label: string }[] = [
  { value: "system", label: "Match my device" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const CHIP =
  "flex min-h-11 items-center rounded-full border px-4 py-2.5 font-semibold transition-colors duration-[var(--dur-ui)] ease-[var(--ease-out)] focus-visible:outline-3 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-3";
const chip = (on: boolean) =>
  `${CHIP} ${on ? "border-transparent bg-chrome text-on-chrome" : "border-line bg-surface-2 text-ink hover:bg-line/50 active:bg-line/70"}`;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="mt-6">
      <PaperCard>
        <h2 id={id} className="text-2xl text-ink">
          {title}
        </h2>
        {children}
      </PaperCard>
    </section>
  );
}

/**
 * Me ("/me"): the companion and progress, settings, what the app knows
 * about you (editable), AI help (13 and over), and your data: back up,
 * restore, delete. Nothing here leaves the device except a backup file the
 * person saves themselves.
 */
export function MeView() {
  const store = useCourage();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);

  if (!store.hydrated) return null;

  const points = totalPoints(store.records);
  const stage = stageFor(points, missionsDone(store.records));
  const set = (patch: Partial<Settings>) => act((s) => updateSettings(s, patch));

  const download = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hydrated: _h, ...state } = store;
    const url = URL.createObjectURL(new Blob([exportBackup(state)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = backupFilename(new Date());
    a.click();
    // Later, so Safari and older Firefox have started the download first.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Backup saved. Keep the file somewhere safe.");
  };

  const restore = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    // Clear first so the same message is announced again on a repeat.
    setMessage("");
    await new Promise((r) => requestAnimationFrame(r));
    try {
      const next = importBackup(await file.text());
      act(() => next);
      setMessage("Your progress is back.");
    } catch {
      setMessage("That file isn't a Rehearse Courage backup.");
    }
  };

  return (
    <div className="mx-auto max-w-[720px] px-4 pt-6 md:pt-10">
      <h1 className="text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] text-ink">Me</h1>

      <PaperCard className="mt-5">
        <div className="flex items-center gap-5">
          {store.companion ? <Companion species={store.companion.species} stage={stage} size={88} /> : null}
          <div>
            <p className="font-display text-2xl font-bold text-ink">{store.companion?.name ?? "No companion yet"}</p>
            {store.companion ? <p className="text-muted">{STAGE_WORD[stage]}</p> : <Link href="/start" className="font-semibold text-ink underline">Choose a companion</Link>}
          </div>
        </div>
      </PaperCard>
      {/* Outside the card: the pill needs the full phone width. */}
      <div className="mt-4 flex justify-center sm:justify-start">
        <StatsPill braveDays={braveDaysThisWeek(store.records, new Date())} points={points} />
      </div>

      <Section title="Settings">
        <div className="mt-3 divide-y divide-line">
          <Switch checked={store.settings.reduceMotion} onChange={(v) => set({ reduceMotion: v })} label="Reduce motion" />
          <Switch checked={store.settings.sounds} onChange={(v) => set({ sounds: v })} label="Sounds" />
          <Switch checked={store.settings.confetti} onChange={(v) => set({ confetti: v })} label="Paper sparks when you finish a step" />
          <Switch checked={store.settings.timers} onChange={(v) => set({ timers: v })} label="Show a timer on step 5" />
          <Switch
            checked={store.settings.keepRecordings}
            onChange={(v) => set({ keepRecordings: v })}
            label="Keep my recordings on this device"
          />
        </div>
        <fieldset className="mt-4">
          <legend className="font-semibold text-ink">Text size</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {TEXT_SIZES.map((t) => (
              <button key={t.value} type="button" aria-pressed={store.settings.textSize === t.value} onClick={() => set({ textSize: t.value })} className={chip(store.settings.textSize === t.value)}>
                {t.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-4">
          <legend className="font-semibold text-ink">Theme</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button key={t.value} type="button" aria-pressed={store.settings.theme === t.value} onClick={() => set({ theme: t.value })} className={chip(store.settings.theme === t.value)}>
                {t.label}
              </button>
            ))}
          </div>
        </fieldset>
      </Section>

      <Section title="About you">
        <fieldset className="mt-3">
          <legend className="font-semibold text-ink">Age</legend>
          <p className="text-muted">Not set means the app treats you as under 13.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {AGE_OPTIONS.map((o) => (
              <button key={o.value} type="button" aria-pressed={store.age === o.value} onClick={() => act((s) => setAge(s, store.age === o.value ? null : o.value))} className={chip(store.age === o.value)}>
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-5">
          <legend className="font-semibold text-ink">What feels hard</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {hardThingOptions().map((o) => {
              const on = store.hardThings.includes(o.id);
              return (
                <button key={o.id} type="button" aria-pressed={on} onClick={() => act((s) => setHardThings(s, toggleHardThing(s.hardThings, o.id)))} className={chip(on)}>
                  {o.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </Section>

      <Section title="AI help">
        <AiSettings />
      </Section>

      <Section title="Your data">
        <p className="mt-1 text-ink">
          Everything is saved only on this device. A backup lets you move it or keep it safe.{" "}
          <Link href="/privacy" className="font-semibold underline">
            How privacy works
          </Link>
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Button variant="secondary" icon={DownloadSimple} onClick={download}>
            Save a backup
          </Button>
          <Button variant="secondary" icon={UploadSimple} onClick={() => fileRef.current?.click()}>
            Restore a backup
          </Button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={restore} className="sr-only" tabIndex={-1} aria-hidden />
        <p role="status" className="mt-3 min-h-[1.55em] text-ink">
          {message}
        </p>

        <div className="mt-4 border-t border-line pt-4">
          {confirming ? (
            <div role="group" aria-labelledby="delete-q">
              <p id="delete-q" className="font-semibold text-ink">
                Delete everything on this device? Your companion, steps and badges will be gone.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Button
                  variant="secondary"
                  icon={Trash}
                  onClick={() => {
                    // Also delete a saved on-device model (its library only loads if there is one).
                    if (store.settings.deviceModel) void removeModel().catch(() => {});
                    clearEverything();
                    router.replace("/start");
                  }}
                >
                  Yes, delete everything
                </Button>
                <Button
                  variant="chrome"
                  autoFocus
                  onClick={() => {
                    setConfirming(false);
                    requestAnimationFrame(() => deleteRef.current?.focus());
                  }}
                >
                  Keep my progress
                </Button>
              </div>
            </div>
          ) : (
            <Button ref={deleteRef} variant="secondary" icon={Trash} onClick={() => setConfirming(true)}>
              Delete everything
            </Button>
          )}
        </div>
      </Section>

      <p className="mt-6 text-muted">
        <Link href="/about" className="underline">
          About Rehearse Courage
        </Link>
      </p>
    </div>
  );
}
