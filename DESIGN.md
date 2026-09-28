# Rehearse Courage design system: Paper Lantern Map

Approved comps live in `design/comps/` (home, map, step, step-done, panic, kit, badges). 12ui's converted HTML is kept locally in `design/12ui-pages/` (git-ignored, about 80MB of embedded art) and is a starting point for Plan 3, not a spec. **The comp images are the visual authority.** This file overrides them where they break the rules below.

## Atmosphere

A floating papercraft island at the edge of night. The sky runs from deep night blue with a moon on the left to a warm sunrise on the right: the journey from scared to brave. Surfaces are torn-edge cream paper cards, like notes pinned to a map. A small firefly carries a paper lantern along a path of stepping stones that ends at the real place (the school, the park, the stage). Calm, warm, a little magical, never babyish, never loud.

- **Scene art** (islands, sky, companion) is illustration and carries the story.
- **UI** (cards, buttons, stones, nav) is flat paper and ink on top. It stays simple so the art can breathe.
- **One focus per screen.** One card, one primary action.

## Colour

One accent: lantern amber. One neutral family: warm paper plus deep night ink. No pure black or white.

| Role | Light (dawn, default) | Dark (night) | Use |
|---|---|---|---|
| `canvas` | `#F4E6CF` warm paper | `#0E2231` night | Page background below the scene |
| `surface` | `#F9EAD3` card paper | `#17344A` | Cards (torn-edge paper) |
| `surface-2` | `#EFDCC0` | `#1F4059` | Inset rows, chips, quiet fills |
| `ink` | `#113C4B` night ink | `#F9EAD3` | Headings and body |
| `muted` | `#6B5A4C` | `#B9C6CF` | Secondary text (AA on surface) |
| `line` | `#E0C9A9` | `#2C5068` | Hairlines, card edges |
| `chrome` | `#10364B` | `#0A1B27` | Bottom nav, stats pill, Need a pause |
| `on-chrome` | `#F9EAD3` | `#F9EAD3` | Text and icons on chrome |
| `amber` (accent) | `#FFAB0B` | `#FFB42E` | Primary buttons, lit stones, current nav item, glow |
| `on-amber` | `#113C4B` | `#0E2231` | Text on amber (never white) |
| `stone-dim` | `#6A8292` | `#7391A6` | Unlit stones, unearned badge outlines |
| `focus` | `#1F6FD1` | `#7FB7FF` | Focus rings only |
| `calm` | `#3E7C6B` | `#7CC4AE` | Grounding and body-kit tint (sparingly) |

Rules: amber is the only button colour and the only glow. Unlit stones and unearned badges are soft outlines in `stone-dim`, never padlocks, never "locked". Body-kit tiles may use a soft tint from their own illustration, but chips and text stay in the neutral family.

## Typography

- **Display:** Bricolage Grotesque 700 to 800, tracking -0.02em, sentence case. H1 `clamp(1.75rem, 1.2rem + 2vw, 2.75rem)`; card title `clamp(1.5rem, 1.1rem + 1.4vw, 2.1rem)`.
- **Body:** Atkinson Hyperlegible Next 400 and 600, 17px minimum (18px on phones), line-height 1.55, measure 60ch max.
- **Numbers:** tabular numerals for points and step counts.
- Text-size setting scales the root size (100%, 115%, 130%). Nothing is fixed in px except hairlines.

## Shape and elevation

- Cards: torn-paper edge (SVG mask on the card, not a hand-drawn illustration), radius 20px under the tear, one soft warm shadow `0 10px 24px -14px rgb(17 60 75 / 0.35)`.
- Buttons and pills: fully rounded. Primary height 52px (touch 48px minimum).
- Stones: 44px round coins with a numeral; lit = amber with a soft outer glow; current = amber with a slow pulse ring; unlit = `stone-dim` outline.
- Badges: die-cut stickers with a white 4px outline (Rehearse lineage). Earned in colour, unearned as `stone-dim` line art.
- Elevation: cards use shadow; chrome uses no shadow; nothing uses both border and shadow.

## Layout

- **Phone (below 768px):** scene art on top (about 45% of the viewport), card overlapping the art's lower edge, stats pill under the card, bottom nav fixed. Need a pause floats above the nav, bottom right.
- **Laptop (768px and up):** the same stack, centred, max width 1100px, with the island art wider. There's no side-by-side split: one focus per screen on every size.
- Bottom nav: Home, Map, Kit, Badges, Me. The current item is amber with an underline, not colour alone.
- Header: "Rehearse Courage" plus "a Rehearse project, by Sayam Ajmal" on Home only; other screens get a back arrow and the screen title.
- Need a pause is reachable on every screen, including first visit, and never covers the primary button.

## Components

- `SceneHeader`: illustrated island for the screen (home, map, room, step, kit, badges, panic), with a solid colour fallback while loading.
- `PaperCard`: torn-edge card, one title, optional muted line, one primary action.
- `PathStones`: 5 stones plus the destination building as step 6 (school, park bench, stage). Stones are HTML buttons over the art, drawn from ladder progress, never baked into images. The destination lights up when step 6 is done.
- `StatsPill`: brave days this week and courage points, on chrome.
- `PanicButton`: chrome pill, shield icon, "Need a pause".
- `SpeakButton`: large round amber button "Hold to speak" (tap to start and stop too, for motor needs), with "Type instead" as an equal-size secondary button.
- `RoughDaySwitch`: a real switch labelled "I'm having a rough day", separate from the answer options.
- `IdeaList`: things you could say, as selectable rows (they are ideas, not a quiz).
- `Sticker`: die-cut badge.
- `ToolTile`: body-kit tile with round illustration, title, one line, and a "Helps when..." chip.

## Motion

Breath-paced and calm. MOTION dial 4.

- Durations: 180ms for feedback, 320ms for UI, 600 to 900ms for scene changes. Ease `cubic-bezier(0.16, 1, 0.3, 1)`.
- Signature moment: when a step completes, the companion's lantern brightens, the new stone lights up, and the sky warms a step towards dawn (map light from `mapLight()`).
- Need a pause: the lantern grows over 4s (in) and shrinks over 6s (out), and nothing else moves.
- Current stone: a slow 3s pulse ring.
- Reduced motion (system or setting): every animation shows its end frame. No loops, no parallax.
- Lottie assets (Plan 6): firefly stages (hiding, peeking, waving, speaking), idle, cheer, sit-with-me, breathing lantern, badge press.

## Copy in the UI

Plain, kind, short. No em or en dashes, no exclamation marks in success messages, no "Oops", no "You've got this" or "calm down". Celebrate the attempt ("You had a go. That took courage.").

## Anti-patterns (never)

- Padlocks, "locked", countdowns or streak-loss warnings.
- Fluency, filler or pace scores.
- More than one amber button per screen.
- Text over busy art without a solid card behind it.
- Emoji as icons (Phosphor Regular only).
- Numbers baked into illustrations.
