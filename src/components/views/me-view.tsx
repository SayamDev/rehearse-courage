"use client";

import { useId, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarCheck, DownloadSimple, Star, Trash, UploadSimple } from "@phosphor-icons/react";
import { removeModel } from "@/lib/ai/device";
import { importBackup } from "@/lib/backup";
import { stageFor, type Stage } from "@/lib/companion";
import { braveDaysThisWeek, missionsDone, totalPoints } from "@/lib/courage";
import { AGE_OPTIONS, hardThingOptions, toggleHardThing } from "@/lib/onboarding";
import { MAX_NAME, setAge, setHardThings, setName, updateSettings, type Settings, type TextSize, type Theme } from "@/lib/state";
import { saveBackupFile } from "@/lib/save-backup";
import { act, clearEverything, useCourage } from "@/lib/store";
import { Companion } from "@/components/scene/companion";
import { InstallApp } from "@/components/shell/install-app";
import { MicCheck } from "@/components/voice/mic-check";
import { ThenNow } from "./then-now";
import { Button } from "@/components/ui/button";
import { PaperCard } from "@/components/ui/paper-card";
import { braveDaysLabel, pointsLabel } from "@/components/ui/stats-pill";
import { Switch } from "@/components/ui/switch";
import { AiSettings } from "./ai-settings";
import { VoiceSettings } from "./voice-settings";

const STAGE_WORD: Record<Stage, string> = {
  hiding: "Curled up with their lantern",
  peeking: "Peeking out",
  waving: "Waving",
  speaking: "Standing tall",
};

type MeTab = "you" | "settings" | "voices" | "data";

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

