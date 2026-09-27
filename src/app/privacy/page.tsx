import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Privacy - Rehearse Courage",
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "The short version",
    body: [
      "Rehearse Courage has no accounts, no ads and no trackers. Your progress is saved on this device only, in your browser. We cannot see it.",
    ],
  },
  {
    title: "What is saved, and where",
    body: [
      "Your companion and its name, your age group if you chose one, what feels hard, the steps you have done, your badges and your settings.",
      "All of it is kept in this browser's storage on this device. If you clear your browser data, it is gone, unless you saved a backup.",
    ],
  },
  {
    title: "Your voice",
    body: [
      "When you speak, the app only counts how many seconds you talked, on this device. The sound is not sent anywhere and is not kept, unless you turn on \"Keep my recordings on this device\" in Me. Even then it stays on this device.",
    ],
  },
  {
    title: "What never leaves this device",
    body: [
      "Your words, your voice, your steps and your badges. Things you type are checked for signs that you might need support, and that check also happens on this device.",
    ],
  },
  {
    title: "Support lines",
    body: [
      "To show helplines for your country, the website's host tells the page which country you are in. It is used only to pick the right numbers, and it is never saved.",
    ],
  },
  {
    title: "Backups and deleting",
    body: [
      "In Me you can save a backup file, restore one, or delete everything. A backup file is yours: keep it somewhere safe, and only restore files you made.",
    ],
  },
  {
    title: "For parents and carers",
    body: [
      "Children under 13, and anyone who skips the age question, never use AI features. Nothing here asks for a name, email or photo. Rehearse Courage is practice, not therapy.",
    ],
  },
];

/** Privacy in plain English, for children and for parents. */
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 pt-6 md:pt-10">
      <Link href="/me" className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-ink hover:underline">
        <ArrowLeft size={22} weight="regular" aria-hidden />
        Me
      </Link>
      <h1 className="mt-2 text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] text-ink">Privacy</h1>
      <div className="mt-4 max-w-[60ch]">
        {SECTIONS.map((s) => (
          <section key={s.title} className="mt-6">
            <h2 className="text-2xl text-ink">{s.title}</h2>
            {s.body.map((p) => (
              <p key={p} className="mt-2 text-ink">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
