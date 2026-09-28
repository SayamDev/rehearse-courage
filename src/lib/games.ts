import type { Words } from "./types";

const w = (kid: string, grown: string = kid): Words => ({ kid, grown });

export type GameId = "word-builder" | "rescue-snap" | "hot-seat" | "breath-balloon" | "story-dice";

/** The warm-up games: about a minute or two each, nothing to lose, no clocks. */
export const GAMES: { id: GameId; title: string; line: Words; time: string }[] = [
  { id: "hot-seat", title: "Hot seat", line: w("Spin for a question. Answer in your own time.", "Spin for a question and answer it in your own time."), time: "2 min" },
  { id: "story-dice", title: "Story dice", line: w("Roll three pictures. Tell a tiny story.", "Roll three pictures and tell a tiny story about them."), time: "2 min" },
  { id: "rescue-snap", title: "Rescue snap", line: w("Match a tricky moment to the words that help.", "Match an awkward moment to a rescue phrase."), time: "2 min" },
  { id: "word-builder", title: "Word builder", line: w("Put the words in order, then say it.", "Put a sentence back in order, then say it out loud."), time: "2 min" },
  { id: "breath-balloon", title: "Breath balloon", line: w("Breathe in to blow up the balloon.", "Fill the balloon with slow breaths."), time: "1 min" },
];

export function gameById(id: string) {
  return GAMES.find((g) => g.id === id);
}

/** A small seeded random (mulberry32), so a round is the same for a given seed and tests are stable. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Shuffles words so the puzzle never starts already solved (when it can be unsolved at all). */
export function scramble(words: string[], rand: () => number): string[] {
  if (new Set(words).size < 2) return [...words];
  let out = shuffle(words, rand);
  for (let tries = 0; tries < 8 && out.join(" ") === words.join(" "); tries++) out = shuffle(words, rand);
  return out.join(" ") === words.join(" ") ? [...words.slice(1), words[0]] : out;
}

/* ---------- Word builder ---------- */

export const BUILD_SENTENCES: Words[] = [
  w("Can I ask a question?"),
  w("I think the answer is ten."),
  w("Can I sit with you?", "Mind if I sit here?"),
  w("I like your drawing.", "I really like that idea."),
  w("Can you say that again?", "Could you say that again, please?"),
  w("I would like to go first.", "I am happy to go first."),
  w("That sounds fun, can I join?", "That sounds good, can I join in?"),
];

/** Words of a sentence as chips (punctuation stays with its word). */
export const sentenceWords = (s: string) => s.split(" ").filter(Boolean);

/* ---------- Rescue snap ---------- */

export const SNAP_ROUNDS: { moment: Words; answer: string; others: string[] }[] = [
  { moment: w("The teacher asks you something and your mind goes blank.", "You are asked a question and your mind goes blank."), answer: "come-back", others: ["say-again", "pass"] },
  { moment: w("You did not hear what your friend said.", "You did not catch what someone asked."), answer: "say-again", others: ["good-question", "start-again"] },
  { moment: w("Your words come out in a jumble.", "Your sentence gets tangled halfway through."), answer: "start-again", others: ["come-back", "not-sure"] },
  { moment: w("You only half know the answer.", "You only half know the answer."), answer: "not-sure", others: ["pass", "lost-thread"] },
  { moment: w("You forget what you were saying.", "You lose your place mid-sentence."), answer: "lost-thread", others: ["say-again", "good-question"] },
  { moment: w("You need a second to think.", "You need a moment to think before you answer."), answer: "think-second", others: ["pass", "start-again"] },
];

/* ---------- Hot seat ---------- */

export const HOT_SEAT: Words[] = [
  w("What is the best snack, and why?", "What is a food you could eat every day?"),
  w("If you could have any pet, what would it be?", "If you could live anywhere for a year, where?"),
  w("What made you smile this week?"),
  w("What is something you are good at?", "What is something you are quietly proud of?"),
  w("Would you rather fly or be invisible?", "Would you rather be able to fly or read minds?"),
  w("What is your favourite song right now?"),
  w("Describe your perfect weekend.", "Describe a perfect day off."),
  w("What is a film or show you would recommend?"),
  w("If you ran the school for a day, what would you change?", "If you ran your workplace or school for a day, what would you change?"),
  w("What is something new you would like to learn?"),
];

/* ---------- Story dice ---------- */

/** Picture names for the dice; the view maps each to an icon. */
export const DICE_FACES = [
  "cat", "rocket", "umbrella", "pizza", "tree", "crown", "ghost", "bicycle", "key", "moon", "book", "guitar",
  "dog", "castle", "fish", "cake", "robot", "map", "sun", "train", "balloon", "football", "cap", "butterfly",
] as const;
export type DiceFace = (typeof DICE_FACES)[number];

/** Three different pictures. */
export function rollDice(rand: () => number): DiceFace[] {
  return shuffle([...DICE_FACES], rand).slice(0, 3);
}

/* ---------- Breath balloon ---------- */

/** How full the balloon is (0 to 1) after holding for `ms`: fills over about 4 seconds, like a slow breath in. */
export function inflate(start: number, ms: number): number {
  return Math.min(1, start + ms / 4000);
}

/** And lets go over about 6 seconds, a slow breath out. */
export function deflate(start: number, ms: number): number {
  return Math.max(0, start - ms / 6000);
}

/** A breath counts once the balloon was filled at least halfway. */
export const BREATHS = 5;
export const FULL_ENOUGH = 0.5;

/** A fresh random for one play-through (outside render, via a lazy initializer). */
export function freshRand(): () => number {
  return seeded(Math.floor(Math.random() * 2 ** 31));
}

/** Story dice: a first line to borrow when stuck. */
export const STORY_STARTS = ["Once upon a time,", "Yesterday, something odd happened.", "Nobody believed me, but", "It all started when"];

/** Breath balloon: what the balloon says, read aloud as the breath changes. */
export const BALLOON_CUES = {
  start: "Hold the button and breathe in.",
  in: "Breathe in...",
  full: "Full. Now let go and breathe out slowly.",
  out: "And slowly out...",
  done: "Five slow breaths. Nicely done.",
} as const;