/** Their name, saved only on this device: edit it or remove it. */
function NameField({ name }: { name: string | null }) {
  const inputId = useId();
  const statusId = useId();
  const [draft, setDraft] = useState(name ?? "");
  const [message, setMessage] = useState("");

  return (
    <form
      className="mt-3"
      onSubmit={(e) => {
        e.preventDefault();
        act((s) => setName(s, draft));
        setMessage(draft.trim() ? "Saved." : "Name removed.");
      }}
    >
      <label htmlFor={inputId} className="block font-semibold text-ink">
        Your name
      </label>
      <p className="text-muted">Shown on Home and here. It stays on this device.</p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id={inputId}
          type="text"
          value={draft}
          maxLength={MAX_NAME}
          autoComplete="given-name"
          aria-describedby={statusId}
          onChange={(e) => {
            setDraft(e.target.value);
            setMessage("");
          }}
          className="min-h-[52px] min-w-0 flex-1 rounded-2xl border border-line bg-surface px-4 text-ink focus-visible:border-ink"
        />
        <Button type="submit" variant="secondary">
          Save
        </Button>
        {name ? (
          <Button
            type="button"
            variant="secondary"
            icon={Trash}
            onClick={() => {
              act((s) => setName(s, null));
              setDraft("");
              setMessage("Name removed.");
            }}
          >
            Remove
          </Button>
        ) : null}
      </div>
      <p id={statusId} role="status" className="mt-2 min-h-[1.55em] text-ink">
        {message}
      </p>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="mt-4">
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
 * Me ("/me"): you at a glance (companion, name, this week), then four tabs
 * so nothing is a long scroll: You (details, Then and now), Settings
 * (switches, look, microphone), Voices & AI, and Your data (back up,
 * restore, install, delete). The tab is kept in the URL hash (#settings). Nothing here leaves the device except a backup file the
 * person saves themselves.
 */
export function MeView() {
  const store = useCourage();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [tab, setTab] = useState<MeTab>(() => {
    if (typeof window === "undefined") return "you";
    const h = window.location.hash.slice(1);
    return (["you", "settings", "voices", "data"] as const).includes(h as MeTab) ? (h as MeTab) : "you";
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);

  if (!store.hydrated) return null;

  const points = totalPoints(store.records);
  const stage = stageFor(points, missionsDone(store.records));
  const set = (patch: Partial<Settings>) => act((s) => updateSettings(s, patch));

  const download = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hydrated: _h, ...state } = store;
    saveBackupFile(state);
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

  const TABS: { id: MeTab; label: string }[] = [
    { id: "you", label: "You" },
    { id: "settings", label: "Settings" },
    { id: "voices", label: "Voices & AI" },
    { id: "data", label: "Your data" },
  ];

  const pick = (id: MeTab) => {
    setTab(id);
    try {
      history.replaceState(null, "", `#${id}`);
    } catch {
      // Not important: the tab still changes.
    }
  };

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const t = TABS[(next + TABS.length) % TABS.length];
    pick(t.id);
    document.getElementById(`me-tab-${t.id}`)?.focus();
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-6 md:px-8 md:pt-10">
      {/* You at a glance: companion, name, and this week, in one band. */}
      <div className="flex flex-col gap-5 rounded-card border-[1.5px] border-line bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:p-6">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {store.companion ? <Companion species={store.companion.species} stage={stage} size={80} /> : null}
          <div className="min-w-0">
            {/* Their name when they gave one; the nav label stays "Me". */}
            <h1 className="break-words text-[clamp(1.75rem,1.2rem+2vw,2.5rem)] text-ink">{store.name ?? "Me"}</h1>
            <p className="text-muted">
              {store.companion ? (
                <>
                  <span className="font-semibold text-ink">{store.companion.name}</span>: {STAGE_WORD[stage]}
                </>
              ) : (
                <Link href="/start" className="font-semibold text-ink underline">
                  Choose a companion
                </Link>
              )}
            </p>
          </div>
        </div>
        <ul role="list" className="flex list-none flex-wrap gap-2 p-0 sm:flex-col sm:items-end">
          <li className="inline-flex items-center gap-2 rounded-full bg-surface-2 py-1.5 pl-1.5 pr-3.5 font-semibold text-ink">
            <span aria-hidden className="flex size-7 items-center justify-center rounded-full border-2 border-die bg-sun text-[#13262b]">
              <CalendarCheck size={15} weight="bold" />
            </span>
            <span className="tabular">{braveDaysLabel(braveDaysThisWeek(store.records, new Date()))}</span>
          </li>
          <li className="inline-flex items-center gap-2 rounded-full bg-surface-2 py-1.5 pl-1.5 pr-3.5 font-semibold text-ink">
            <span aria-hidden className="flex size-7 items-center justify-center rounded-full border-2 border-die bg-accent text-[#13262b]">
              <Star size={15} weight="bold" />
            </span>
            <span className="tabular">{pointsLabel(points)}</span>
          </li>
        </ul>
      </div>

      <div role="tablist" aria-label="Me" className="mt-6 grid grid-cols-2 gap-1 rounded-[22px] bg-surface-2 p-1 sm:flex sm:rounded-full">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            id={`me-tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            aria-controls={`me-panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => pick(t.id)}
            onKeyDown={(e) => onTabKey(e, i)}
            className={`min-h-11 flex-1 whitespace-nowrap rounded-full px-4 font-display font-bold transition-colors duration-[var(--dur-feedback)] ${
              tab === t.id ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div id={`me-panel-${tab}`} role="tabpanel" aria-labelledby={`me-tab-${tab}`} className="mt-2 grid gap-x-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start lg:gap-x-8">
        {tab === "you" ? (
          <>
            <Section title="About you">
              <NameField name={store.name} />
              <fieldset className="mt-5">
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
            <Section title="Then and now">
              <ThenNow />
            </Section>
          </>
        ) : null}

        {tab === "settings" ? (
          <>
            <Section title="Settings">
              <div className="mt-3 divide-y divide-line">
                <Switch checked={store.settings.reduceMotion} onChange={(v) => set({ reduceMotion: v })} label="Reduce motion" />
                <Switch checked={store.settings.sounds} onChange={(v) => set({ sounds: v })} label="Sounds" />
                <Switch checked={store.settings.confetti} onChange={(v) => set({ confetti: v })} label="Celebrate when you finish a step" />
                <Switch checked={store.settings.timers} onChange={(v) => set({ timers: v })} label="Show a timer on step 5" />
                <Switch checked={store.settings.keepRecordings} onChange={(v) => set({ keepRecordings: v })} label="Keep my recordings on this device" />
                <Switch
                  checked={store.settings.bodyDouble}
                  onChange={(v) => set({ bodyDouble: v })}
                  label={`${store.companion?.name ?? "Your firefly"} practises beside you on a step`}
                />
              </div>
            </Section>
            <div className="grid content-start">
              <Section title="Look and feel">
                <fieldset className="mt-3">
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
              <div className="mt-6">
                <MicCheck />
              </div>
            </div>
          </>
        ) : null}

        {tab === "voices" ? (
          <>
            <Section title="Voices">
              <VoiceSettings />
            </Section>
            <Section title="AI help">
              <AiSettings />
            </Section>
          </>
        ) : null}

        {tab === "data" ? (
          <>
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
              <InstallApp className="mt-4" />
              <p role="status" className="mt-3 min-h-[1.55em] text-ink">
                {message}
              </p>
            </Section>
            <Section title="Start again">
              <p className="mt-1 text-muted">Removes your companion, steps, badges and settings from this device.</p>
              <div className="mt-4">
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
              <p className="mt-6 text-muted">
                <Link href="/about" className="underline">
                  About Rehearse Courage
                </Link>
                {" · "}
                <Link href="/for-adults" className="underline">
                  For parents and teachers
                </Link>
              </p>
            </Section>
          </>
        ) : null}
      </div>
    </div>
  );
}
