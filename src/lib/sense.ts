/**
 * A gentle, on-device check that typed words look like words, so random
 * key-mashing is not praised as if it were an answer. Only for typed text:
 * speech is never checked, so stutters, pauses and fillers are never judged.
 * It is deliberately forgiving: short words, slang, other languages with
 * vowels, numbers and names all pass. It only catches text that is clearly
 * not words (no vowels, long consonant runs, one key held down, keyboard rows).
 */

const VOWELS = /[aeiouyàáâäãåèéêëìíîïòóôöõùúûüæœ]/i;
const KEY_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890"];

/** Four or more neighbouring keys in a row, either direction (asdf, lkjh, qwer). */
function keyboardRun(word: string): boolean {
  for (const row of KEY_ROWS) {
    const back = [...row].reverse().join("");
    for (let i = 0; i + 4 <= word.length; i++) {
      const part = word.slice(i, i + 4);
      if (row.includes(part) || back.includes(part)) return true;
    }
  }
  return false;
}

function plausible(word: string): boolean {
  // Numbers, and short words like "hi", "ok", "mm" or "I".
  if (!/\p{L}/u.test(word) || word.length <= 3) return true;
  if (!/^[a-z]+$/.test(word)) return VOWELS.test(word) || !/[a-z]/.test(word);
  if (!VOWELS.test(word)) return false;
  if (/[^aeiouy]{6,}/.test(word)) return false;
  if (/(.)\1{3,}/.test(word)) return false;
  if (keyboardRun(word)) return false;
  return true;
}

/** True when the text reads like words someone might say. Empty text counts as words (nothing to question). */
export function looksLikeWords(raw: string): boolean {
  const text = raw.toLowerCase().trim();
  if (!text) return true;
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length < 2) return /\d/.test(text) || letters.length === 1;
  const words = text.split(/[^\p{L}\p{N}']+/u).map((w) => w.replace(/'/g, "")).filter(Boolean);
  if (words.length === 0) return false;
  const good = words.filter(plausible).length;
  return good / words.length >= 0.5;
}

/** What to say when typed text looks like random letters: kind, and never a telling-off. */
export const NOT_WORDS = "That looks like random letters. Try the words you would really say. A few words is plenty.";
