import type { RoomId, Words } from "@/lib/types";

const w = (kid: string, grown: string = kid): Words => ({ kid, grown });

/** Shown as the speaker label above every coach line. Cobi is the Rehearse coach (a cameo). */
export const COACH_NAME = "Cobi, your coach";

/**
 * Step 4 ("Say it to the coach"): a pre-written line from Cobi that sets up
 * the moment before the person speaks. Plan 4 replaces these with live
 * replies for 13 and over; under 13 keeps these forever.
 */
export const COACH_LINES: Record<string, Words> = {
  "class-answer": w(
    "Here is my question for the class. Who can tell me the answer?",
    "Right, a question for the room. Does anyone have an answer?",
  ),
  "class-ask": w("Does anyone have a question about today's lesson?", "Before we move on, any questions about that part?"),
  "class-read": w("Would you read the next few lines for us, please?", "Could you read the next paragraph aloud for us?"),
  "class-group": w("What ideas does your group have so far?", "Let's hear from everyone. What do you think we should do?"),
  "class-register": w("Right, let's do the register. Who is here today?", "Let's check who's here. I'll read out the names."),
  "friends-join": w("We were just talking about the weekend. What did you do?", "We were just talking about the weekend. Any plans?"),
  "friends-opinion": w("Which one do you like best?", "What do you think about it?"),
  "friends-disagree": w("I think it is the best one ever. Do you agree?", "I reckon it is the best one out there. Agree?"),
  "friends-story": w("Did anything funny happen to you this week?", "Anything interesting happen to you lately?"),
  "friends-invite": w("I'm not sure what to do at break today.", "I've got nothing planned this week, actually."),
  "friends-no": w("Can I have your pudding? Please?", "Could you cover my turn again? Just this once?"),
  "present-intro": w("Could you tell the group a little about yourself?", "Would you introduce yourself to the group?"),
  "present-minute": w("You have one minute. Whenever you are ready.", "The floor is yours for a minute. Start when you are ready."),
  "present-questions": w("Thank you for your talk. Can I ask a question about it?", "Thanks for that. I have a question, if that's all right."),
  "out-order": w("Hi there. What can I get you?", "Hi, what can I get for you?"),
  "out-shop": w("Hello. Are you finding everything all right?", "Hi there. Can I help you find anything?"),
  "out-phone": w("Hello?", "Hello, how can I help?"),
  "out-directions": w("Hello. Are you lost?", "Hi. You look like you're looking for something."),
};

/** Used for the person's own steps and any situation without its own line. */
export const COACH_FALLBACK: Words = w("I am listening. Start whenever you are ready.");

/** Step 5 ("a little pressure"): one gentle moment of attention, per room. */
export const PRESSURE_LINES: Record<RoomId, Words> = {
  class: w("The teacher looks at you and smiles."),
  friends: w("Your friends turn to you and wait."),
  presenting: w("The room goes quiet and looks at you."),
  out: w("The person serving looks up, ready for you. Someone is waiting behind you."),
};

/**
 * Step 5, "a little pressure": two short lines from the people in the room,
 * played one after the other, so the moment feels real. Kind, never rushing.
 */
export const PRESSURE_CUES: Record<RoomId, { role: "teacher" | "friend" | "host" | "classmate"; text: Words }[]> = {
  class: [
    { role: "teacher", text: w("Take your time. We're listening.") },
    { role: "classmate", text: w("Go on, what do you think?") },
  ],
  friends: [
    { role: "friend", text: w("So what do you reckon?", "So, what do you think?") },
    { role: "classmate", text: w("Yeah, go on.") },
  ],
  presenting: [
    { role: "host", text: w("Whenever you're ready.") },
    { role: "classmate", text: w("We're all ears.") },
  ],
  out: [
    { role: "host", text: w("Next, please. What would you like?") },
    { role: "classmate", text: w("No rush.") },
  ],
};

export function coachLine(situationId: string): Words {
  return COACH_LINES[situationId] ?? COACH_FALLBACK;
}
