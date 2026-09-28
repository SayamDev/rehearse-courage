import { describe, expect, test } from "vitest";
import { contactHref } from "@/lib/help";
import { checkCrisis, supportLines } from "./crisis";

describe("crisis check", () => {
  test.each([
    "I want to kill myself",
    "i want to die",
    "sometimes I think about ending it all",
    "I keep hurting myself",
    "I cut myself last night",
    "I dont want to be alive",
    "nobody would care if I was gone",
    "someone at home hits me",
    "I am thinking about suicide",
    // apostrophe normalisation
    "I don’t want to live anymore",
    // uppercase
    "I WANT TO DIE",
    // want/wanna/going/gonna die
    "I wanna die",
    "i want 2 die",
    "I'm gonna die",
    // wish dead
    "I wish I was dead",
    "i wish i were dead",
    "I wish I wasnt alive",
    // kms/kys/unalive
    "kms",
    "i want to kms",
    "kys",
    "unalive myself",
    "killmyself",
    // end it
    "I want to end it",
    "im going to end it",
    // don't want to be here / live / alive
    "I dont want to be here anymore",
    "i dont wanna live",
    "I don't wanna be alive",
    // better off without me
    "everyone would be better off without me",
    // nobody would miss me
    "nobody would miss me",
    "no one would care if i died",
    // not worth living
    "life isn't worth living",
    "no point in living",
    "what's the point of living",
    // can't go on
    "I can't go on",
    "I cant do this anymore",
    // misspellings
    "sucide",
    "suiside",
    "suicidal",
    // cutting
    "I've been cutting",
    "cutting my wrists",
    "slit my wrists",
    // overdose
    "I want to overdose",
    "take all my pills",
    // hang / jump
    "hang myself",
    "jump off a bridge",
    // abuse
    "my mum hit me",
    "my stepdad hurts me",
    "he hurts me",
    "I'm being abused",
    "I'm scared to go home",
    // regression: abuse with trailing context
    "my dad hits me in the face",
    "my dad hits me at night",
    "my mum hits me in the stomach",
    "my brother hits me at school",
    "my stepdad hurts me at home",
    "he always hurts me",
    // repeated abuse
    "she keeps hitting me",
    "he keeps hurting me",
    // want to be dead / should just die
    "i want to be dead",
    "i should just die",
    "i might as well die",
    // don't want to wake up
    "i dont want to wake up",
    "i dont want to wake up tomorrow",
    "I want to not wake up",
    // hate myself / bullied / disappear
    "i hate myself",
    "I'm being bullied",
    "i want to disappear",
    // misspellings
    "sucicide",
    "suiciide",
    "suicde",
    "suisidal",
    // cutting, re-verified after narrowing
    "I've been cutting again",
    "i keep cutting myself",
    "I started cutting last year",
    "i've been cutting and nobody knows",
    // cutting with trailing words
    "I've been cutting again lately",
    "i've been cutting again since tuesday",
    "I started cutting when I was 12",
    "I've been cutting for a year",
    // end it, re-verified after narrowing
    "ending it tonight",
    "i want to end it now",
    // past-tense abuse after a pronoun
    "he hit me",
    "she hit me yesterday",
    "they always hit me",
    "someone hurt me",
    "he punched me at school",
    "she slapped me",
    "he hit me in the face",
  ])("flags: %s", (text) => {
    expect(checkCrisis(text).crisis).toBe(true);
  });

  test.each([
    "I get so nervous I could die of embarrassment",
    "I killed it in my presentation",
    "my hands shake when I talk",
    "I blush when the teacher looks at me",
    "",
    "I'm going to die of embarrassment",
    "I'm dying to know",
    "this is killing me",
    "I want to end it on a high note",
    "I cant go on stage",
    "he beat me at chess",
    "my brother beat me at fifa",
    "my brother beat me at football",
    "I cut my hair",
    "she hurt my feelings",
    "I was going to die laughing",
    "I miss my friends",
    "reality hits me",
    "it suddenly hits me that everyone is watching",
    "the teacher touches me on the shoulder",
    "my teacher touched me on the shoulder to say well done",
    "I don't want to wake up early for the speech",
    "I keep cutting people off when I talk",
    "I started cutting my notes down",
    "been cutting corners",
    "let's end it here",
    "I wanted to end it quickly",
    "they said it hits me",
    "she says it really hurts me when I stumble",
    // cutting false alarms
    "I'm cutting class",
    "I keep cutting my speech short",
    "I've been cutting it close",
    "I keep cutting in when others talk",
    // past-tense abuse false alarms
    "they beat me in the debate",
    "someone hit me up after class",
    "he hit me with a question I didn't know",
    // subjectless keeps-hitting nerves talk
    "the nerves keep hitting me",
    "it keeps hitting me",
    "the panic keeps hitting me",
    "this feeling keeps hitting me",
    "the thought keeps hitting me",
  ])("does not flag everyday nerves: %s", (text) => {
    expect(checkCrisis(text).crisis).toBe(false);
  });
});

describe("support lines", () => {
  test("UK", () => {
    const uk = supportLines("GB");
    expect(uk.emergency).toBe("999");
    expect(uk.lines.map((l) => l.name)).toEqual(["Childline", "Samaritans", "Shout"]);
  });

  test("US uses 988", () => {
    expect(supportLines("US").lines[0].contact).toContain("988");
    expect(supportLines("US").emergency).toBe("911");
  });

  test("US includes Childhelp", () => {
    const us = supportLines("US");
    expect(us.lines.some((l) => l.name === "Childhelp" && l.contact === "Call or text 1-800-422-4453")).toBe(true);
  });

  test("NZ", () => {
    const nz = supportLines("NZ");
    expect(nz.emergency).toBe("111");
    expect(nz.lines.map((l) => l.name)).toEqual(["Need to talk?", "Youthline"]);
  });

  test("every line and text option can be tapped", () => {
    for (const country of ["GB", "IE", "US", "NZ", "CA", "AU", null]) {
      for (const l of supportLines(country).lines) {
        expect(contactHref(l.contact)).not.toBeNull();
        if (l.text) expect(contactHref(l.text)).toMatch(/^sms:\d+/);
      }
    }
  });

  test("unknown country still gets help", () => {
    const x = supportLines(null);
    expect(x.lines[0].contact).toContain("findahelpline.com");
    expect(x.emergency.length).toBeGreaterThan(0);
  });
});
