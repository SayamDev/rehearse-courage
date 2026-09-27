import type { Words } from "@/lib/types";

const w = (kid: string, grown: string = kid): Words => ({ kid, grown });

/** Lines to fall back on when your mind goes blank. */
export const RESCUE_PHRASES: { id: string; text: Words; when: Words }[] = [
  { id: "come-back", text: w("Can I come back to that?", "Can I come back to that one?"), when: w("When your mind goes blank.", "When your mind goes blank.") },
  { id: "think-second", text: w("Let me think for a second."), when: w("When you need a moment.", "When you need a moment to think.") },
  { id: "not-sure", text: w("I am not sure, but maybe ...", "I am not sure, but my guess is ..."), when: w("When you only half know.", "When you only half know the answer.") },
  { id: "say-again", text: w("Can you say that again, please?", "Sorry, could you repeat the question?"), when: w("When you did not hear or understand.", "When you did not catch the question.") },
  { id: "start-again", text: w("Let me start that again."), when: w("When your words get mixed up.", "When a sentence gets tangled.") },
  { id: "lost-thread", text: w("I lost my place. Where was I?", "Sorry, I lost my thread. Where was I?"), when: w("When you forget what you were saying.", "When you forget where you were going.") },
  { id: "good-question", text: w("That is a good question.", "That is a good question. Let me think."), when: w("To buy a little time.", "To buy yourself a little time.") },
  { id: "pass", text: w("Can I pass on this one?", "I will pass on this one for now, thanks."), when: w("When today is too much.", "When today is not the day, and that is okay.") },
];

/** Fill-in sentence frames. Used by everyone, and instead of AI tidy for under 13. */
export const FRAMES: { id: string; text: Words }[] = [
  { id: "think-because", text: w("I think ___ because ___.") },
  { id: "like-because", text: w("I like ___ because ___.") },
  { id: "agree-also", text: w("I agree with ___, and also ___.") },
  { id: "differently", text: w("I see it a bit differently. I think ___.") },
  { id: "first-then", text: w("First ___, then ___, and at the end ___.") },
  { id: "question", text: w("Can I ask about ___?", "Could I ask a question about ___?") },
];
