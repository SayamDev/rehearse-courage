"use client";

import Link from "next/link";
import { ArrowRight, Check, ChatCircleDots, Mountains, Star, Wind, type Icon } from "@phosphor-icons/react";
import { stageFor, type Stage } from "@/lib/companion";
import { braveWeek, missionsDone } from "@/lib/courage";
import { dayKey } from "@/lib/dates";
import { homeModel } from "@/lib/home";
import { GAMES } from "@/lib/games";
import { dailyQuests, questProgress } from "@/lib/quests";
import { furthestInRoom, furthestLine, ROOM_LABEL } from "@/lib/rooms";
import { situationById } from "@/lib/content/situations";
import { useCourage } from "@/lib/store";
import { ROOM_IDS, type RoomId } from "@/lib/types";
import { GAME_META } from "@/components/games/game-meta";
import { Companion } from "@/components/scene/companion";
import { ProgressTrack } from "@/components/scene/progress-track";
import { ButtonLink } from "@/components/ui/button";
import { PaperCard } from "@/components/ui/paper-card";
import { pointsLabel } from "@/components/ui/stats-pill";
import { Greeting } from "./greeting";
import { ROOM_DISC, ROOM_ICON } from "./room-meta";

/** Each island's sticker colour, used for its label wherever the room is named. */
export const ROOM_STICKER: Record<RoomId, string> = { class: "sticker-sky", friends: "sticker-grape", presenting: "sticker-coral", out: "sticker-lime" };

/** What the companion is doing, growing with courage points. */
const STAGE_LINE: Record<Stage, string> = {
  hiding: "is curled up with their lantern. Every step helps them come out.",
  peeking: "is peeking out. Keep going.",
  waving: "is waving at you.",
  speaking: "is standing tall, like you.",
};

const QUICK: { href: string; label: string; icon: Icon; ink: string }[] = [
  { href: "/kit/breathing", label: "Breathe", icon: Wind, ink: "bg-sky" },
  { href: "/kit/grounding", label: "Ground", icon: Mountains, ink: "bg-lime" },
  { href: "/kit/rescue", label: "Rescue phrases", icon: ChatCircleDots, ink: "bg-sun" },
];

const SIDE_CARD = "rounded-card border-[1.5px] border-line bg-surface p-5 shadow-card";
const DISC = "flex shrink-0 items-center justify-center rounded-full border-[3px] border-die text-[#13262b] shadow-sticker";

/**
 * Home ("/"): a greeting, today's one step (with its six-step track and one
 * Start button) and the four islands; beside them the companion, this
 * week's brave days, today's optional quests and quick calm tools. Renders
 * nothing until the store has hydrated and a companion exists (RedirectIfNew
 * sends first-time visitors to /start).
 */
