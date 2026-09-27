import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Privacy - Rehearse Courage",
};

const SECTIONS: { id?: string; title: string; body: string[] }[] = [
  {
    title: "The short version",
    body: [
      "Rehearse Courage has no accounts, no ads and no trackers. Your progress is saved on this device only, in your browser. We cannot see it.",
    ],
  },
  {
    title: "What is saved, and where",
    body: [
      "Your companion and its name, your age group if you chose one, what feels hard, the steps you have done, any steps you wrote yourself, which tools you used and when, the day you last visited, your badges and your settings.",
      "All of it is kept in this browser's storage on this device. If you clear your browser data, it is gone, unless you saved a backup.",
    ],
  },
  {
    title: "Your voice",
    body: [
      "When you speak, the app counts how many seconds you talked, on this device. The sound is not kept, unless you turn on \"Keep my recordings on this device\" in Me. Even then it stays on this device.",
      "The only time sound leaves the device is for people aged 13 and over with online AI help on, when they ask for Cobi's reply at step 4 or speak into tidy. That one short recording is sent to be written down as text, then it is gone. See \"AI, for 13 and over\" below.",
    ],
  },
  {
    title: "What never leaves this device",
    body: [
      "Your steps, your badges, your companion and your settings. For anyone under 13, and anyone with online AI help off, your words and voice never leave it either.",
      "Things you type are checked for signs that you might need support. That check happens on this device, before anything is sent. Things you say are checked the same way as soon as they are written down as text.",
    ],
  },
  {
    id: "ai",
    title: "AI, for 13 and over",
    body: [
      "If you are 13 or over and \"Online AI help\" is on in Me, a few things are sent so Cobi can reply to you and tidy can work: the words of that one answer or sentence, which practice step it was (and its words, if it is a step you wrote yourself), and your age group (13 to 17, or adult). Never your name, your companion, or anything else about you.",
      "They go to Groq first, and to Cloudflare if Groq is busy. Groq is set to keep nothing, and neither uses your words to train AI. Rehearse Courage does not keep or log them either. Both are free, so nobody pays for your data.",
      "Replies are checked before you see them, by a safety filter and, when it is available, a safety model at Cloudflare. If anything looks wrong, you see one of Cobi's own replies instead.",
      "To share the free service fairly, the site counts how many AI requests come from each internet connection each day. It uses a scrambled code that changes every day, cannot be turned back into your address, and is only kept in memory.",
      "You can turn online help off in Me. You can also save a small AI model on this device instead. It downloads from Hugging Face and GitHub, where the model is published, and nothing about you is sent with it. Once it is saved, nothing it does leaves the device.",
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
      "Children under 13, and anyone who skips the age question, never use AI features, and their words and voice never leave the device. Cobi's replies for them are written in advance. Nothing here asks for a name, email or photo. Rehearse Courage is practice, not therapy.",
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
          <section key={s.title} id={s.id} className="mt-6 scroll-mt-6">
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
