import type { Metadata } from "next";
import Link from "next/link";
import type { Icon } from "@phosphor-icons/react";
import { ChalkboardTeacher, HandHeart, Lock, Prohibit, ShieldCheck, UserCircleMinus } from "@phosphor-icons/react/dist/ssr";
import { LEVELS } from "@/lib/ladder";
import { ArtHeader } from "@/components/scene/art-header";
import { Lottie } from "@/components/ui/lottie";

export const metadata: Metadata = {
  title: "For parents and teachers - Rehearse Courage",
  description: "What Rehearse Courage does, how it keeps children safe, and how to use it at home or in class.",
};

const SAFE: { icon: Icon; ink: string; title: string; body: string }[] = [
  { icon: UserCircleMinus, ink: "bg-sky", title: "No accounts", body: "No sign-up, email, ads or trackers. A first name is optional and only used to say hello." },
  { icon: Lock, ink: "bg-lime", title: "Stays on the device", body: "Progress lives in the browser on this device. Nothing is uploaded; a backup file is the only copy, and it is yours." },
  { icon: Prohibit, ink: "bg-coral", title: "No AI under 13", body: "Under 13, or if the age is skipped, every reply is written in advance and words and voice never leave the device." },
  { icon: ShieldCheck, ink: "bg-sun", title: "Checked for support needs", body: "Anything typed is checked on the device for signs someone needs help, and the right helplines for their country are shown." },
  { icon: HandHeart, ink: "bg-grape", title: "Rewards trying, never smoothness", body: "It never scores fluency, fillers, pauses or stutters, never takes points away, and never shows a broken streak." },
  { icon: ChalkboardTeacher, ink: "bg-accent", title: "Practice, not therapy", body: "It does not diagnose or treat anything. It is a safe place to rehearse, alongside any support a child already has." },
];

const TIPS = [
  "Let them choose the situation and the step. Going back down a step is part of it, never a failure.",
  "Praise the attempt, not how it sounded: \"You had a go\" matters more than the words.",
  "Before a presentation or a busy lesson, a minute of the Body kit (breathing, grounding) or a warm-up game helps.",
  "Step 6 is the real thing. Agree a small, real moment together, like answering one question in class.",
  "Speech tools are options, never rules. For a child who stutters, talking their own way is always fine.",
  "Ask what they practised if they want to share, but do not ask to see what they typed. It is private by design.",
];

/** For parents, carers and teachers: what the app does, how it keeps children safe, and how to use it well. */
export default function ForAdultsPage() {
  return (
    <>
      <ArtHeader title="For parents and teachers" line="What Rehearse Courage does, how it keeps children safe, and how to help." reading />
      <div className="mx-auto max-w-[720px] px-4 pt-4">
        <p className="max-w-[62ch] text-ink">
          Rehearse Courage is a free, private place to practise speaking up: answering in class, joining friends, and talking in front of a group. It is
          built for anyone who finds that hard, including anxiety, shyness, ADHD, stuttering and losing your words.
        </p>

        <section aria-labelledby="how" className="mt-10">
          <h2 id="how" className="text-2xl text-ink">
            How it works
          </h2>
          <p className="mt-1 text-muted">Every situation climbs the same six small steps, from thinking it to doing it for real.</p>
          <div className="mt-4 overflow-hidden rounded-card border-[1.5px] border-line bg-surface p-4 shadow-card">
            <Lottie src="/lottie/ladder-tall.json" themed className="mx-auto aspect-[600/740] w-full max-w-[340px] sm:hidden" />
            <Lottie src="/lottie/ladder.json" themed className="hidden aspect-[960/420] w-full sm:block" />
            <ol className="sr-only">
              {LEVELS.map((l) => (
                <li key={l.level}>{l.name}</li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="safe" className="mt-10">
          <h2 id="safe" className="text-2xl text-ink">
            Safe by design
          </h2>
          <ul role="list" className="mt-4 grid list-none gap-3 p-0 sm:grid-cols-2">
            {SAFE.map((s) => (
              <li key={s.title} className="flex gap-3 rounded-card border-[1.5px] border-line bg-surface p-4 shadow-card">
                <span aria-hidden className={`flex size-11 shrink-0 -rotate-6 items-center justify-center rounded-full border-[3px] border-die text-[#13262b] shadow-sticker ${s.ink}`}>
                  <s.icon size={22} weight="bold" />
                </span>
                <span>
                  <span className="block font-display text-lg font-bold text-ink">{s.title}</span>
                  <span className="mt-0.5 block text-muted">{s.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="tips" className="mt-10">
          <h2 id="tips" className="text-2xl text-ink">
            How to help, at home or in class
          </h2>
          <ol className="mt-4 grid list-none gap-3 p-0">
            {TIPS.map((t, i) => (
              <li key={t} className="flex gap-3">
                <span aria-hidden className="tabular flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 font-display font-bold text-ink">
                  {i + 1}
                </span>
                <span className="pt-1 text-ink">{t}</span>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-10 text-ink">
          More detail:{" "}
          <Link href="/privacy" className="font-semibold underline">
            Privacy in plain English
          </Link>
          {" · "}
          <Link href="/help" className="font-semibold underline">
            Support lines
          </Link>
          {" · "}
          <Link href="/about" className="font-semibold underline">
            About
          </Link>
        </p>
      </div>
    </>
  );
}
