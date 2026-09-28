import type { Metadata } from "next";
import Link from "next/link";
import { ArtHeader } from "@/components/scene/art-header";

export const metadata: Metadata = {
  title: "About - Rehearse Courage",
};

/** About: what this is, who made it, and the sister project. */
export default function AboutPage() {
  return (
    <>
      <ArtHeader title="About Rehearse Courage" back={{ href: "/me", label: "Me" }} reading />
      <div className="mx-auto max-w-[720px] px-4 pt-6 md:pt-8">
        <div className="max-w-[60ch] space-y-3 text-ink">
          <p>
            Rehearse Courage is a free, private place to practise speaking up: in class, with friends, and in front of a
            group. One small step at a time, at your own pace.
          </p>
          <p>
            It rewards trying, never how smoothly you speak. It never counts pauses, fillers or stutters, and it never
            takes anything away.
          </p>
          <p>
            For people aged 13 and over, Cobi&apos;s replies and sentence tidy can use free AI that does not keep your words
            or learn from them. For anyone younger, every reply is written in advance and nothing leaves the device.{" "}
            <Link href="/privacy#ai" className="font-semibold underline">
              How AI is used
            </Link>
          </p>
          <p>Rehearse Courage is practice, not therapy. It does not diagnose or treat any condition.</p>
          <p>
            It is a sister project to{" "}
            <a href="https://rehearse.sayamdev.workers.dev" className="font-semibold underline">
              Rehearse
            </a>
            , which helps people practise interviews.
          </p>
        </div>
        <p className="mt-8 font-display text-2xl font-bold text-ink">Made by Sayam Ajmal</p>
        <p className="mt-1 text-muted">Designed and built by Sayam Ajmal, as part of the Rehearse project.</p>
        <p className="mt-6 font-semibold text-ink">Voices</p>
        <p className="mt-1 text-muted">
          Recorded with Kokoro (Apache 2.0) and OmniVoice by k2-fsa (CC BY-NC 4.0), free and on the maker&apos;s own computer. Nothing you
          say or type is used to make them.
        </p>
      </div>
    </>
  );
}
