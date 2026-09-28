"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { situationById, SITUATIONS } from "@/lib/content/situations";
import { LEVELS, suggestNext } from "@/lib/ladder";
import { furthestInRoom, furthestLine, ROOM_LABEL } from "@/lib/rooms";
import { useCourage } from "@/lib/store";
import { ROOM_IDS, type RoomId } from "@/lib/types";
import { ButtonLink } from "@/components/ui/button";
import { Lottie } from "@/components/ui/lottie";
import { PaperCard } from "@/components/ui/paper-card";
import { ROOM_DISC, ROOM_ICON } from "./room-meta";

const TITLE = "text-[clamp(1.75rem,1.2rem+2vw,2.75rem)]";
const CARD_TITLE = "text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)]";

/** One island: a card linking to its room, with its sticker icon and how far it has come. */
function Island({ room, line }: { room: RoomId; line: string | null }) {
  const RoomIcon = ROOM_ICON[room];
  return (
    // min-w-0 so a long label at the largest text size wraps instead of widening the page.
    <li className="min-w-0">
      <Link
        href={`/room/${room}`}
        className="group flex h-full items-center gap-4 rounded-card border-[1.5px] border-line bg-surface p-5 shadow-card transition-[transform,border-color] duration-[var(--dur-ui)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-stone-dim md:flex-col md:items-start md:p-6"
      >
        <span aria-hidden className={`flex size-14 shrink-0 -rotate-6 items-center justify-center rounded-full border-[3px] border-die text-[#13262b] shadow-sticker transition-transform duration-[var(--dur-ui)] group-hover:rotate-0 md:size-16 ${ROOM_DISC[room]}`}>
          <RoomIcon size={30} weight="bold" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-xl font-bold leading-tight text-ink">{ROOM_LABEL[room]}</span>
          {/* Reserve the line's height before hydration so nothing jumps. */}
          <span className="tabular mt-1 block break-words text-muted">{line ?? " "}</span>
        </span>
        <ArrowRight size={22} weight="bold" aria-hidden className="shrink-0 text-muted transition-colors group-hover:text-ink md:hidden" />
      </Link>
    </li>
  );
}

/**
 * Courage map ("/map"): the four islands with how far each has come, and
 * a card to continue the suggested step. Progress text waits for the store
 * to hydrate so a returning person never sees "Not started yet" flash.
 */
export function MapView() {
  const store = useCourage();
  const next = store.hydrated ? suggestNext(store.records, SITUATIONS, store.hardThings) : null;
  const situation = next ? situationById(next.situationId) : undefined;

  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-6 md:px-8 md:pt-10">
      <div>
        <header>
          <h1 className={`${TITLE} text-ink`}>Courage map</h1>
          <p className="mt-1 text-muted">Four islands. One small step at a time.</p>
        </header>

        <ul role="list" className="mt-6 grid list-none gap-3 p-0 md:mt-8 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {ROOM_IDS.map((room) => (
            <Island key={room} room={room} line={store.hydrated ? furthestLine(furthestInRoom(store.records, room)) : null} />
          ))}
        </ul>

        <section aria-labelledby="ladder-heading" className="mt-10">
          <h2 id="ladder-heading" className="text-2xl text-ink">
            How every step works
          </h2>
          <p className="mt-1 max-w-[56ch] text-muted">Each situation climbs the same six steps, from thinking it to doing it for real. Go back down any time.</p>
          <div className="mt-4 overflow-hidden rounded-card border-[1.5px] border-line bg-surface p-4 shadow-card sm:p-6">
            <Lottie src="/lottie/ladder-tall.json" themed className="mx-auto aspect-[600/740] w-full max-w-[380px] sm:hidden" />
            <Lottie src="/lottie/ladder.json" themed className="hidden aspect-[960/420] w-full sm:block" />
            <ol className="sr-only">
              {LEVELS.map((l) => (
                <li key={l.level}>{l.name}</li>
              ))}
            </ol>
          </div>
        </section>

        {store.hydrated ? (
          <PaperCard className="mt-8 max-w-[640px] md:mt-10">
            {next && situation ? (
              <>
                <p className="text-muted">
                  {ROOM_LABEL[situation.room]}, step {next.level} of 6
                </p>
                <h2 className={`mt-1 ${CARD_TITLE} text-ink`}>{words(situation.title, store.age)}</h2>
                <p className="mt-2 text-ink">{LEVELS[next.level - 1].name}</p>
                <ButtonLink href={`/step/${next.situationId}?level=${next.level}`} className="mt-6" icon={ArrowRight} iconEnd>
                  Continue
                </ButtonLink>
              </>
            ) : (
              <>
                <h2 className={`${CARD_TITLE} text-ink`}>You have walked every path.</h2>
                <p className="mt-2 text-ink">You can add a step of your own on any island.</p>
                <ButtonLink href="/room/class#add" className="mt-6" icon={ArrowRight} iconEnd>
                  Add your own step
                </ButtonLink>
              </>
            )}
          </PaperCard>
        ) : null}
      </div>
    </div>
  );
}
