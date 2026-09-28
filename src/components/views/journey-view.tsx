"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CaretLeft, CaretRight, Flag, Heart, Lightning, Medal, SunHorizon, type Icon } from "@phosphor-icons/react";
import { BADGES } from "@/lib/achievements";
import { braveDayKeys } from "@/lib/courage";
import { FEEL_LABEL, journeyStats, monthCalendar, niceDate, proudEntries } from "@/lib/journey";
import { rankLabel } from "@/lib/rank";
import { useCourage } from "@/lib/store";
import { ArtHeader } from "@/components/scene/art-header";
import { ShareButton } from "@/components/share/share-button";
import { LevelMeter } from "@/components/ui/level-card";
import { PaperCard } from "@/components/ui/paper-card";
import { Sticker } from "@/components/ui/sticker";

const DISC = "flex shrink-0 items-center justify-center rounded-full border-[3px] border-die text-[#13262b] shadow-sticker";
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function Stat({ icon: Ic, ink, value, label }: { icon: Icon; ink: string; value: number; label: string }) {
  return (
    <li className="flex items-center gap-3 rounded-card border-[1.5px] border-line bg-surface p-4 shadow-card">
      <span aria-hidden className={`${DISC} size-11 -rotate-6 ${ink}`}>
        <Ic size={22} weight="bold" />
      </span>
      <span className="min-w-0">
        <span className="tabular block font-display text-2xl font-bold leading-none text-ink">{value}</span>
        <span className="mt-1 block text-sm text-muted">{label}</span>
      </span>
    </li>
  );
}

/**
 * Your journey ("/journey"): what the person can be proud of. Their
 * courage level (shareable), totals that only ever grow, every real-life
 * try with how it felt, a lantern calendar of brave days (blank days are
 * just days), and their newest badges.
 */
