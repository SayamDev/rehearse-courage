# Rehearse Courage design system: Sticker Book, calm teal

Rehearse's sibling. Same Sticker Book language (near-white canvas, white cards, die-cut stickers, bold Bricolage headings), with one calm teal accent instead of Rehearse's tomato. Suitable for kids, teenagers and adults: clean and professional, warm but never childish.

## Atmosphere

A tidy sticker book on a desk. Most of the screen is quiet white space and plain text; colour comes from a few small stickers (labels, icon discs, badges) and one teal action per screen. No painted scenery: the only pictures are the firefly companion, the Body kit tool pictures and the badges. Motion comes from small Lottie animations.

## Colour

Tokens live in `src/app/globals.css` (light, and dark via system or `data-theme`).

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--canvas` | #f2f6f5 | #0f1b1e | Page background |
| `--surface` | #ffffff | #172629 | Cards |
| `--surface-2` | #e8f0ef | #213438 | Quiet fills, dim track dots |
| `--ink` | #13262b | #eaf4f3 | Text |
| `--muted` | #4c6166 | #a7bbbd | Secondary text |
| `--line` | #d4e1df | #2d4549 | Borders |
| `--accent` | #2ec4b6 | #3dd6c6 | The one action, progress, rewards (ink text on it) |
| `--accent-text` | #0e7268 | #5fe3d4 | Teal as text or icons on white |
| `--help` / `--calm` | #2f6fae | #8cc3f5 | Need a pause and calm tools, never teal |
| `--die` | #ffffff | #f7fbfb | Sticker die-cut borders |
| Sticker inks | sun #ffc83d, sky #7cc4ff, grape #b8a4ff, coral #ff8a6b, lime #b8e62e | same | Room labels, icon discs; always ink text |

Rooms: class = sky, friends = grape, presenting = coral, out and about = lime.

## Typography

Bricolage Grotesque (700 to 750) for headings, buttons and stickers; Atkinson Hyperlegible Next for body (17px, 18px on phones). Headings balance, paragraphs wrap pretty. Tabular numbers wherever a number changes.

## Shape and elevation

Cards: 20px radius, 1.5px `--line` border, one soft shadow (`--card-shadow`). Controls: 14px radius. Stickers: pill or circle, 3px white die border, `--sticker-shadow`, a slight tilt (-6 to 2 degrees). No torn edges, no glass except the sticky top bar.

## Layout

Top bar on every page: teal sticker wordmark, section links from 768px, Need a pause in the right corner (never floating over content). Phone: bottom tabs, the active icon in a small teal sticker. Content column max 1100px (720px for reading pages, 640px for a practice step). Home on laptops: today's card left, the companion right.

## Components

- `PaperCard`: the white card.
- `Button`: primary is a teal sticker button (one per screen); secondary is white with a 2px line border.
- `ProgressTrack`: the six steps of a situation as numbered dots joined by a line (done = teal sticker, current = teal ring, later = grey, step 6 = a flag). Buttons on the room screen.
- `Companion`: the painted firefly still in a round die-cut frame, with a soft sun glow that grows with courage.
- `ArtHeader`: page title, short line, optional Lottie beside it.
- Need a pause: a soft blue pill with the pause mark (a dot in two rings, the shape of the breathing circle it opens). The pause screen is tinted blue, with the breathing circle (rings, a growing fill and a gentle count) and three next options.
- Body kit: two groups ("Calm your body", "Find your words"), each tool a tile with a sticker icon and how long it takes. Tools are hands-on: grounding counts what you notice, rescue phrases can be starred and heard back, sentence frames have inline gaps, speech tools have a practice word, a pacer or a gentle-start bar. `SayAndListen` records to memory only, to listen back.
- `Lottie`: plays `public/lottie/*.json`, built by `scripts/lottie/build.mjs` and checked in the Skottie player.
- `LevelMeter` / `LevelSticker`: the courage level as a number in a teal die-cut sticker, "Level 4: Lantern", and a bar that only fills. Home (side card, and under the greeting on phones), Me, the journey page and the step-done card when a new level is reached.
- `DareCard`: today's tiny dare on Home, a sun sticker with a lightning icon, secondary buttons only (the step card keeps the one teal button).
- `ShareButton`: opens "Share it", a square picture drawn on a canvas on the device (always the light palette: white card, teal wordmark sticker, the badge, level number or icon in a round die-cut, title in Bricolage). Add my name is off by default.
- Badges without painted art yet: a bold Phosphor icon on a sticker ink, in the same round die-cut (`BADGE_ICON` in `sticker.tsx`).
- Journey (`/journey`): level card, four stat stickers, proud moments, a lantern calendar (brave days are teal stickers; other days are plain, never marked as missed), newest badges.
- Right before (`/ready`): one screen at a time with a four-part progress bar, like a step.
- Print: `@media print` in `globals.css` prints light on white with no top bar or tabs (`data-no-print` hides chrome); `/for-adults` has a Print button.

## Motion

- Lottie, built in code by `scripts/lottie/build.mjs`, verified in the Skottie player. Type in Lottie is real Bricolage Grotesque turned into vector paths at build time (`scripts/lottie/type.mjs`, fontkit), so every letter can move on its own and no font loads at runtime. Pieces with type have a `-dark.json` twin.
  - `welcome`: first visit, "Speak up, / one small step / at a time." rising in, a sun sweep behind "small".
  - `courage`: step done, a teal check pops, then "That took courage." stamps in letter by letter with a sun underline.
  - `ladder` / `ladder-tall`: Map, the six steps as rising blocks (a diagonal staircase on phones), with a lantern hopping to the top.
  - `badges`: Badges header, a swaying medal with sparkles. `firefly`, `step-done`, `kit`: spare.
- Lottie starts when half of it is on screen, plays once (loops only where noted).
- UI: 180 to 240ms ease-out; hover lifts a sticker by a pixel.
- Reduced motion (device or Me): every Lottie shows its last frame and nothing loops.

## Copy in the UI

Plain, kind, short. No em or en dashes, no exclamation marks in success messages, no "Oops", no "You've got this" or "calm down". Celebrate the attempt ("You had a go. That took courage.").

## Anti-patterns (never)

- Padlocks, "locked", countdowns or streak-loss warnings.
- Fluency, filler or pace scores.
- More than one teal button per screen.
- Painted scenery or full-bleed art behind text.
- Emoji as icons (Phosphor only).
- Numbers baked into illustrations.
