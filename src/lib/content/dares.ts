import type { Words } from "@/lib/types";

const w = (kid: string, grown: string = kid): Words => ({ kid, grown });

/**
 * Tiny dares: one small, real speaking moment a day, done out in the world.
 * Kids never get a dare to talk to a stranger on their own: those say a
 * grown-up is there. Doing one counts as a brave day; skipping one changes
 * nothing.
 */
export const DARES: { id: string; text: Words }[] = [
  { id: "hello-first", text: w("Say hello to someone before they say it to you.", "Say hello first to someone you usually wait for.") },
  { id: "good-morning", text: w("Say good morning to your teacher.", "Say good morning to someone at school or work.") },
  { id: "thank-why", text: w("Say thank you to someone, and say why.", "Thank someone and tell them why.") },
  { id: "compliment", text: w("Tell someone you like something they made or did.", "Give someone a real compliment.") },
  { id: "one-question", text: w("Ask one question in class.", "Ask one question in a class or meeting.") },
  { id: "hand-up", text: w("Put your hand up once, even if you only half know.", "Offer one answer or idea, even if you only half know.") },
  { id: "your-day", text: w("Tell someone one thing about your day.", "Tell someone one thing about your day.") },
  { id: "ask-how", text: w("Ask someone how their day is going.", "Ask someone how their day is going, and listen.") },
  { id: "small-help", text: w("Ask someone to help you with something small.", "Ask someone for help with something small.") },
  { id: "what-you-think", text: w("Say what you think about something, even a small thing.", "Share your opinion on something, even a small thing.") },
  { id: "read-one", text: w("Read one sentence out loud to someone.", "Read something short out loud to someone.") },
  { id: "new-name", text: w("Tell someone new your name.", "Introduce yourself to someone new.") },
  { id: "order-own", text: w("Order your own food or drink, with a grown-up there.", "Order your own food or drink out loud.") },
  { id: "shop-question", text: w("With a grown-up nearby, ask someone in a shop a question.", "Ask someone in a shop a question.") },
  { id: "answer-phone", text: w("Answer the phone at home, if a grown-up says it is okay.", "Answer a call instead of letting it ring.") },
  { id: "call-family", text: w("Phone someone in your family for a quick chat.", "Make a quick call to a friend or family member.") },
  { id: "voice-note", text: w("Record a short voice message for someone in your family.", "Send a voice note instead of a text.") },
  { id: "join-chat", text: w("Add one sentence to a chat with friends.", "Add one comment to a conversation you would usually just listen to.") },
  { id: "funny-story", text: w("Tell someone about something funny that happened.", "Tell someone a short story from your week.") },
  { id: "suggest", text: w("Suggest a game to play.", "Suggest a plan, like where to eat or what to watch.") },
  { id: "say-again", text: w("If you do not hear something, ask them to say it again.", "If you miss something, ask them to repeat it.") },
  { id: "rescue-real", text: w("Use a rescue phrase for real, like \"Let me think for a second.\"", "Use a rescue phrase for real, like \"Let me think for a second.\"") },
  { id: "kind-no", text: w("Say no kindly to something you do not want to do.", "Say a kind, clear no to something.") },
  { id: "one-minute", text: w("Talk for a whole minute about something you love.", "Talk for a minute to someone about something you love.") },
  { id: "after-class", text: w("Ask your teacher something after the lesson.", "Ask someone a follow-up question after a talk or meeting.") },
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Today's dare: the same all day, a different one tomorrow. `swap` steps
 * through the list from there, so "Another one" never repeats until it has
 * been all the way round.
 */
export function dailyDare(day: string, swap = 0): { id: string; text: Words } {
  const start = hash(`dare:${day}`) % DARES.length;
  return DARES[(start + swap) % DARES.length];
}

export function dareById(id: string) {
  return DARES.find((d) => d.id === id);
}
