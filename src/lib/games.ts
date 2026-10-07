import type { Words } from "./types";

const w = (kid: string, grown: string = kid): Words => ({ kid, grown });

export type GameId =
  | "word-builder"
  | "rescue-snap"
  | "hot-seat"
  | "breath-balloon"
  | "story-dice"
  | "say-it-like"
  | "describe-it"
  | "keep-it-going";

/** The warm-up games: about a minute or two each, nothing to lose, no clocks. */
export const GAMES: { id: GameId; title: string; line: Words; time: string }[] = [
  { id: "hot-seat", title: "Hot seat", line: w("Spin for a question. Answer in your own time.", "Spin for a question and answer it in your own time."), time: "2 min" },
  { id: "story-dice", title: "Story dice", line: w("Roll three pictures. Tell a tiny story.", "Roll three pictures and tell a tiny story about them."), time: "2 min" },
  { id: "rescue-snap", title: "Rescue snap", line: w("Match a tricky moment to the words that help.", "Match an awkward moment to a rescue phrase."), time: "2 min" },
  { id: "word-builder", title: "Word builder", line: w("Put the words in order, then say it.", "Put a sentence back in order, then say it out loud."), time: "2 min" },
  { id: "breath-balloon", title: "Breath balloon", line: w("Breathe in to blow up the balloon.", "Fill the balloon with slow breaths."), time: "1 min" },
  { id: "say-it-like", title: "Say it like", line: w("Say a line in a silly voice, like a robot or a pirate.", "Say an everyday line in a different style, like a news reader."), time: "2 min" },
  { id: "describe-it", title: "Describe it", line: w("Describe a picture without saying what it is.", "Describe a picture without naming it."), time: "2 min" },
  { id: "keep-it-going", title: "Keep it going", line: w("A friend says something. Ask them a question back.", "Someone shares something. Find a question to keep it going."), time: "2 min" },
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

/** A different index from `current` (when there is more than one), for "next card" buttons. -1 means none yet: any card. */
export function nextIndex(current: number, length: number, rand: () => number): number {
  if (length < 2) return 0;
  if (current < 0 || current >= length) return Math.floor(rand() * length);
  const n = Math.floor(rand() * (length - 1));
  return n >= current ? n + 1 : n;
}

/** Story dice: a first line to borrow when stuck. */
export const STORY_STARTS = ["Once upon a time,", "Yesterday, something odd happened.", "Nobody believed me, but", "It all started when"];

/** Breath balloon: what the balloon says, read aloud as the breath changes. */
export const BALLOON_CUES = {
  start: "Hold the button and breathe in.",
  in: "Breathe in slowly.",
  full: "Let go when you are ready. Breathe out gently.",
  out: "And breathe out.",
  done: "That is five breaths. Take your time before moving on.",
} as const;

/* ---------- Say it like ---------- */

/** Everyday lines, the kind people freeze on, to say in a playful style. */
export const SAY_LINES: Words[] = [
  w("Can I have a glass of water, please?", "Could I get a glass of water, please?"),
  w("Good morning, everyone."),
  w("I think the answer is seven."),
  w("Can I sit here?", "Is anyone sitting here?"),
  w("My favourite food is pizza.", "My favourite food is pasta."),
  w("Excuse me, where is the library?", "Excuse me, where is the station?"),
  w("Thank you very much."),
  w("Can you say that again, please?"),
];

/** Styles to say it in. Playing with your voice warms it up, and there is no wrong way to do it. */
export const SAY_STYLES: Words[] = [
  w("in a whisper"),
  w("like a robot"),
  w("like a news reader"),
  w("like a sleepy bear", "like you just woke up"),
  w("like a pirate"),
  w("really excited"),
  w("like a secret agent"),
  w("in slow motion"),
  w("like a sports commentator"),
  w("like a king or queen", "like a very posh butler"),
];

/* ---------- Describe it ---------- */

/** Questions to lean on when describing a picture. */
export const DESCRIBE_HINTS: Words[] = [
  w("What colour is it?", "What does it look like?"),
  w("Where would you find it?"),
  w("What is it used for?", "What do people do with it?"),
  w("Is it big or small?", "What does it feel like?"),
];

/* ---------- Keep it going ---------- */

/** Someone shares something; the game is finding a question back. Two ideas each, shown only if wanted. */
export const KEEP_GOING: { says: Words; ideas: Words[] }[] = [
  { says: w("I went to the beach at the weekend."), ideas: [w("Who did you go with?"), w("Did you go in the sea?", "Was it busy?")] },
  { says: w("I just got a new game.", "I've just started a new series."), ideas: [w("What kind of game is it?", "What's it about?"), w("Is it fun?", "Would you recommend it?")] },
  { says: w("My dog did something funny today."), ideas: [w("What did he do?"), w("What is your dog called?", "What's your dog's name?")] },
  { says: w("I'm really tired today."), ideas: [w("Oh no, did you sleep badly?"), w("Was it a busy day?", "Busy week?")] },
  { says: w("I started learning the guitar."), ideas: [w("What song are you learning?"), w("Is it hard?", "How long have you been playing?")] },
  { says: w("We're going on holiday next week."), ideas: [w("Where are you going?"), w("What are you most looking forward to?")] },
  { says: w("I watched a really good film."), ideas: [w("What was it called?"), w("What was the best bit?")] },
  { says: w("I made pancakes this morning."), ideas: [w("What did you put on them?"), w("Do you like cooking?", "Do you cook a lot?")] },
  { says: w("My team won at the weekend."), ideas: [w("What was the score?"), w("Did you watch it?", "Were you there?")] },
  { says: w("I'm a bit nervous about tomorrow."), ideas: [w("What's happening tomorrow?"), w("Is there anything that would help?")] },
];
