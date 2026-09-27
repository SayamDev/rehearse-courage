"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowCounterClockwise, ArrowLeft, ArrowRight, ChatCircle, Check, Keyboard, Microphone, X } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { browserAiDeps } from "@/lib/ai/browser";
import { canUseOnline, coachAnswer, transcribeAnswer } from "@/lib/ai/client";
import { COACH_NAME, coachLine, PRESSURE_LINES } from "@/lib/content/coach";
import { situationById } from "@/lib/content/situations";
import { LEVELS } from "@/lib/ladder";
import { ROOM_LABEL } from "@/lib/rooms";
import { checkCrisis } from "@/lib/safety/crisis";
import { useSpeak, waitForRecording } from "@/lib/speak";
import { recordStep } from "@/lib/state";
import { resolveLevel, stepResult, type StepResult } from "@/lib/step";
import { act, useCourage } from "@/lib/store";
import type { Level, RoomId, StepRecord } from "@/lib/types";
import { SceneArt } from "@/components/scene/scene-art";
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
type CobiReply = { text: string; source: "online" | "device" | "prewritten"; by: "speak" | "type" };

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
  const speak = useSpeak({ keep: store.settings.keepRecordings, capture: level === 4 && online });

  const [idea, setIdea] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [roughDay, setRoughDay] = useState(false);
  const [mode, setMode] = useState<"speak" | "type">("speak");
  const [result, setResult] = useState<StepResult | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [reply, setReply] = useState<CobiReply | null>(null);
  const [thinking, setThinking] = useState(false);
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
    speak.reset();
    const flagged = crisis || [text, note].some((t) => t.trim() && checkCrisis(t).crisis);
    if (flagged) {
      router.push(`/help?crisis=1&from=${encodeURIComponent(`/step/${step.id}`)}`);
      return;
    }
    setResult(stepResult(before, record, earned));
    window.scrollTo({ top: 0 });
  };

  const spokenSeconds = () => (speak.seconds > 0 ? speak.seconds : null);

  /**
   * Step 4: Cobi answers what they said. Typed words, or (13 and over with
   * online help) the transcript of what they said, go to the coach; under
   * 13 and every fallback get a pre-written reply on the device. The words
   * are never saved.
   */
  const askCobi = async (by: "speak" | "type") => {
    if (thinking) return;
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
    setReply({ text: out.text, source: out.source, by });
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
    <div className="mx-auto max-w-[1100px] px-4 pt-6 md:pt-10">
      <Link href={roomPath} className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-ink hover:underline">
        <ArrowLeft size={22} weight="regular" aria-hidden />
        {ROOM_LABEL[step.room]}
      </Link>
      <h1 className={`mt-2 ${TITLE} text-ink`}>Practice step</h1>
      <p className="text-muted">
        {ROOM_LABEL[step.room]} step <span className="tabular">{level}</span>: {LEVELS[level - 1].name}
      </p>

      <div className="relative mx-auto mt-5 h-[24dvh] min-h-[150px] max-w-[720px] overflow-hidden rounded-card md:h-[260px]">
        <SceneArt room={step.room} priority className="object-top" />
      </div>

      <PaperCard className="relative mx-auto -mt-8 max-w-[640px]">
        <h2 className="text-[clamp(1.4rem,1.1rem+1vw,1.85rem)] text-ink">{step.scene}</h2>

        {level === 6 ? (
          <>
            <p className="mt-4 text-muted">Your mission</p>
            <p className="mt-1 text-lg font-semibold text-ink">{step.mission}</p>
          </>
        ) : step.ideas.length > 0 ? (
          <div className="mt-5">
            <IdeaList ideas={step.ideas} value={idea} onChange={setIdea} />
          </div>
        ) : null}

        {level === 4 ? (
          <figure className="mt-5 rounded-2xl bg-surface-2 px-4 py-3">
            <figcaption className="text-muted">{COACH_NAME}</figcaption>
            <blockquote className="mt-1 text-ink">{words(coachLine(step.id), store.age)}</blockquote>
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
              onChange={setText}
              rows={2}
            />
            <Button className="mt-6" icon={Check} onClick={() => finish({ seconds: null, typed: text.trim() !== "" })}>
              I&apos;ve thought of it
            </Button>
          </>
        ) : null}

        {/* Level 2: type or whisper it. */}
        {level === 2 ? (
          <>
            <TextField
              label="Type it here"
              hint="Or whisper it to yourself, then press Done."
              value={text}
              onChange={setText}
            />
            <Button className="mt-6" icon={Check} onClick={() => finish({ seconds: null, typed: text.trim() !== "" })}>
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
                  <SpeakButton ref={speakRef} state={speak.state} onStart={speak.start} onStop={speak.stop} />
                  <Button variant="secondary" icon={Keyboard} onClick={typeInstead}>
                    Type instead
                  </Button>
                </div>
                <p className="mt-3 text-muted">
                  {speak.state === "listening" ? (
                    <span className="tabular" aria-hidden>
                      {speak.seconds} seconds so far
                    </span>
                  ) : (
                    "Hold the button while you speak, or tap once to start and again to stop."
                  )}
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
              onChange={setText}
              fieldRef={typeRef}
              describedBy={speak.state === "blocked" ? "mic-off" : undefined}
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {level === 4 ? (
                <Button icon={ChatCircle} onClick={() => askCobi("type")} aria-disabled={thinking}>
                  Hear Cobi&apos;s reply
                </Button>
              ) : (
                <Button icon={Check} onClick={() => finish({ seconds: null, typed: true })}>
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
                  <figcaption className="text-muted">{COACH_NAME}</figcaption>
                  <blockquote className="mt-1 text-ink">{reply.text}</blockquote>
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
    </div>
  );
}
