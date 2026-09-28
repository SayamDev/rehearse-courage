import type { Words } from "@/lib/types";

const w = (kid: string, grown: string = kid): Words => ({ kid, grown });

export type KitToolId = "breathing" | "grounding" | "blushing" | "sweating" | "rescue" | "frames" | "speech";

/** The body kit, in the order the kit grid shows them. `art` is a round tile illustration in public/art/kit/, when there is one. */
export const KIT_TOOLS: { id: KitToolId; title: string; line: Words; helps: Words; art: string | null }[] = [
  {
    id: "breathing",
    title: "Breathing",
    line: w("Slow your breath with the lantern.", "Slow your breathing and your body."),
    helps: w("Helps when you feel wobbly inside", "Helps with rising nerves"),
    art: "/art/kit/breathing.webp",
  },
  {
    id: "grounding",
    title: "Grounding",
    line: w("Come back to right here, right now.", "Get back to the present moment."),
    helps: w("Helps when your head feels far away", "Helps when you feel lost or far away"),
    art: "/art/kit/grounding.webp",
  },
  {
    id: "blushing",
    title: "Blushing",
    line: w("What a hot face means, and what helps.", "What a flushed face means, and what helps."),
    helps: w("Helps when your face goes red", "Helps with feeling self-conscious"),
    art: "/art/kit/blushing.webp",
  },
  {
    id: "sweating",
    title: "Sweating",
    line: w("Cool your body and let it settle.", "Cool your body and ease the tension."),
    helps: w("Helps when you feel hot or sticky", "Helps when you feel too hot or tense"),
    art: "/art/kit/sweating.webp",
  },
  {
    id: "rescue",
    title: "Rescue phrases",
    line: w("Quick words for when your mind goes blank.", "Quick words to buy time when your mind goes blank."),
    helps: w("Helps when you feel stuck", "Helps when you feel stuck or put on the spot"),
    art: "/art/kit/rescue.webp",
  },
  {
    id: "frames",
    title: "Sentence frames",
    line: w("Fill in the gaps to build what you want to say.", "Simple shapes for building a sentence."),
    helps: w("Helps when you don't know how to start", "Helps when you're unsure how to start"),
    art: "/art/kit/frames.webp",
  },
  {
    id: "speech",
    title: "Speech tools",
    line: w("Ways some people like to talk when words get stuck.", "Optional techniques for when words get stuck."),
    helps: w("For anyone whose words sometimes get stuck"),
    art: null,
  },
];

export function kitTool(id: string) {
  return KIT_TOOLS.find((t) => t.id === id);
}

/** 5-4-3-2-1 grounding, one sense at a time (the hint is read aloud). */
export const GROUNDING_STEPS: { n: number; sense: string; hint: string }[] = [
  { n: 5, sense: "things you can see", hint: "Look around slowly. Name them in your head or out loud." },
  { n: 4, sense: "things you can touch", hint: "Your sleeve, the chair, the floor under your feet." },
  { n: 3, sense: "things you can hear", hint: "Near sounds and far away sounds both count." },
  { n: 2, sense: "things you can smell", hint: "If nothing comes, think of two smells you like." },
  { n: 1, sense: "thing you can taste", hint: "Or take a sip of water and notice it." },
];

/** Spoken cues for the breathing circle, one per breath. */
export const BREATH_CUES = { in: "Breathe in slowly.", out: "And slowly out." } as const;

/** Read aloud when a step is saved. */
export const STEP_DONE_LINE = "You had a go. That took courage.";

/** Read aloud when step 6, the real thing, is done: the biggest moment in the app. */
export const FOR_REAL_LINE = "You did it for real. That was the bravest step of all.";

