"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { situationById, SITUATIONS } from "@/lib/content/situations";
import { LEVELS, suggestNext } from "@/lib/ladder";
import { furthestInRoom, furthestLine, ROOM_LABEL } from "@/lib/rooms";
import { useCourage } from "@/lib/store";
import { ROOM_IDS, type RoomId } from "@/lib/types";
import { ButtonLink } from "@/components/ui/button";
import { PaperCard } from "@/components/ui/paper-card";
import { ISLAND_ART, ROOM_ICON } from "./room-meta";

const TITLE = "text-[clamp(1.75rem,1.2rem+2vw,2.75rem)]";
const CARD_TITLE = "text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)]";

/**
 * One island: a link to its room. On phones it is a compact row (small
 * round island, label, progress) so all three fit without a long scroll;
 * from md up it becomes the comp's column with the chrome label overlapping
 * the island's lower edge.
 */
function Island({ room, line }: { room: RoomId; line: string | null }) {
  const RoomIcon = ROOM_ICON[room];
  return (
    // min-w-0 so a long label at the largest text size wraps instead of widening the page.
    <li className="min-w-0">
      <Link
        href={`/room/${room}`}
        className="group flex items-center gap-4 rounded-card p-1 md:flex-col md:gap-0 md:p-0"
      >
        <span className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-full shadow-card md:aspect-square md:h-auto md:w-full md:rounded-card">
          <Image
            src={ISLAND_ART[room]}
            alt=""
            fill
            sizes="(min-width: 768px) 340px, 96px"
            className="object-cover object-[50%_35%] transition-[filter] duration-[var(--dur-ui)] group-hover:brightness-110"
          />
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-chrome px-5 py-3 text-on-chrome md:relative md:-mt-10 md:flex-none md:px-6">
          <RoomIcon size={28} weight="regular" aria-hidden className="shrink-0" />
          <span className="min-w-0">
            <span className="block font-display text-xl font-bold leading-tight">{ROOM_LABEL[room]}</span>
            {/* Reserve the line's height before hydration so nothing jumps. */}
            <span className="tabular block break-words text-base text-on-chrome/85">{line ?? " "}</span>
          </span>
        </span>
      </Link>
    </li>
  );
}

/**
 * Courage map ("/map"): the three islands with how far each has come, and
 * a card to continue the suggested step. Progress text waits for the store
 * to hydrate so a returning person never sees "Not started yet" flash.
 */
export function MapView() {
  const store = useCourage();
  const next = store.hydrated ? suggestNext(store.records, SITUATIONS, store.hardThings) : null;
  const situation = next ? situationById(next.situationId) : undefined;

  return (
    <div className="relative">
      {/* Sky backdrop: dark night sky at the top-left behind the title, fading into the canvas. */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-[340px] overflow-hidden md:h-[520px]">
        <Image src="/art/sky-map.webp" alt="" fill priority sizes="100vw" className="object-cover object-top" />
        <div
          className="absolute inset-0"
          style={{
            background:
              // Deep enough behind the title and subtitle (over clouds on
              // phones) for AA contrast in both themes, then fading to canvas.
              "linear-gradient(to bottom, color-mix(in srgb, var(--chrome) 88%, transparent), color-mix(in srgb, var(--chrome) 72%, transparent) 38%, color-mix(in srgb, var(--chrome) 20%, transparent) 70%, var(--canvas) 98%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1100px] px-4 pt-8 md:pt-12">
        <header className="text-on-chrome">
          <h1 className={TITLE}>Courage map</h1>
          <p className="mt-1">Three islands. One small step at a time.</p>
        </header>

        <ul role="list" className="mt-6 grid list-none gap-3 p-0 md:mt-10 md:grid-cols-3 md:gap-8">
          {ROOM_IDS.map((room) => (
            <Island key={room} room={room} line={store.hydrated ? furthestLine(furthestInRoom(store.records, room)) : null} />
          ))}
        </ul>

        {store.hydrated ? (
          <PaperCard className="mx-auto mt-8 max-w-[560px] md:mt-10">
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
