"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowCounterClockwise, ArrowLeft, ArrowRight, ChatCircle, Check, Keyboard, Microphone, X } from "@phosphor-icons/react";
import { effectiveAge, words } from "@/lib/age";
import { browserAiDeps } from "@/lib/ai/browser";
import { canUseOnline, coachAnswer, transcribeAnswer } from "@/lib/ai/client";
import { COACH_NAME, coachLine, PRESSURE_LINES } from "@/lib/content/coach";
import { situationById } from "@/lib/content/situations";
import { LEVELS } from "@/lib/ladder";
import { ROOM_LABEL } from "@/lib/rooms";
import { checkCrisis } from "@/lib/safety/crisis";
import { useSpeak, waitForRecording } from "@/lib/speak";
import { looksLikeWords, NOT_WORDS } from "@/lib/sense";
import { saveRecording } from "@/lib/recordings";
import { checkListenCache, heardSomething, loadListener, transcribeOnDevice } from "@/lib/voice/listen";
import { recordStep } from "@/lib/state";
import { resolveLevel, stepResult, type StepResult } from "@/lib/step";
import { act, useCourage } from "@/lib/store";
import type { Level, RoomId, StepRecord } from "@/lib/types";
import { BodyDouble } from "@/components/scene/body-double";
import { PressureMoment } from "@/components/voice/pressure-moment";
import { SpokenLine } from "@/components/voice/spoken-line";
import { ROOM_ROLE } from "@/lib/voice/lines";
import { Button, ButtonLink } from "@/components/ui/button";
import { IdeaList } from "@/components/ui/idea-list";
import { PaperCard } from "@/components/ui/paper-card";
import { SpeakButton } from "@/components/ui/speak-button";
import { Switch } from "@/components/ui/switch";
import { StepDone } from "./step-done";

const TITLE = "text-[clamp(1.75rem,1.2rem+2vw,2.75rem)]";
const FIELD =
  "mt-2 block w-full rounded-2xl border border-line bg-surface px-4 py-3 text-ink placeholder:text-muted focus-visible:border-ink";

type Step = { id: string; room: RoomId; scene: string; ideas: string[]; mission: string; title: string };
/** What each practice step asks for, so every step reads as its own task, not the same question again. */
const TASK: Partial<Record<Level, string>> = {
  2: "Now put it into words.",
  3: "Now say it out loud, just to yourself.",
  4: "Now say it to Cobi.",
  5: "Now say it with everyone looking.",
};

const COBI_PLAYS: Record<RoomId, string> = {
  class: "Cobi plays your teacher and will answer you.",
  friends: "Cobi plays one of your friends and will answer you.",
  presenting: "Cobi plays someone in the audience and will answer you.",
  out: "Cobi plays the person serving you and will answer you.",
};

function taskHint(level: Level, room: RoomId): string {
  if (level === 2) return "Type it below, or whisper it to yourself, then press Done.";
  if (level === 3) return "Nobody is listening. The app only counts the seconds.";
  if (level === 4) return COBI_PLAYS[room];
  return "A little pressure, like the real moment. The words can be the same as before.";
}

type CobiReply = { text: string; source: "online" | "device" | "prewritten"; by: "speak" | "type"; heard?: string };

/** Resolves a pre-written situation or one of the person's own steps into what the page shows. */
function useStep(id: string): Step | null | undefined {
  const store = useCourage();
  const situation = situationById(id);
  if (situation) {
    return {
      id,
      room: situation.room,
      title: words(situation.title, store.age),
      scene: words(situation.scene, store.age),
      ideas: situation.ideas.map((i) => words(i, store.age)),
      mission: words(situation.mission, store.age),
    };
  }
  if (!store.hydrated) return undefined;
  const own = store.customSteps.find((c) => c.id === id);
  if (!own) return null;
  return { id, room: own.room, title: own.text, scene: own.text, ideas: [], mission: own.text };
}

