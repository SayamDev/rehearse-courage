"use client";

import { useEffect } from "react";
import { words } from "@/lib/age";
import { PRESSURE_CUES } from "@/lib/content/coach";
import { useCourage } from "@/lib/store";
import type { RoomId } from "@/lib/types";
import { speak } from "@/lib/voice/speak";
import { SpokenLine, useVoiceSet } from "./spoken-line";

const WHO: Record<string, Record<RoomId, string>> = {
  teacher: { class: "Your teacher", friends: "A friend", presenting: "The host", out: "The person serving" },
  friend: { class: "A classmate", friends: "A friend", presenting: "Someone", out: "Someone nearby" },
  host: { class: "Your teacher", friends: "A friend", presenting: "The host", out: "The person serving" },
  classmate: { class: "A classmate", friends: "Another friend", presenting: "Someone in the audience", out: "Someone in the queue" },
};

/**
 * Step 5's moment: two short lines from the people in the room, each with
 * Hear it. With the coach's lines playing by themselves (the default),
 * they play one after the other when the step opens.
 */
export function PressureMoment({ room }: { room: RoomId }) {
  const store = useCourage();
  const set = useVoiceSet();
  const cues = PRESSURE_CUES[room].map((c) => ({ ...c, line: words(c.text, store.age) }));
  const auto = store.hydrated && store.settings.playCoach;
  const slower = store.settings.slowerVoice;

  useEffect(() => {
    if (!auto) return;
    let live = true;
    void (async () => {
      for (const c of cues) {
        if (!live) return;
        await speak({ role: c.role, set, text: c.line, slower, accent: store.settings.accent });
      }
    })();
    return () => {
      live = false;
    };
    // Once per step: re-running on every render would restart the lines.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, room, set]);

  return (
    <ul role="list" className="mt-3 grid list-none gap-2 p-0">
      {cues.map((c) => (
        <li key={c.line} className="rounded-2xl bg-surface px-3 py-2">
          <p className="text-sm text-muted">{WHO[c.role][room]}</p>
          <SpokenLine role={c.role} text={c.line} as="blockquote" className="font-semibold text-ink" />
        </li>
      ))}
    </ul>
  );
}
