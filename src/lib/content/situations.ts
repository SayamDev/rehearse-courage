import type { RoomId, Words } from "@/lib/types";

export type Situation = {
  id: string;
  room: RoomId;
  title: Words;
  /** What is happening, told to the user. */
  scene: Words;
  /** Example things the user could say. */
  ideas: Words[];
  /** The real-life version for step 6. */
  mission: Words;
};

const w = (kid: string, grown: string = kid): Words => ({ kid, grown });

export const ROOMS: { id: RoomId; name: Words }[] = [
  { id: "class", name: w("In class") },
  { id: "friends", name: w("With friends") },
  { id: "presenting", name: w("Talking to a group", "Presenting") },
  { id: "out", name: w("Out and about") },
];

export const SITUATIONS: Situation[] = [
  {
    id: "class-answer",
    room: "class",
    title: w("Answer a question", "Answer a question in class"),
    scene: w(
      "Your teacher asks the class a question. You think you know the answer.",
      "The teacher asks the room a question. You have an answer, even if you are not fully sure.",
    ),
    ideas: [
      w("I think it is ...", "I think the answer is ..."),
      w("Is it ...?", "Could it be ..., because ...?"),
      w("I am not sure, but maybe ...", "I am not certain, but my guess is ..."),
    ],
    mission: w(
      "Put your hand up and answer one question in class.",
      "Answer one question out loud in a real class or meeting.",
    ),
  },
  {
    id: "class-ask",
    room: "class",
    title: w("Ask a question", "Ask the teacher a question"),
    scene: w(
      "You did not understand part of the lesson. You want to ask.",
      "Something in the lesson did not make sense. Asking helps you and others who were too shy to ask.",
    ),
    ideas: [
      w("Can you say that part again, please?", "Could you go over that part again, please?"),
      w("What does ... mean?", "Can I check what ... means?"),
    ],
    mission: w("Ask your teacher one question.", "Ask one real question in class or at work."),
  },
  {
    id: "class-read",
    room: "class",
    title: w("Read out loud", "Read aloud to the class"),
    scene: w(
      "It is your turn to read a few lines out loud.",
      "You are asked to read a short passage aloud. You can go at your own pace.",
    ),
    ideas: [
      w("The fox ran across the field and hid behind a tree.", "The fox crossed the field and waited behind the old oak tree."),
      w("Take a breath, then read one line at a time.", "Pause at full stops. It sounds calm, not slow."),
    ],
    mission: w("Read a few lines out loud in class or at home to someone.", "Read a short passage aloud to at least one person."),
  },
  {
    id: "class-group",
    room: "class",
    title: w("Share in a group", "Share an idea in group work"),
    scene: w(
      "You are in a small group. Everyone is sharing ideas.",
      "Your group is planning a task. Others are talking and you have an idea too.",
    ),
    ideas: [
      w("I have an idea. What if we ...?", "Can I add something? What if we ..."),
      w("I agree with ..., and also ...", "Building on that, we could ..."),
    ],
    mission: w("Share one idea in a group.", "Share one idea in a real group discussion."),
  },
  {
    id: "class-register",
    room: "class",
    title: w("Answer the register", "Answer when your name is called"),
    scene: w(
      "The teacher is taking the register. Your name is next.",
      "Names are being called one by one, in a class, a club or a meeting. Yours is next.",
    ),
    ideas: [w("Here."), w("Yes, here."), w("Here, thank you.", "Yes, I'm here.")],
    mission: w("Answer the register out loud, even quietly.", "Answer out loud when your name is called."),
  },
  {
    id: "friends-join",
    room: "friends",
    title: w("Join in a chat", "Join a conversation"),
    scene: w(
      "Some friends are talking about a game you like.",
      "A few people are chatting about something you know about. You want to join in.",
    ),
    ideas: [
      w("I play that too.", "Oh, I have seen that too."),
      w("What level are you on?", "What did you think of it?"),
    ],
    mission: w("Join a chat with friends by saying one thing.", "Join a real conversation with one comment or question."),
  },
  {
    id: "friends-opinion",
    room: "friends",
    title: w("Say what you think", "Give your opinion"),
    scene: w(
      "Your friends ask which film you liked best.",
      "Friends ask what you think about a plan. Your opinion counts as much as theirs.",
    ),
    ideas: [
      w("I liked ... best because ...", "Honestly, I think ... because ..."),
      w("I am not sure yet, but I like ...", "I lean towards ..., mostly because ..."),
    ],
    mission: w("Tell a friend what you think about something.", "Share one honest opinion with a friend."),
  },
  {
    id: "friends-disagree",
    room: "friends",
    title: w("Disagree kindly", "Disagree kindly"),
    scene: w(
      "Your friend says something you do not agree with.",
      "A friend says something you see differently. You can disagree and still be kind.",
    ),
    ideas: [
      w("I see it a bit differently.", "I see it a bit differently, actually."),
      w("That is fair, but I think ...", "I get that, and I also think ..."),
    ],
    mission: w("Kindly say you see something differently.", "Kindly share a different view in a real chat."),
  },
  {
    id: "friends-story",
    room: "friends",
    title: w("Tell a short story", "Tell a short story"),
    scene: w(
      "Your friends ask what you did at the weekend.",
      "Someone asks what you have been up to. A short story is enough.",
    ),
    ideas: [
      w("On Saturday I went to ... and ...", "This weekend I went to ..., and the funny part was ..."),
      w("Something funny happened. So ...", "So, something odd happened on the way to ..."),
    ],
    mission: w("Tell a friend a short story about your day.", "Tell someone a short story from your week."),
  },
  {
    id: "friends-invite",
    room: "friends",
    title: w("Ask someone to join you", "Suggest a plan"),
    scene: w(
      "You want to ask someone to play with you at break.",
      "You would like to do something with a friend, or someone you would like to know better.",
    ),
    ideas: [
      w("Do you want to play with me?", "Do you fancy doing something this week?"),
      w("We are playing a game. Want to join?", "A few of us are going to ... Want to come?"),
    ],
    mission: w("Ask someone to play or sit with you.", "Suggest a plan to someone for real."),
  },
  {
    id: "friends-no",
    room: "friends",
    title: w("Say no kindly", "Say no kindly"),
    scene: w(
      "A friend asks you to do something you do not want to do.",
      "Someone asks you for something you would rather not do. You are allowed to say no.",
    ),
    ideas: [
      w("No thanks, not today.", "Thanks for asking, but I'll pass this time."),
      w("I do not want to, but we could ... instead.", "I'd rather not, but how about ... instead?"),
    ],
    mission: w("Say no kindly to something you do not want to do.", "Say a kind, clear no in real life."),
  },
  {
    id: "present-intro",
    room: "presenting",
    title: w("Say who you are", "Introduce yourself"),
    scene: w(
      "You are new in a group and need to say your name and one thing about you.",
      "You are asked to introduce yourself to a group. Name plus one or two things is enough.",
    ),
    ideas: [
      w("Hi, I am ... and I like ...", "Hi, I am ... I am into ..., and I am here because ..."),
      w("My name is ... One fun thing about me is ...", "I am ... Something people do not know about me is ..."),
    ],
    mission: w("Say your name and one thing about you to a group.", "Introduce yourself to a real group."),
  },
  {
    id: "present-minute",
    room: "presenting",
    title: w("Talk for one minute", "Give a one-minute talk"),
    scene: w(
      "You talk for about one minute about something you love.",
      "You give a short talk, about one minute, on a topic you know well.",
    ),
    ideas: [
      w("Today I will tell you about ...", "I want to tell you about ... for three reasons."),
      w("The best thing about it is ...", "First ..., then ..., and finally ..."),
    ],
    mission: w("Talk for one minute to someone about a thing you love.", "Give a short talk to at least one person."),
  },
  {
    id: "present-questions",
    room: "presenting",
    title: w("Answer a question after", "Take a question after your talk"),
    scene: w(
      "You finished your talk. Someone puts their hand up with a question.",
      "Your talk is done and someone asks a question. You can take a moment before you answer.",
    ),
    ideas: [
      w("Good question. I think ...", "That's a good question. I think ..."),
      w("I am not sure, but I can find out.", "I don't know yet, but I'll find out and let you know."),
    ],
    mission: w("Answer one question after you share something.", "Answer one real question after you speak."),
  },
  {
    id: "out-order",
    room: "out",
    title: w("Order food or a drink", "Order at a counter"),
    scene: w(
      "You are at the front of the queue in a cafe. It is your turn to order.",
      "You reach the front of the queue at a cafe or counter. The person serving is ready for you.",
    ),
    ideas: [
      w("Can I have ..., please?", "Could I get ..., please?"),
      w("I would like ..., please. Thank you.", "Hi, can I have ... to take away, please?"),
    ],
    mission: w("Order something for yourself at a counter.", "Order something yourself, out loud, at a real counter."),
  },
  {
    id: "out-shop",
    room: "out",
    title: w("Ask for help in a shop", "Ask for help in a shop"),
    scene: w(
      "You cannot find something in a shop. There is someone who works there nearby.",
      "You are looking for something in a shop and cannot find it. A member of staff is close by.",
    ),
    ideas: [
      w("Excuse me, where can I find ...?", "Excuse me, do you have any ...?"),
      w("Sorry, can you help me find ...?", "Hi, could you point me towards ...?"),
    ],
    mission: w("Ask someone in a shop to help you find something.", "Ask a member of staff for help in a real shop."),
  },
  {
    id: "out-phone",
    room: "out",
    title: w("Make a phone call", "Make a phone call"),
    scene: w(
      "You call someone you know, like a grandparent, to ask them something.",
      "You need to phone somewhere to ask a question or book something. Someone answers.",
    ),
    ideas: [
      w("Hi, it is ... I wanted to ask ...", "Hi, I'm calling to ask about ..."),
      w("Can I talk to ..., please?", "Hi, could I book ... for ..., please?"),
    ],
    mission: w("Make a short phone call to someone you know.", "Make one real phone call you have been putting off."),
  },
  {
    id: "out-directions",
    room: "out",
    title: w("Ask the way", "Ask for directions"),
    scene: w(
      "You are with a grown-up and you are not sure where to go. You ask someone the way.",
      "You are not sure where you are going. Someone nearby looks friendly.",
    ),
    ideas: [
      w("Excuse me, where is the ...?", "Excuse me, do you know the way to ...?"),
      w("Is the ... this way?", "Sorry, is this the right way for ...?"),
    ],
    mission: w("With a grown-up nearby, ask someone the way.", "Ask someone for directions for real."),
  },
];

export function situationById(id: string): Situation | undefined {
  return SITUATIONS.find((s) => s.id === id);
}
