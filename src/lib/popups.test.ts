import { describe, expect, test } from "vitest";
import { normalize } from "./state";
import { nameAskDue, quietPage, saveNudgeDue, voiceOfferDue, welcomeDue } from "./popups";

const rec = { situationId: "class-answer", level: 1, at: "2026-09-20T10:00:00.000Z", seconds: null, typed: false, roughDay: false };
const now = new Date("2026-09-28T10:00:00Z");

describe("welcome guide", () => {
  const fresh = normalize({ companion: { species: "firefly", name: "Glow" } });
  test("shows once on Home after the firefly is named, before any practice", () => {
    expect(welcomeDue(fresh, "/")).toBe(true);
    expect(welcomeDue(fresh, "/map")).toBe(false);
    expect(welcomeDue({ ...fresh, welcomed: true }, "/")).toBe(false);
    expect(welcomeDue({ ...fresh, companion: null }, "/")).toBe(false);
  });

  test("people who practised before it existed never see it", () => {
    expect(normalize({ companion: { species: "firefly", name: "Glow" }, records: [rec] }).welcomed).toBe(true);
    expect(normalize({ companion: { species: "firefly", name: "Glow" } }).welcomed).toBe(false);
  });
});

describe("keep your progress safe", () => {
  const s = (over: object = {}) => ({ ...normalize({ records: [rec, rec, rec], welcomed: true }), ...over });

  test("after three steps, with no recent backup", () => {
    expect(saveNudgeDue(s(), now)).toBe(true);
    expect(saveNudgeDue(s({ records: [rec, rec] }), now)).toBe(false);
  });

  test("not after a recent backup, but again once it is over 30 days old", () => {
    expect(saveNudgeDue(s({ lastBackup: "2026-09-20T10:00:00.000Z" }), now)).toBe(false);
    expect(saveNudgeDue(s({ lastBackup: "2026-08-01T10:00:00.000Z" }), now)).toBe(true);
  });

  test("never after Don't show this again, or before the welcome", () => {
    const off = s();
    expect(saveNudgeDue({ ...off, settings: { ...off.settings, saveNudgeOff: true } }, now)).toBe(false);
    expect(saveNudgeDue(s({ welcomed: false }), now)).toBe(false);
  });
});

test("quiet pages get no pop-ups", () => {
  for (const p of ["/start", "/step/class-answer", "/help", "/privacy", "/ready"]) expect(quietPage(p, "")).toBe(true);
  expect(quietPage("/", "calm=1")).toBe(true);
  expect(quietPage("/", "")).toBe(false);
  expect(quietPage("/map", "")).toBe(false);
});

describe("name question", () => {
  const base = { companion: { species: "firefly" as const, name: "Glow" }, welcomed: true, nameAsked: false };
  test("asks once on Home after the welcome guide", () => {
    expect(nameAskDue(base, "/")).toBe(true);
    expect(nameAskDue(base, "/map")).toBe(false);
    expect(nameAskDue({ ...base, welcomed: false }, "/")).toBe(false);
    expect(nameAskDue({ ...base, nameAsked: true }, "/")).toBe(false);
    expect(nameAskDue({ ...base, companion: null }, "/")).toBe(false);
  });
});

describe("natural voice offer", () => {
  const rec = { situationId: "class-answer", level: 1 as const, at: "2026-09-28T10:00:00.000Z", seconds: null, typed: false, roughDay: false };
  const base = { companion: { species: "firefly" as const, name: "Glow" }, welcomed: true, nameAsked: true, voiceOffered: false, records: [rec] };
  test("offered once on Home after a first practice and the name question", () => {
    expect(voiceOfferDue(base, "/")).toBe(true);
    expect(voiceOfferDue(base, "/me")).toBe(false);
    expect(voiceOfferDue({ ...base, records: [] }, "/")).toBe(false);
    expect(voiceOfferDue({ ...base, nameAsked: false }, "/")).toBe(false);
    expect(voiceOfferDue({ ...base, voiceOffered: true }, "/")).toBe(false);
  });
});
