import type { RoomId, Words } from "@/lib/types";

const w = (kid: string, grown: string = kid): Words => ({ kid, grown });

/**
 * Cobi's reply after someone answers at step 4, when no live reply is
 * available: always for under 13, and whenever the AI is off, offline or
 * out of its free share. Warm and in character. Never about how they
 * spoke, never a grade, and never "take your time" (it can feel
 * patronising to people who stutter).
 */
export const COACH_REPLIES: Record<RoomId, Words[]> = {
  class: [
    w("Thank you for sharing that with the class.", "Thanks for sharing that with everyone."),
    w("Good thinking. Thank you for putting your hand up.", "Thanks for jumping in. That helps the whole room."),
    w("I am glad you said that. Let's think about it together.", "Thanks, that gives us something to build on."),
    w("Thank you. I can tell you thought about it.", "Thanks. That is a thoughtful answer."),
  ],
  friends: [
    w("Oh, nice. Tell me more about that.", "Oh, nice. Tell me more."),
    w("I did not know that. That is cool.", "Huh, I hadn't thought of it like that."),
    w("Same here, kind of. What happened next?", "Fair point. What made you think that?"),
    w("That sounds fun.", "That sounds good, actually."),
  ],
  presenting: [
    w("Thank you. That was really nice to hear.", "Thank you. That was good to hear."),
    w("Thanks for telling us that.", "Thanks for sharing that with us."),
    w("Thank you. I would like to hear more another time.", "Thanks. I'd happily hear more about that."),
  ],
  out: [
    w("No problem at all. Let me help you with that.", "No problem. Let me sort that out for you."),
    w("Of course. It's just over here.", "Of course. I can help with that."),
    w("Thank you for asking. Here you go.", "Sure thing. Thanks for asking."),
  ],
};

/** A small stable hash, so the same moment gets the same reply but different moments vary. */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function prewrittenReply(room: RoomId, seed: string): Words {
  const list = COACH_REPLIES[room];
  return list[hash(seed) % list.length];
}

/** Shown when a tidy version is not available (offline, AI off, or its free share used up). */
export const TIDY_UNAVAILABLE = "Tidy is not available right now. Try one of the frames below.";