/** A labelled multi-line field (label above, as everywhere in the app). */
function TextField({
  label,
  hint,
  value,
  onChange,
  fieldRef,
  rows = 3,
  describedBy,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  fieldRef?: React.Ref<HTMLTextAreaElement>;
  rows?: number;
  /** Extra element ids describing the field (e.g. a status message shown with it). */
  describedBy?: string;
}) {
  const id = useId();
  return (
    <div className="mt-5">
      <label htmlFor={id} className="block font-semibold text-ink">
        {label}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="text-muted">
          {hint}
        </p>
      ) : null}
      <textarea
        id={id}
        ref={fieldRef}
        rows={rows}
        maxLength={500}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={[hint ? `${id}-hint` : null, describedBy].filter(Boolean).join(" ") || undefined}
        className={FIELD}
      />
    </div>
  );
}

/**
 * The practice step ("/step/[id]?level=N"). One card: what is happening,
 * things you could say, the rough day switch, then the action for the
 * level (think, type or whisper, speak, speak to the coach, a little
 * pressure, try it for real). Finishing saves a StepRecord and shows the
 * step-done celebration in place. Any text typed is checked for crisis
 * words on the device first; if flagged, the step is still saved and the
 * support screen opens instead.
 */
export function StepView({ id, levelParam }: { id: string; levelParam?: string | string[] }) {
  const store = useCourage();
  const router = useRouter();
  const step = useStep(id);
  const level: Level = resolveLevel(levelParam, store.records, id);
  const online = canUseOnline(store);
  // At step 4, 13 and over with online help on: keep the audio in memory for one transcription.
  // Under 13 (never online): what they say at step 4 can be turned into text on this device, when they chose to.
  const listenHere = level === 4 && !online && effectiveAge(store.age) === "under13" && store.settings.deviceListen;
  useEffect(() => {
    if (!listenHere) return;
    void checkListenCache().then((saved) => {
      if (saved) void loadListener().catch(() => undefined);
    });
  }, [listenHere]);
  const speak = useSpeak({ keep: store.settings.keepRecordings, capture: level === 4 && (online || listenHere) });

  const [idea, setIdea] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [roughDay, setRoughDay] = useState(false);
  const [mode, setMode] = useState<"speak" | "type">("speak");
  const [result, setResult] = useState<StepResult | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [reply, setReply] = useState<CobiReply | null>(null);
  const [thinking, setThinking] = useState(false);
  // Typed text that looked like random letters: a gentle note instead of praise.
  const [notWords, setNotWords] = useState(false);
  const typeRef = useRef<HTMLTextAreaElement>(null);
  const focusType = useRef(false);
  const replyRef = useRef<HTMLElement>(null);
  const speakRef = useRef<HTMLButtonElement>(null);
  // Set by Try again: where focus goes once the reply block has gone.
  const againFocus = useRef<"speak" | "type" | null>(null);
  // False once the page has gone, so a late answer does not save a step or redirect.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // Microphone off or missing: fall back to typing, calmly, with the field focused.
  const typing = mode === "type" || speak.state === "blocked";
  useEffect(() => {
    if (speak.state === "blocked") typeRef.current?.focus();
  }, [speak.state]);

  useEffect(() => {
    if (mode === "type" && focusType.current) {
      focusType.current = false;
      typeRef.current?.focus();
    }
  }, [mode]);

  // The button that asked for Cobi's reply is replaced by the reply: move focus there so nobody is left on nothing.
  useEffect(() => {
    if (reply) {
      replyRef.current?.focus();
    } else if (againFocus.current) {
      // The speak button is not there when the microphone is off; the text field is.
      (againFocus.current === "type" ? typeRef.current : (speakRef.current ?? typeRef.current))?.focus();
      againFocus.current = null;
    }
  }, [reply]);

  // Level 5 optional timer: counts up, never down, only when the person turned timers on.
  const showTimer = level === 5 && store.settings.timers && result === null;
  useEffect(() => {
    if (!showTimer) return;
    const t = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [showTimer]);

  if (!store.hydrated || step === undefined) return null;

  if (step === null) {
    return (
      <div className="mx-auto max-w-[640px] px-4 pt-10">
        <h1 className={`${TITLE} text-ink`}>This step isn&apos;t on this device.</h1>
        <p className="mt-2 text-ink">Your own steps are saved only on the device where you added them.</p>
        <ButtonLink href="/map" className="mt-6" icon={ArrowRight} iconEnd>
          Go to the map
        </ButtonLink>
      </div>
    );
  }

  const roomPath = `/room/${step.room}`;

  if (result) return <StepDone result={result} room={step.room} title={step.title} />;

  const finish = ({ seconds, typed, crisis = false }: { seconds: number | null; typed: boolean; crisis?: boolean }) => {
    const record: StepRecord = { situationId: step.id, level, at: new Date().toISOString(), seconds, typed, roughDay };
    const before = store.records;
    const earned = act((s) => recordStep(s, record));
    // Then vs Now: a spoken step's recording is kept on this device when the person chose to keep recordings.
    const blob = speak.latest().recording;
    if (store.settings.keepRecordings && blob && seconds !== null) {
      void saveRecording(step.room, { at: record.at, situationId: step.id, level, blob });
    }
    speak.reset();
    const flagged = crisis || [text, note].some((t) => t.trim() && checkCrisis(t).crisis);
    if (flagged) {
      router.push(`/help?crisis=1&from=${encodeURIComponent(`/step/${step.id}`)}`);
      return;
    }
    setResult(stepResult(before, record, earned));
    window.scrollTo({ top: 0 });
  };

  /** Typed words only (never speech): random letters get a kind note and the field back, not a well done. */
  const wordsOk = () => {
    if (looksLikeWords(text)) return true;
    setNotWords(true);
    typeRef.current?.focus();
    return false;
  };
  const onType = (v: string) => {
    setText(v);
    setNotWords(false);
  };
  const notWordsNote = notWords ? (
    <p id="not-words" role="status" className="mt-2 text-ink">
      {NOT_WORDS}
    </p>
  ) : null;

  const spokenSeconds = () => (speak.seconds > 0 ? speak.seconds : null);

  /**
   * Step 4: Cobi answers what they said. Typed words, or (13 and over with
   * online help) the transcript of what they said, go to the coach; under
   * 13 and every fallback get a pre-written reply on the device. The words
   * are never saved.
   */
  const askCobi = async (by: "speak" | "type") => {
    if (thinking || (by === "type" && !wordsOk())) return;
    setThinking(true);
    const deps = browserAiDeps(store.settings.deviceModel);
    let answer = by === "type" ? text : "";
    if (by === "speak" && online) {
      const heard = await transcribeAnswer(store, await waitForRecording(speak.latest), speak.seconds, deps);
      if (!alive.current) return;
      if (heard.kind === "crisis") {
        finish({ seconds: spokenSeconds(), typed: false, crisis: true });
        return;
      }
      if (heard.kind === "text") answer = heard.text;
    }
    let heardHere: string | undefined;
    if (by === "speak" && listenHere) {
      const said = await transcribeOnDevice(await waitForRecording(speak.latest));
      if (!alive.current) return;
      if (heardSomething(said)) {
        if (checkCrisis(said!).crisis) {
          finish({ seconds: spokenSeconds(), typed: false, crisis: true });
          return;
        }
        answer = said!;
        heardHere = said!;
      }
    }
    const out = await coachAnswer(
      store,
      {
        situationId: step.id,
        room: step.room,
        scene: step.scene,
        prompt: words(coachLine(step.id), store.age),
        answer,
        seed: `${step.id}-${store.records.length}-${answer.length}`,
      },
      deps,
    );
    if (!alive.current) return;
    setThinking(false);
    if (out.kind === "crisis") {
      finish({ seconds: by === "speak" ? spokenSeconds() : null, typed: by === "type", crisis: true });
      return;
    }
    setReply({ text: out.text, source: out.source, by, heard: heardHere });
  };

  const againFromReply = () => {
    againFocus.current = reply?.by === "type" ? "type" : "speak";
    setReply(null);
    speak.reset();
  };

  const typeInstead = () => {
    speak.reset();
    focusType.current = true;
    setMode("type");
  };

  const speaking = LEVELS[level - 1].speaking;

  return (
    <div>
      <header className="mx-auto max-w-[640px] px-4 pt-6 md:pt-10">
        <Link href={roomPath} className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 font-semibold text-muted hover:text-ink">
          <ArrowLeft size={20} weight="bold" aria-hidden />
          {ROOM_LABEL[step.room]}
        </Link>
        <h1 className={`mt-1 ${TITLE} text-ink`}>Practice step</h1>
        <p className="mt-1 text-muted">
          {ROOM_LABEL[step.room]} step <span className="tabular">{level}</span>: {LEVELS[level - 1].name}
        </p>
        <div className="mt-4 empty:hidden">
          <BodyDouble part="companion" />
        </div>
      </header>

      <div className="px-4">
        <PaperCard className="relative mx-auto mt-5 max-w-[640px]">
          {TASK[level] ? (
            <>
              {/* Steps 2 to 5: the moment is a reminder; the new task is the heading. */}
              <p className="text-muted">The moment</p>
              <div className="mt-1">
                <SpokenLine role="narrator" text={step.scene} className="text-ink" />
              </div>
              <h2 className="mt-4 text-[clamp(1.4rem,1.1rem+1vw,1.85rem)] text-ink">{TASK[level]}</h2>
              <p className="mt-1 text-ink">{taskHint(level, step.room)}</p>
            </>
          ) : (
            <SpokenLine role="narrator" text={step.scene} as="h2" className="text-[clamp(1.4rem,1.1rem+1vw,1.85rem)] text-ink" />
          )}

          {level === 6 ? (
            <>
              <p className="mt-4 text-muted">Your mission</p>
              <div className="mt-1">
                <SpokenLine role="narrator" text={step.mission} className="text-lg font-semibold text-ink" />
              </div>
            </>
          ) : step.ideas.length > 0 && level === 1 ? (
            <div className="mt-5">
              <IdeaList ideas={step.ideas} value={idea} onChange={setIdea} />
            </div>
          ) : step.ideas.length > 0 ? (
            <details className="group mt-4 rounded-2xl bg-surface-2 px-4">
              <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-ink">Need a start? Show ideas</summary>
              <ul className="grid list-disc gap-1 pb-3 pl-6 text-ink marker:text-muted">
                {step.ideas.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </details>
          ) : null}

          {level === 4 ? (
            <figure className="mt-5 rounded-2xl bg-surface-2 px-4 py-3">
              <figcaption className="text-muted">{COACH_NAME}</figcaption>
              <div className="mt-1">
                <SpokenLine role={ROOM_ROLE[step.room]} text={words(coachLine(step.id), store.age)} as="blockquote" className="text-ink" autoPlay />
              </div>
            </figure>
          ) : null}
          {level === 4 && online ? (
            <p className="mt-2 text-muted">
              Cobi&apos;s reply comes from an online AI. What you say is not saved.{" "}
              <Link href="/privacy#ai" className="underline">
                How this works
              </Link>
            </p>
          ) : null}

          {level === 5 ? (
            <div className="mt-5 rounded-2xl bg-surface-2 px-4 py-3 text-ink">
              <p>{words(PRESSURE_LINES[step.room], store.age)}</p>
              <PressureMoment room={step.room} />
              {showTimer ? (
                <p className="tabular mt-1 text-muted" aria-hidden>
                  {elapsed} seconds
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 border-t border-line pt-2">
            <Switch checked={roughDay} onChange={setRoughDay} label="I'm having a rough day" />
          </div>

          {/* Level 1: think it. */}
          {level === 1 ? (
            <>
              <TextField
                label={step.ideas.length > 0 ? "Or write your own (optional)" : "Write it down (optional)"}
                value={text}
                onChange={onType}
                fieldRef={typeRef}
                describedBy={notWords ? "not-words" : undefined}
                rows={2}
              />
              {notWordsNote}
              <Button className="mt-6" icon={Check} onClick={() => wordsOk() && finish({ seconds: null, typed: text.trim() !== "" })}>
                I&apos;ve thought of it
              </Button>
            </>
          ) : null}

          {/* Level 2: type or whisper it. */}
          {level === 2 ? (
            <>
              <TextField
                label="Type it here"
                hint="Only you can see this, and it is not saved."
                value={text}
                onChange={onType}
                fieldRef={typeRef}
                describedBy={notWords ? "not-words" : undefined}
              />
              {notWordsNote}
              <Button className="mt-6" icon={Check} onClick={() => wordsOk() && finish({ seconds: null, typed: text.trim() !== "" })}>
                Done
              </Button>
            </>
          ) : null}

          {/* Levels 3 to 5: speak, or type instead. */}
          {speaking && !typing && !reply ? (
            <div className="mt-6">
              {speak.state === "done" ? (
                <>
                  <p className="text-ink" role="status">
                    {speak.seconds > 0
                      ? `You spoke for ${speak.seconds} second${speak.seconds === 1 ? "" : "s"}.`
                      : "All done. You can finish here or try again."}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {level === 4 ? (
                      <Button icon={ChatCircle} onClick={() => askCobi("speak")} aria-disabled={thinking}>
                        Hear Cobi&apos;s reply
                      </Button>
                    ) : (
                      <Button icon={Check} onClick={() => finish({ seconds: spokenSeconds(), typed: false })}>
                        Finish
                      </Button>
                    )}
                    <Button variant="secondary" icon={Microphone} onClick={speak.reset} disabled={thinking}>
                      Try again
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SpeakButton ref={speakRef} state={speak.state} level={speak.level} seconds={speak.seconds} onStart={speak.start} onStop={speak.stop} />
                    <Button variant="secondary" icon={Keyboard} onClick={typeInstead}>
                      Type instead
                    </Button>
                  </div>
                  <p className="mt-3 text-muted">
                    {speak.state === "listening"
                      ? "Take your time. Pauses and stumbles are fine."
                      : "Hold the button while you speak, or tap once to start and again to stop."}
                  </p>
                </>
              )}
            </div>
          ) : null}

          {speaking && typing && !reply ? (
            <>
              {speak.state === "blocked" ? (
                <p id="mic-off" className="mt-5 text-ink" role="status">
                  The microphone is off. You can type instead.
                </p>
              ) : null}
              <TextField
                label="Type what you would say"
                value={text}
                onChange={onType}
                fieldRef={typeRef}
                describedBy={[speak.state === "blocked" ? "mic-off" : null, notWords ? "not-words" : null].filter(Boolean).join(" ") || undefined}
              />
              {notWordsNote}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {level === 4 ? (
                  <Button icon={ChatCircle} onClick={() => askCobi("type")} aria-disabled={thinking}>
                    Hear Cobi&apos;s reply
                  </Button>
                ) : (
                  <Button icon={Check} onClick={() => wordsOk() && finish({ seconds: null, typed: true })}>
                    Done
                  </Button>
                )}
                <Button
                  variant="secondary"
                  icon={Microphone}
                  disabled={thinking}
                  onClick={() => {
                    speak.reset();
                    setMode("speak");
                  }}
                >
                  Speak instead
                </Button>
              </div>
            </>
          ) : null}

          {/* Step 4: Cobi's reply, announced when it arrives. */}
          {level === 4 ? (
            <div className="mt-5">
              <p role="status" className="min-h-0 text-ink">
                {thinking ? "Cobi is thinking." : ""}
              </p>
              {reply ? (
                <>
                  <figure ref={replyRef} tabIndex={-1} className="rounded-2xl bg-surface-2 px-4 py-3 outline-none">
                    {reply.heard ? <p className="mb-2 text-sm text-muted">Cobi heard: &ldquo;{reply.heard}&rdquo;</p> : null}
                    <figcaption className="text-muted">{COACH_NAME}</figcaption>
                    <div className="mt-1">
                      <SpokenLine role={ROOM_ROLE[step.room]} text={reply.text} as="blockquote" className="text-ink" autoPlay />
                    </div>
                  </figure>
                  {reply.source === "device" ? <p className="mt-2 text-muted">This reply came from the AI on this device.</p> : null}
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <Button
                      icon={Check}
                      onClick={() =>
                        finish({ seconds: reply.by === "speak" ? spokenSeconds() : null, typed: reply.by === "type" })
                      }
                    >
                      Finish
                    </Button>
                    <Button variant="secondary" icon={ArrowCounterClockwise} onClick={againFromReply}>
                      Try again
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          {/* Level 6: try it for real. */}
          {level === 6 ? (
            <>
              <TextField label="A note for yourself (optional)" value={note} onChange={setNote} rows={2} />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Button icon={Check} onClick={() => finish({ seconds: null, typed: false })}>
                  I did it
                </Button>
                <ButtonLink href={roomPath} variant="secondary" icon={X}>
                  Not yet
                </ButtonLink>
              </div>
              <p className="mt-3 text-muted">Not yet is fine. The mission will be here whenever you want it.</p>
            </>
          ) : null}
        </PaperCard>
        <div className="mx-auto mt-4 max-w-[640px]">
          <BodyDouble part="invite" />
        </div>
      </div>
    </div>
  );
}
