"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Stop, Trash } from "@phosphor-icons/react";
import { deleteRecordings, loadRecordings, type Recording, type RoomRecordings } from "@/lib/recordings";
import { ROOM_LABEL } from "@/lib/rooms";
import { logEvent } from "@/lib/state";
import { act, useCourage } from "@/lib/store";
import { ROOM_IDS, type RoomId } from "@/lib/types";
import { stopSpeaking } from "@/lib/voice/speak";
import { Button } from "@/components/ui/button";

const when = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });

/**
 * Then and now (Me): your first spoken step in each room beside your most
 * recent one, only when "Keep my recordings" is on. Listening counts for
 * the Then and now badge. Everything stays on this device and can be
 * deleted here.
 */
export function ThenNow() {
  const { settings, hydrated } = useCourage();
  const [recs, setRecs] = useState<Partial<Record<RoomId, RoomRecordings>> | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const audio = useRef<{ el: HTMLAudioElement; url: string } | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    let live = true;
    void loadRecordings().then((r) => live && setRecs(r));
    return () => {
      live = false;
    };
  }, [hydrated]);

  const release = () => {
    if (audio.current) {
      audio.current.el.pause();
      URL.revokeObjectURL(audio.current.url);
    }
    audio.current = null;
    setPlaying(null);
  };
  useEffect(() => release, []);

  const play = (r: Recording) => {
    const key = `${r.room}:${r.slot}`;
    const was = playing;
    release();
    if (was === key) return;
    stopSpeaking();
    const url = URL.createObjectURL(r.blob);
    const el = new Audio(url);
    audio.current = { el, url };
    el.onended = release;
    el.onerror = release;
    setPlaying(key);
    void el.play().catch(release);
    act((s) => logEvent(s, "thenNow", new Date()));
  };

  const rooms = ROOM_IDS.filter((room) => recs?.[room]?.first);

  const slot = (r: Recording | undefined, label: string) =>
    r ? (
      <Button variant="secondary" size="md" icon={playing === `${r.room}:${r.slot}` ? Stop : Play} onClick={() => play(r)}>
        {label}, {when(r.at)}
      </Button>
    ) : (
      <span className="inline-flex min-h-11 items-center text-sm text-muted">Your next spoken step here will appear as Now.</span>
    );

  return (
    <>
      <p className="mt-1 text-ink">
        Hear your first spoken step in each room next to your most recent one. It is kept only on this device.
      </p>
      {!settings.keepRecordings ? (
        <p className="mt-3 text-muted">Turn on &ldquo;Keep my recordings on this device&rdquo; in Settings, then do a speaking step (step 3, 4 or 5).</p>
      ) : recs && rooms.length === 0 ? (
        <p className="mt-3 text-muted">Nothing yet. Do a speaking step (step 3, 4 or 5) and your first one will be kept here.</p>
      ) : null}
      {rooms.length > 0 ? (
        <>
          <ul role="list" className="mt-4 grid list-none gap-3 p-0">
            {rooms.map((room) => (
              <li key={room} className="rounded-card border-[1.5px] border-line bg-surface-2 p-4">
                <p className="font-display text-lg font-bold text-ink">{ROOM_LABEL[room]}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {slot(recs?.[room]?.first, "Then")}
                  {slot(recs?.[room]?.latest, "Now")}
                </div>
              </li>
            ))}
          </ul>
          <Button
            variant="secondary"
            icon={Trash}
            className="mt-4"
            onClick={async () => {
              release();
              await deleteRecordings();
              setRecs({});
            }}
          >
            Delete my recordings
          </Button>
        </>
      ) : null}
    </>
  );
}
