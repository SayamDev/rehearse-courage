import type { AgeBand, Words } from "./types";

/** A skipped age question is treated as under 13, the safest setting. */
export function effectiveAge(age: AgeBand | null): AgeBand {
  return age ?? "under13";
}

/** Generative AI (coach replies, sentence tidy) is only for 13 and over. */
export function aiAllowed(age: AgeBand | null): boolean {
  return effectiveAge(age) !== "under13";
}

/** Sending recorded speech to a server for transcription is only for 13 and over. */
export function serverSpeechAllowed(age: AgeBand | null): boolean {
  return effectiveAge(age) !== "under13";
}

export function words(w: Words, age: AgeBand | null): string {
  return effectiveAge(age) === "under13" ? w.kid : w.grown;
}
