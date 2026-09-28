"use client";

import { Check, Circle } from "@phosphor-icons/react";
import { BADGES } from "@/lib/achievements";
import { BADGE_HINTS } from "@/lib/content/badge-hints";
import { dayKey } from "@/lib/dates";
import { dailyQuests, questProgress } from "@/lib/quests";
import { useCourage } from "@/lib/store";
import { ArtHeader } from "@/components/scene/art-header";
import { PaperCard } from "@/components/ui/paper-card";
import { Sticker } from "@/components/ui/sticker";

/**
 * Badges ("/badges"): today's optional quests with gentle progress text
 * (no bars), then all twelve badges as stickers. Earned ones are in colour
 * with what you did; the rest are soft outlines with how to find them.
 * Nothing is ever locked, lost or counted down.
 */
export function BadgesView() {
  const store = useCourage();
  // Today's quests depend on the person's local date, so they are only
  // worked out after hydration: the page is prebuilt, and the build date
  // must never leak into (or mismatch) what the browser shows.
  const day = store.hydrated ? dayKey(new Date()) : null;
  const quests = day ? dailyQuests(day) : [];
  const earned = new Set(store.hydrated ? store.earned : []);

  return (
    <div>
      <ArtHeader lottie="/lottie/badges.json" title="Badges" line="Small steps. Real courage." />

      <div className="relative mx-auto mt-6 max-w-[1100px] px-4 md:px-8">
        <PaperCard className="!p-5 sm:!p-6">
        <section aria-labelledby="quests-heading">
          <h2 id="quests-heading" className="text-2xl text-ink">
            Today&apos;s quests
          </h2>
          <p className="text-muted">Small ideas for today, if you want them. Skipping them changes nothing.</p>
          <ul role="list" className="mt-4 grid min-h-[13.5rem] list-none gap-2 p-0 md:min-h-[4.5rem] md:grid-cols-3 md:gap-4">
            {quests.map((q) => {
              const done = day ? questProgress(q, store.records, store.events, day) : 0;
              const complete = done >= q.target;
              return (
                <li key={q.id} className="flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3">
                  {complete ? (
                    <Check size={24} weight="regular" aria-hidden className="shrink-0 text-ink" />
                  ) : (
                    <Circle size={24} weight="regular" aria-hidden className="shrink-0 text-muted" />
                  )}
                  <span className="min-w-0">
                    <span className="block font-semibold text-ink">{q.text}</span>
                    <span className="tabular block text-muted">
                      {complete ? "Done today" : `${done} of ${q.target}`}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
        </PaperCard>

        <section aria-labelledby="badges-heading" className="mt-10">
          <h2 id="badges-heading" className="text-2xl text-ink">
            Your badges
          </h2>
          <p className="tabular text-muted">
            {earned.size} of {BADGES.length} found so far. Badges are yours to keep.
          </p>
          <ul role="list" className="mt-4 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {BADGES.map((b) => {
              const has = earned.has(b.id);
              return (
                <li key={b.id}>
                  <PaperCard className="flex h-full flex-col items-center !p-4 text-center sm:!p-5">
                    <Sticker badgeId={b.id} earned={has} size={88} />
                    <h3 className="mt-3 text-lg text-ink">{b.title}</h3>
                    <p className="mt-1 text-muted">{has ? b.description : BADGE_HINTS[b.id]}</p>
                  </PaperCard>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