export function JourneyView() {
  const store = useCourage();
  const [offset, setOffset] = useState(0);

  if (!store.hydrated) return <ArtHeader title="Your journey" line="Everything brave you have done. It all adds up." />;

  const now = new Date();
  const stats = journeyStats(store);
  const proud = proudEntries(store);
  const month = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const cal = monthCalendar(braveDayKeys(store.records, store.events), month.getFullYear(), month.getMonth(), now);
  const recent = [...store.earned].reverse().filter((id) => BADGES.some((b) => b.id === id)).slice(0, 6);
  const firstBrave = braveDayKeys(store.records, store.events)[0];
  const earliest = firstBrave ? new Date(`${firstBrave}T12:00:00`) : now;
  const canGoBack = month > new Date(earliest.getFullYear(), earliest.getMonth(), 1);

  return (
    <div>
      <ArtHeader title="Your journey" line="Everything brave you have done. It all adds up, and none of it goes away." />

      <div className="mx-auto mt-6 grid max-w-[1100px] gap-8 px-4 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <PaperCard className="!p-5 sm:!p-6">
            <LevelMeter rank={stats.rank} points={stats.points} />
            <ShareButton
              className="mt-4"
              label="Share your level"
              card={{
                kicker: "My courage level",
                title: rankLabel(stats.rank),
                line: `${stats.braveDays} brave day${stats.braveDays === 1 ? "" : "s"} and counting.`,
                art: { type: "number", n: stats.rank.level },
              }}
            />
          </PaperCard>

          <ul role="list" className="grid list-none grid-cols-2 gap-3 p-0">
            <Stat icon={SunHorizon} ink="bg-sun" value={stats.braveDays} label={stats.braveDays === 1 ? "brave day" : "brave days"} />
            <Stat icon={Flag} ink="bg-accent" value={stats.missions} label={stats.missions === 1 ? "real-life try" : "real-life tries"} />
            <Stat icon={Lightning} ink="bg-coral" value={stats.dares} label={stats.dares === 1 ? "tiny dare" : "tiny dares"} />
            <Stat icon={Medal} ink="bg-grape" value={stats.badges} label={`of ${stats.badgesTotal} badges`} />
          </ul>
        </div>

        <section aria-labelledby="proud-heading">
          <h2 id="proud-heading" className="text-2xl text-ink">
            Proud moments
          </h2>
          <p className="text-muted">Every time you tried it for real. Trying is the brave part.</p>
          {proud.length === 0 ? (
            <PaperCard className="mt-4 !p-5">
              <p className="text-ink">When you try a step for real, at step 6, it goes here.</p>
              <Link href="/map" className="mt-2 inline-flex min-h-11 items-center gap-1.5 font-semibold text-accent-text hover:underline">
                Open the map
                <ArrowRight size={18} weight="bold" aria-hidden />
              </Link>
            </PaperCard>
          ) : (
            <ul role="list" className="mt-4 grid list-none gap-3 p-0 md:grid-cols-2">
              {proud.map((p) => (
                <li key={`${p.situationId}-${p.at}`} className="flex flex-col gap-2 rounded-card border-[1.5px] border-line bg-surface p-4 shadow-card sm:p-5">
                  <div className="flex items-start gap-3">
                    <span aria-hidden className={`${DISC} size-10 -rotate-6 bg-coral`}>
                      <Heart size={20} weight="bold" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-bold leading-snug text-ink">{p.title}</p>
                      <p className="text-sm text-muted">
                        {niceDate(p.at)} · {p.outcome === "did" ? "Did it" : "Tried it"}
                      </p>
                    </div>
                  </div>
                  {p.feel ? <p className="text-ink">{FEEL_LABEL[p.feel]}.</p> : null}
                  {p.note ? <p className="text-ink">&ldquo;{p.note}&rdquo;</p> : null}
                  <div>
                    <ShareButton
                      label={
                        <>
                          Share<span className="sr-only"> {p.title}</span>
                        </>
                      }
                      card={{
                        kicker: p.outcome === "did" ? "I did it for real" : "I tried it for real",
                        title: p.title,
                        line: p.feel ? `${FEEL_LABEL[p.feel]}.` : "Small steps. Real courage.",
                        art: { type: "icon", icon: Heart, ink: "bg-coral" },
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="calendar-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="calendar-heading" className="text-2xl text-ink">
              Lantern calendar
            </h2>
            <p className="tabular text-muted" aria-live="polite">
              {cal.label}: {cal.braveCount} brave day{cal.braveCount === 1 ? "" : "s"}
            </p>
          </div>
          <p className="text-muted">A lantern lights up on every brave day. Days in between are just days.</p>
          <PaperCard className="mt-4 !p-4 sm:!p-6">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setOffset((o) => o - 1)}
                disabled={!canGoBack}
                aria-label="Earlier month"
                className="flex size-11 items-center justify-center rounded-full border border-line bg-surface-2 text-ink disabled:opacity-40"
              >
                <CaretLeft size={20} weight="bold" aria-hidden />
              </button>
              <p className="font-display text-lg font-bold text-ink">{cal.label}</p>
              <button
                type="button"
                onClick={() => setOffset((o) => o + 1)}
                disabled={offset >= 0}
                aria-label="Later month"
                className="flex size-11 items-center justify-center rounded-full border border-line bg-surface-2 text-ink disabled:opacity-40"
              >
                <CaretRight size={20} weight="bold" aria-hidden />
              </button>
            </div>
            <table className="mt-3 w-full table-fixed border-separate border-spacing-1 text-center">
              <caption className="sr-only">
                Brave days in {cal.label}
              </caption>
              <thead>
                <tr>
                  {WEEKDAYS.map((d, i) => (
                    <th key={i} scope="col" className="text-xs font-semibold text-muted">
                      <span aria-hidden>{d}</span>
                      <span className="sr-only">{["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cal.weeks.map((week, i) => (
                  <tr key={i}>
                    {week.map((d, j) => (
                      <td key={j} className="p-0">
                        {d ? (
                          <span
                            className={`tabular mx-auto flex aspect-square max-w-12 items-center justify-center rounded-full text-sm font-semibold ${
                              d.brave
                                ? "border-[3px] border-die bg-accent text-on-accent shadow-sticker"
                                : d.today
                                  ? "border-2 border-dashed border-accent text-ink"
                                  : d.future
                                    ? "border border-line text-muted"
                                    : "bg-surface-2 text-muted"
                            }`}
                          >
                            {d.day}
                            <span className="sr-only">{d.brave ? ", brave day" : d.today ? ", today" : ""}</span>
                          </span>
                        ) : null}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </PaperCard>
        </section>

        <section aria-labelledby="recent-heading">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="recent-heading" className="text-2xl text-ink">
              Newest badges
            </h2>
            <Link href="/badges" className="font-semibold text-accent-text hover:underline">
              All badges
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-2 text-muted">Your first badge is one small step away.</p>
          ) : (
            <ul role="list" className="mt-4 flex list-none flex-wrap gap-4 p-0">
              {recent.map((id) => (
                <li key={id} className="flex w-24 flex-col items-center gap-2 text-center">
                  <Sticker badgeId={id} earned size={72} />
                  <span className="text-sm font-semibold leading-tight text-ink">{BADGES.find((b) => b.id === id)?.title}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