export function HomeView() {
  const store = useCourage();

  if (!store.hydrated || !store.companion) return null;

  const now = new Date();
  const today = dayKey(now);
  const model = homeModel(store, now);
  const stage = stageFor(model.points, missionsDone(store.records));
  const room: RoomId | null = model.done ? null : (situationById(model.situationId)?.room ?? "class");
  const week = braveWeek(store.records, now);
  const quests = dailyQuests(today).map((q) => ({ q, done: questProgress(q, store.records, store.events, today) }));

  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-6 md:px-8 md:pt-10">
      <div className="flex items-center gap-4">
        <div className="shrink-0 lg:hidden">
          <Companion species={store.companion.species} stage={stage} size={72} />
        </div>
        <div className="min-w-0 flex-1">
          <Greeting name={store.name} />
          <p className="mt-1 text-muted">One small step is enough. Go at your own pace.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:mt-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:gap-8">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6">
          <PaperCard>
            {model.done || !room ? (
              <>
                <h2 className="text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] text-ink">You have walked every path.</h2>
                <p className="mt-2 text-muted">Add a step from your own life and keep going.</p>
                <ButtonLink href="/room/class#add" className="mt-6" icon={ArrowRight} iconEnd>
                  Add your own step
                </ButtonLink>
              </>
            ) : (
              <>
                <span className={`sticker ${ROOM_STICKER[room]}`}>{ROOM_LABEL[room]}</span>
                <h2 className="mt-4 text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] text-ink">{model.title}</h2>
                <ProgressTrack situationId={model.situationId} className="mt-6" />
                <p className="mt-4 text-ink">
                  <span className="font-semibold">
                    Step <span className="tabular">{model.level}</span> of 6:
                  </span>{" "}
                  {model.levelName}
                </p>
                <ButtonLink href={`/step/${model.situationId}?level=${model.level}`} className="mt-6 w-full sm:w-auto" icon={ArrowRight} iconEnd>
                  Start
                </ButtonLink>
              </>
            )}
          </PaperCard>

          <section aria-labelledby="quick-heading">
            <h2 id="quick-heading" className="text-xl text-ink">
              Nervous right now?
            </h2>
            <ul role="list" className="mt-3 grid list-none grid-cols-3 gap-3 p-0">
              {QUICK.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className="group flex h-full flex-col items-center gap-2 rounded-card border-[1.5px] border-line bg-surface px-2 py-4 text-center font-semibold text-ink shadow-card transition-[transform,border-color] duration-[var(--dur-ui)] hover:-translate-y-0.5 hover:border-stone-dim"
                  >
                    <span aria-hidden className={`${DISC} size-12 -rotate-6 transition-transform group-hover:rotate-0 ${t.ink}`}>
                      <t.icon size={24} weight="bold" />
                    </span>
                    <span className="text-sm leading-tight sm:text-base">{t.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="games-heading">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="games-heading" className="text-xl text-ink">
                Warm up with a game
              </h2>
              <Link href="/games" className="font-semibold text-accent-text hover:underline">
                All games
              </Link>
            </div>
            <ul role="list" className="-mx-4 mt-3 flex list-none gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
              {GAMES.map((g) => {
                const { icon: GameIcon, ink } = GAME_META[g.id];
                return (
                  <li key={g.id} className="w-32 shrink-0 sm:w-auto">
                    <Link
                      href={`/games/${g.id}`}
                      className="group flex h-full flex-col items-center gap-2 rounded-card border-[1.5px] border-line bg-surface px-2 py-4 text-center shadow-card transition-[transform,border-color] duration-[var(--dur-ui)] hover:-translate-y-0.5 hover:border-stone-dim"
                    >
                      <span aria-hidden className={`${DISC} size-12 rotate-6 transition-transform group-hover:rotate-0 ${ink}`}>
                        <GameIcon size={24} weight="bold" />
                      </span>
                      <span className="text-sm font-semibold leading-tight text-ink">{g.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="islands-heading">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="islands-heading" className="text-xl text-ink">
                Your islands
              </h2>
              <Link href="/map" className="font-semibold text-accent-text hover:underline">
                Open the map
              </Link>
            </div>
            <ul role="list" className="mt-3 grid list-none gap-3 p-0 sm:grid-cols-2">
              {ROOM_IDS.map((r) => {
                const far = furthestInRoom(store.records, r);
                const RoomIcon = ROOM_ICON[r];
                return (
                  <li key={r}>
                    <Link
                      href={`/room/${r}`}
                      className="flex h-full items-center gap-3 rounded-card border-[1.5px] border-line bg-surface p-4 shadow-card transition-[transform,border-color] duration-[var(--dur-ui)] hover:-translate-y-0.5 hover:border-stone-dim sm:flex-col sm:items-start"
                    >
                      <span aria-hidden className={`${DISC} size-11 -rotate-6 ${ROOM_DISC[r]}`}>
                        <RoomIcon size={22} weight="bold" />
                      </span>
                      <span className="min-w-0 flex-1 sm:w-full">
                        <span className="block font-display font-bold text-ink">{ROOM_LABEL[r]}</span>
                        <span className="block text-sm text-muted">{furthestLine(far)}</span>
                        <span aria-hidden className="mt-2 block h-2 overflow-hidden rounded-full bg-surface-2">
                          <span className="block h-full rounded-full bg-accent" style={{ width: `${(far / 6) * 100}%` }} />
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside aria-label="Your week" className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)]">
          <div className={`${SIDE_CARD} hidden flex-col items-center text-center lg:flex`}>
            <Companion species={store.companion.species} stage={stage} size={140} />
            <p className="mt-3 text-ink">
              <span className="font-display text-lg font-bold">{store.companion.name}</span>{" "}
              <span className="text-muted">{STAGE_LINE[stage]}</span>
            </p>
          </div>

          <section aria-labelledby="week-heading" className={SIDE_CARD}>
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="week-heading" className="text-xl text-ink">
                This week
              </h2>
              <span className="tabular inline-flex items-center gap-1 font-semibold text-ink">
                <Star size={18} weight="fill" aria-hidden className="text-accent-text" />
                {pointsLabel(model.points)}
              </span>
            </div>
            <ol className="mt-4 grid list-none grid-cols-7 gap-1 p-0">
              {week.map((d) => (
                <li key={d.key} className="flex flex-col items-center gap-1.5">
                  <span
                    className={`flex size-9 items-center justify-center rounded-full border-[3px] ${
                      d.brave ? "border-die bg-accent text-on-accent shadow-sticker" : d.today ? "border-dashed border-accent bg-surface" : "border-transparent bg-surface-2"
                    } ${d.future ? "opacity-50" : ""}`}
                  >
                    {d.brave ? <Check size={16} weight="bold" aria-hidden /> : null}
                    <span className="sr-only">{d.brave ? "brave day" : d.today ? "today" : "no step"}</span>
                  </span>
                  <span aria-hidden className={`text-xs font-semibold ${d.today ? "text-ink" : "text-muted"}`}>
                    {d.label}
                  </span>
                </li>
              ))}
            </ol>
            <p className="tabular mt-3 text-muted">
              {model.braveDays} brave day{model.braveDays === 1 ? "" : "s"} so far. Any step counts.
            </p>
          </section>

          <section aria-labelledby="quests-heading" className={SIDE_CARD}>
            <h2 id="quests-heading" className="text-xl text-ink">
              Small ideas for today
            </h2>
            <p className="mt-1 text-sm text-muted">Optional. Missing them changes nothing.</p>
            <ul role="list" className="mt-3 grid list-none gap-2.5 p-0">
              {quests.map(({ q, done }) => {
                const complete = done >= q.target;
                return (
                  <li key={q.id} className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full border-[3px] ${
                        complete ? "border-die bg-accent text-on-accent shadow-sticker" : "border-line bg-surface-2"
                      }`}
                    >
                      {complete ? <Check size={14} weight="bold" /> : null}
                    </span>
                    <span className={`flex-1 ${complete ? "text-muted line-through decoration-2" : "text-ink"}`}>{q.text}</span>
                    <span className="tabular text-sm font-semibold text-muted">
                      {done}/{q.target}
                      <span className="sr-only">{complete ? ", done" : ""}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
