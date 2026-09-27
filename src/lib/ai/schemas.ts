import { z } from "zod";
import { MAX_CUSTOM } from "@/lib/ladder";
import { ROOM_IDS } from "@/lib/types";

/** Longest answer or sentence sent to the AI (about 100 words). */
export const MAX_ANSWER = 600;

/** Only 13 to 17 and adults may reach the AI routes; anything else is refused. */
export const AiAgeSchema = z.enum(["teen", "adult"]);

export const CoachBody = z.object({
  age: AiAgeSchema,
  situationId: z.string().trim().min(1).max(80),
  room: z.enum(ROOM_IDS as [string, ...string[]]),
  /** Only used for the person's own steps; built-in steps use the pre-written scene. */
  scene: z.string().trim().max(MAX_CUSTOM).optional(),
  answer: z.string().trim().min(1).max(MAX_ANSWER),
});
export type CoachBody = z.infer<typeof CoachBody>;

export const TidyBody = z.object({
  age: AiAgeSchema,
  text: z.string().trim().min(1).max(MAX_ANSWER),
});
export type TidyBody = z.infer<typeof TidyBody>;

/** What the model must answer with (JSON mode). */
export const CoachOutput = z.object({ reply: z.string().max(1000) });
export const TidyOutput = z.object({ tidy: z.string().max(1000) });
