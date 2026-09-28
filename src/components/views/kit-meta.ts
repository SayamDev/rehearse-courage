import { ChatCircleDots, Drop, Fire, Mountains, TextAa, Waveform, Wind, type Icon } from "@phosphor-icons/react";
import type { KitToolId } from "@/lib/content/body";

/** How each Body kit tool looks in the list: its group, sticker icon and ink, and roughly how long it takes. */
export const KIT_META: Record<KitToolId, { group: "body" | "words"; icon: Icon; ink: string; time: string }> = {
  breathing: { group: "body", icon: Wind, ink: "bg-sky", time: "1 min" },
  grounding: { group: "body", icon: Mountains, ink: "bg-lime", time: "2 min" },
  blushing: { group: "body", icon: Fire, ink: "bg-coral", time: "2 min" },
  sweating: { group: "body", icon: Drop, ink: "bg-sky", time: "2 min" },
  rescue: { group: "words", icon: ChatCircleDots, ink: "bg-sun", time: "3 min" },
  frames: { group: "words", icon: TextAa, ink: "bg-accent", time: "3 min" },
  speech: { group: "words", icon: Waveform, ink: "bg-grape", time: "5 min" },
};
