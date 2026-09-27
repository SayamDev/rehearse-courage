import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "About - Rehearse Courage",
};

/** About: what this is, who made it, and the sister project. */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 pt-6 md:pt-10">
      <Link href="/me" className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-ink hover:underline">
        <ArrowLeft size={22} weight="regular" aria-hidden />
        Me
      </Link>
      <h1 className="mt-2 text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] text-ink">About Rehearse Courage</h1>
      <div className="mt-4 max-w-[60ch] space-y-3 text-ink">
        <p>
          Rehearse Courage is a free, private place to practise speaking up: in class, with friends, and in front of a
          group. One small step at a time, at your own pace.
        </p>
        <p>
          It rewards trying, never how smoothly you speak. It never counts pauses, fillers or stutters, and it never
          takes anything away.
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
      <p className="mt-1 text-muted">© 2026 Sayam Ajmal. All rights reserved.</p>
    </div>
  );
}
