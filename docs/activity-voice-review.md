# Activity voice review — 7 October 2026

The games and Body kit previously shared the room narrator's delivery. They now use stable recorded Kokoro voices with separate delivery settings for calm guidance, friendly questions and everyday sentence examples. There are 388 distinct activity clips covering both British and American English and the child/adult wordings. No model download is needed to hear these fixed lines.

| Activity | Delivery and interaction checked |
| --- | --- |
| Breathing | Softer voice at 0.88 speed, comfortable introductory guidance, explicit Start/Pause, introduction finishes before the 4/6-second cycle. Three guided breaths then quiet. Reduced motion keeps the light still while cues continue. |
| Breath balloon | Same calm guide. Short inhale/exhale cues; the full-balloon hint stays on screen without interrupting speech. A breath counts after the balloon empties, including the fifth breath before completion. Pointer cancellation, lost capture and keyboard blur release the hold. |
| Hot seat | Friendly questions, only after the spin settles. |
| Story dice | Everyday story starters. Rolling again stops an old starter even when the same wording comes up. |
| Rescue snap | A friendly explanation of the situation. Next moment stops the old prompt. |
| Word builder | An everyday model sentence once the puzzle is complete. |
| Say it like | An everyday reference voice. The caption clarifies that the learner makes it their own; the recording does not perform the chosen style. |
| Describe it | Friendly questions that help with describing. Changing the picture stops an old hint. |
| Keep it going | A consistent conversational friend, with everyday examples for possible replies. |
| Grounding | Calm instructions that include the number and sense, rather than examples alone. |
| Blushing / sweating | Calm explanations and cards; each card has its own playback ownership. |
| Rescue phrases | Everyday sentence examples. |
| Sentence frames | Everyday delivery for filled sentences, using the saved on-device model or device fallback. User-written sentences cannot have fixed recordings. |
| Speech tools | Calm explanations and everyday word examples. One ambiguous short example became “Only one, please.” |

Recorded WAVs are attenuated before AAC encoding to -20 dB active-speech RMS for calm guidance and -18 dB for other lines, with peak headroom. Playback preserves pitch. The existing child pace and slower-voice setting still apply.

Playback cancellation now resolves interrupted recordings and utterances. Disappearing cards only stop their own line. Hear it waits for saved settings to hydrate. The device fallback sets en-GB/en-US and briefly waits for the device voice inventory; an unavailable or broken recording can still fall back. A stalled recording startup has an eight-second fallback timeout.

## Verification

- 503 unit tests; type check, ESLint and diff check.
- Production build.
- All eight games in both accents and both age wordings on phone and laptop; existing coach/settings/voice-offer checks (24 browser tests).
- Body-kit recording checks in both accents (2 browser tests), plus the existing game interactions (9 browser tests).
- 76 accessibility scans across light and dark pages.
- Every activity clip decoded, level measured and transcribed locally. Maximum decoded peak: 0.811. No silent or missing activity recording.
- Breathing cues fit the phase even at the slowest combination of child/slower settings: longest inhale 3.10 seconds within 4, longest exhale 2.79 within 6.
- A second cached local recognizer checked five ambiguous short transcriptions. Four matched their intended wording; the remaining phrase was rewritten and re-recorded, then matched in both accents.

## Listening review remains required

Automated checks assess coverage, wording, levels and playback. They cannot establish that an accent or emotional delivery feels reassuring to a person. The local listening pack includes a 35-second breathing demonstration for each accent, and activity/age/accent/slower controls for the actual replacement clips. Listen to these before merging and deploying.

Browser fallback voices vary by device. The on-device Kokoro fallback retains the selected activity voice and pace when available. Room-character recordings remain on their existing Qwen cast.
