"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { canUseDevice, canUseOnline } from "@/lib/ai/client";
import { BODY_EXPLAINERS, kitTool, type KitToolId } from "@/lib/content/body";
import { logEvent } from "@/lib/state";
import { act, useCourage } from "@/lib/store";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { BreathingLantern } from "@/components/calm/breathing-lantern";
import { Grounding } from "@/components/calm/grounding";
import { ReframeCards } from "@/components/calm/reframe-cards";
import { RescueDeck } from "@/components/calm/rescue-deck";
import { TidyTool } from "@/components/calm/tidy-tool";
import { FrameBuilder } from "@/components/calm/frame-builder";
import { SpeechPractice } from "@/components/calm/speech-practice";
import { PaperCard } from "@/components/ui/paper-card";

/**
 * One body-kit tool ("/kit/[tool]"). Opening a tool logs a kit event
 * once, which feeds the Calm captain badge and daily quests.
 */
export function KitToolView({ tool }: { tool: KitToolId }) {
  const store = useCourage();
  const { age, hydrated } = store;
  // Tidy is for 13 and over, and only when online help or the on-device model is on.
  const tidy = hydrated && (canUseOnline(store) || canUseDevice(store));
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
      <Link href="/kit" className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 font-semibold text-muted hover:text-ink">
        <ArrowLeft size={20} weight="bold" aria-hidden />
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
          <>
            {tidy ? (
              <div className="mb-8 border-b border-line pb-8">
                <TidyTool onCrisis={() => router.push(`/help?crisis=1&from=${encodeURIComponent("/kit/frames")}`)} />
              </div>
            ) : null}
            <FrameBuilder age={age} heading={tidy} onCrisis={() => router.push(`/help?crisis=1&from=${encodeURIComponent("/kit/frames")}`)} />
          </>
        ) : null}
        {tool === "speech" ? <SpeechPractice age={age} /> : null}
      </PaperCard>
    </div>
  );
}