/** What the body is doing, in plain words. No medical claims. */
export const BODY_EXPLAINERS: Record<"blushing" | "sweating", Words[]> = {
  blushing: [
    w(
      "When you feel nervous, your body sends more blood to your face. That is the warm, red feeling.",
      "When you feel on the spot, your body opens up the blood vessels in your face. That is the warm, red feeling.",
    ),
    w(
      "It is your body trying to help, even if it does not feel like it. It always fades.",
      "It is a common reaction to being on the spot. It always fades.",
    ),
  ],
  sweating: [
    w(
      "When you feel nervous, your body gets ready to move and cools itself down with sweat.",
      "Nerves switch on your body's get-ready mode, and sweat is how it cools itself down.",
    ),
    w("Lots of people sweat when they are nervous. Other people notice it much less than you think.", "It is very common, and other people notice it far less than it feels like they do."),
  ],
};

/** One card at a time: a kinder thought, then a small thing to try. */
export const REFRAME_CARDS: Record<"blushing" | "sweating", { thought: Words; tryThis: Words }[]> = {
  blushing: [
    {
      thought: w("Blushing shows you care. That is a good thing.", "Blushing shows you care. People tend to find it warm, not strange."),
      tryThis: w("Let it be there. Fighting it makes it stay longer.", "Let it be there. Trying to stop it tends to make it last longer."),
    },
    {
      thought: w("Most people are busy thinking about themselves.", "Most people are too busy with their own thoughts to notice much."),
      tryThis: w("Look at something in the room and name its colour.", "Put your attention on something outside you, like the colour of a wall."),
    },
    {
      thought: w("A red face never stopped anyone from speaking.", "You can blush and still say what you wanted to say."),
      tryThis: w("Take one slow breath out, then say your first word.", "Take one long breath out, then start with your first word."),
    },
  ],
  sweating: [
    {
      thought: w("Your body is getting ready. That energy can help you speak.", "This is your body getting ready. The same energy can help you speak."),
      tryThis: w("Hold something cool, like a water bottle.", "Hold something cool, like a water bottle, or run your wrists under cold water."),
    },
    {
      thought: w("Other people cannot see most of what you feel.", "Most of what you feel on the inside does not show on the outside."),
      tryThis: w("Loosen your shoulders and let your hands go floppy.", "Drop your shoulders and let your hands go loose for a moment."),
    },
    {
      thought: w("It will pass, like it always does.", "It passes, like it always does."),
      tryThis: w("Breathe out for longer than you breathe in, three times.", "Breathe out for longer than you breathe in, three times."),
    },
  ],
};

/** Speech tools: options, never rules. Offered, not required, and never measured. */
export const SPEECH_TOOLS: { id: "easy-onset" | "pausing" | "light-contact"; title: string; how: Words; practice: string[] }[] = [
  {
    id: "easy-onset",
    title: "Easy start",
    how: w(
      "Start your first word gently, with a little breath, like a soft sigh.",
      "Begin the first sound gently, letting a little air flow first, like a soft sigh.",
    ),
    // Words that start with a vowel or h are the easiest place to feel a gentle start.
    practice: ["Hello", "I think so", "Only one", "Every day", "Actually", "How are you?"],
  },
  {
    id: "pausing",
    title: "Pausing",
    how: w("Stop for a moment between groups of words. Pauses are allowed.", "Take short pauses between phrases. Pauses give you time and help listeners follow."),
    // One sentence in speakable chunks, read along with the pacer.
    practice: ["I think", "we should start", "with the easy part,", "and then", "try the hard one."],
  },
  {
    id: "light-contact",
    title: "Light touch",
    how: w("Let your lips and tongue touch lightly, not pressed hard.", "Keep your lips and tongue touching lightly rather than pressing hard on sounds."),
    // Words that start with p, b, t, d, k or g, where pressing hard is most common.
    practice: ["Pizza", "Buddy", "Today", "Dinner", "Cookie", "Good morning"],
  },
];

/** Acceptance lines, shown alongside the speech tools. */
export const ACCEPTANCE_LINES: Words[] = [
  w("Stuttering is a way of talking, not a mistake."),
  w("You get to decide whether to use any of these tools. Talking your way is fine.", "Using these tools is your choice. Talking your own way is always fine."),
  w("What you say matters more than how smoothly you say it."),
  w("Good listeners wait. You are allowed to take your time.", "Good listeners wait. You are allowed to take the time you need."),
];
