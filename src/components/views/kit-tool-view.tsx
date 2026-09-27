"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { ACCEPTANCE_LINES, BODY_EXPLAINERS, kitTool, SPEECH_TOOLS, type KitToolId } from "@/lib/content/body";
import { FRAMES } from "@/lib/content/phrases";
import { checkCrisis } from "@/lib/safety/crisis";
import { logEvent } from "@/lib/state";
import { act, useCourage } from "@/lib/store";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { BreathingLantern } from "@/components/calm/breathing-lantern";
import { Grounding } from "@/components/calm/grounding";
import { ReframeCards } from "@/components/calm/reframe-cards";
import { RescueDeck } from "@/components/calm/rescue-deck";
import { IdeaList } from "@/components/ui/idea-list";
import { PaperCard } from "@/components/ui/paper-card";

/** Sentence frames: pick a shape, then fill the gaps in the box (in your head, out loud, or typed). Nothing is saved. */
function Frames({ age, onCrisis }: { age: ReturnType<typeof useCourage>["age"]; onCrisis: () => void }) {
  const frames = FRAMES.map((f) => words(f.text, age));
  const [frame, setFrame] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const id = useId();
  return (
    <>
      <p className="text-ink">Pick a shape, then fill in the gaps. You can say it in your head, out loud, or type it.</p>
      <div className="mt-4">
        <IdeaList
          ideas={frames}
          value={frame}
          onChange={(f) => {
            setFrame(f);
            setDraft(f);
          }}
          label="Sentence frames"
        />
      </div>
      <label htmlFor={id} className="mt-5 block font-semibold text-ink">
        Build your sentence
      </label>
      <p id={`${id}-hint`} className="text-muted">
        Only you can see this, and it is not saved.
      </p>
      <textarea
        id={id}
        rows={3}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        // Checked on the device, like every typed text in the app.
        onBlur={() => {
          if (draft.trim() && checkCrisis(draft).crisis) onCrisis();
        }}
        aria-describedby={`${id}-hint`}
        className="mt-2 block w-full rounded-2xl border border-line bg-surface px-4 py-3 text-ink focus-visible:border-ink"
      />
    </>
  );
}

/** Speech tools as options, with acceptance lines. Never measured, never required. */
function SpeechTools({ age }: { age: ReturnType<typeof useCourage>["age"] }) {
  return (
    <>
      <p className="text-ink">Some people like these when words get stuck. They are options, not rules. Try one, or none.</p>
      <h2 className="mt-5 text-2xl text-ink">Worth remembering first</h2>
      <ul className="mt-3 grid list-disc gap-2 pl-6 text-ink marker:text-muted">
        {ACCEPTANCE_LINES.map((l) => (
          <li key={l.kid}>{words(l, age)}</li>
        ))}
      </ul>
      <h2 className="mt-8 text-2xl text-ink">Tools to try, if you want</h2>
      <ul role="list" className="mt-3 grid list-none gap-3 p-0">
        {SPEECH_TOOLS.map((t) => (
          <li key={t.id} className="rounded-card bg-surface-2 p-4">
            <h3 className="text-xl text-ink">{t.title}</h3>
            <p className="mt-1 text-ink">{words(t.how, age)}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * One body-kit tool ("/kit/[tool]"). Opening a tool logs a kit event
 * once, which feeds the Calm captain badge and daily quests.
 */
export function KitToolView({ tool }: { tool: KitToolId }) {
  const { age, hydrated } = useCourage();
  const router = useRouter();
  const reduce = useReducedMotion();
  const meta = kitTool(tool)!;
  const [groundingDone, setGroundingDone] = useState(false);
  const logged = useRef(false);
  const doneHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!hydrated || logged.current) return;
    logged.current = true;
    act((s) => logEvent(s, "kit", new Date()));
  }, [hydrated]);

  return (
    <div className="mx-auto max-w-[720px] px-4 pt-6 md:pt-10">
      <Link href="/kit" className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-ink hover:underline">
        <ArrowLeft size={22} weight="regular" aria-hidden />
        Body kit
      </Link>
      <h1 className="mt-2 text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] text-ink">{meta.title}</h1>
      <p className="mt-1 text-muted">{words(meta.line, age)}</p>

      <PaperCard className="mt-6">
        {tool === "breathing" ? (
          <>
            <BreathingLantern reduce={reduce} />
            <p className="mt-4 text-center text-ink">Stay as long as you like. Three or four slow breaths is enough to notice a change.</p>
          </>
        ) : null}

        {tool === "grounding" ? (
          groundingDone ? (
            <div className="text-center">
              <h2 ref={doneHeading} tabIndex={-1} className="text-2xl text-ink outline-none">
                You came back to right here.
              </h2>
              <p className="mt-2 text-ink">You can do this any time, anywhere, and nobody needs to know.</p>
              <button type="button" onClick={() => setGroundingDone(false)} className="mt-4 min-h-11 font-semibold text-ink underline">
                Go through it again
              </button>
            </div>
          ) : (
            <Grounding
              firstBackLabel={null}
              focusOnMount={false}
              onDone={() => {
                setGroundingDone(true);
                requestAnimationFrame(() => doneHeading.current?.focus());
              }}
            />
          )
        ) : null}

        {tool === "blushing" || tool === "sweating" ? (
          <>
            <h2 className="text-2xl text-ink">What your body is doing</h2>
            {BODY_EXPLAINERS[tool].map((w) => (
              <p key={w.kid} className="mt-2 text-ink">
                {words(w, age)}
              </p>
            ))}
            <div className="mt-8">
              <ReframeCards kind={tool} age={age} />
            </div>
          </>
        ) : null}

        {tool === "rescue" ? <RescueDeck onCrisis={() => router.push(`/help?crisis=1&from=${encodeURIComponent("/kit/rescue")}`)} /> : null}
        {tool === "frames" ? (
          <Frames age={age} onCrisis={() => router.push(`/help?crisis=1&from=${encodeURIComponent("/kit/frames")}`)} />
        ) : null}
        {tool === "speech" ? <SpeechTools age={age} /> : null}
      </PaperCard>
    </div>
  );
}
