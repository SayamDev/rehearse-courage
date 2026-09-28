import { describe, expect, it } from "vitest";
import { looksLikeWords } from "./sense";

describe("looksLikeWords", () => {
  it.each([
    "",
    "Can I join you?",
    "hi",
    "ok",
    "um, sorry, can I ask a question",
    "I think the answer is 42",
    "Strengths and rhythms",
    "lol yeah same",
    "Hola, ¿puedo sentarme aquí?",
    "مرحبا كيف حالك",
    "Mmm maybe",
    "Priya",
  ])("accepts real words: %j", (text) => {
    expect(looksLikeWords(text)).toBe(true);
  });

  it.each([
    "asdfghjkl",
    "sdfsdf hjkhjk qwerty",
    "fjdkslfjdksl",
    "xcvbnm",
    "hhhhhhhh",
    "bcdfghjklmn",
    "qwrtp zxcvb",
    "...",
  ])("catches random letters: %j", (text) => {
    expect(looksLikeWords(text)).toBe(false);
  });
});
