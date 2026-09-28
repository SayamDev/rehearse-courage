import { describe, expect, it } from "vitest";
import { RESCUE_PHRASES } from "./content/phrases";
import { deflate, nextIndex, DESCRIBE_HINTS, DICE_FACES, GAMES, gameById, inflate, KEEP_GOING, rollDice, SAY_LINES, SAY_STYLES, scramble, seeded, SNAP_ROUNDS } from "./games";

describe("games", () => {
  it("has eight games, found by id", () => {
    expect(GAMES).toHaveLength(8);
    expect(gameById("story-dice")?.title).toBe("Story dice");
    expect(gameById("nope")).toBeUndefined();
  });

  it("scramble never starts solved and keeps every word", () => {
    for (let s = 0; s < 50; s++) {
      const words = ["Can", "I", "ask", "a", "question?"];
      const out = scramble(words, seeded(s));
      expect(out.join(" ")).not.toBe(words.join(" "));
      expect([...out].sort()).toEqual([...words].sort());
    }
  });

  it("rolls three different pictures, the same for the same seed", () => {
    const a = rollDice(seeded(7));
    expect(new Set(a).size).toBe(3);
    expect(a.every((f) => (DICE_FACES as readonly string[]).includes(f))).toBe(true);
    expect(rollDice(seeded(7))).toEqual(a);
  });

  it("every rescue snap round uses real rescue phrases", () => {
    const ids = new Set(RESCUE_PHRASES.map((p) => p.id));
    for (const r of SNAP_ROUNDS) [r.answer, ...r.others].forEach((id) => expect(ids.has(id)).toBe(true));
  });

  it("the balloon fills over 4 seconds and empties over 6", () => {
    expect(inflate(0, 2000)).toBe(0.5);
    expect(inflate(0.8, 4000)).toBe(1);
    expect(deflate(1, 3000)).toBe(0.5);
    expect(deflate(0.1, 6000)).toBe(0);
  });

  it("new game copy is plain: no dashes or exclamation marks, two ideas per chat line", () => {
    const all = [...SAY_LINES, ...SAY_STYLES, ...DESCRIBE_HINTS, ...KEEP_GOING.flatMap((k) => [k.says, ...k.ideas])];
    for (const t of all.flatMap((x) => [x.kid, x.grown])) expect(t).not.toMatch(/[–—!]/);
    for (const k of KEEP_GOING) expect(k.ideas).toHaveLength(2);
    expect(SAY_STYLES.length).toBeGreaterThanOrEqual(8);
  });

  it("next card is always a different one", () => {
    const rand = seeded(3);
    for (let k = 0; k < 100; k++) {
      const cur = k % 8;
      const n = nextIndex(cur, 8, rand);
      expect(n).not.toBe(cur);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(8);
    }
    expect(nextIndex(-1, 5, () => 0)).toBe(0);
    expect(nextIndex(0, 1, rand)).toBe(0);
  });
});
