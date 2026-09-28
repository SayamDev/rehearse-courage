# Art manifest — Plan 3, Task 1 (Paper Lantern Map scene art)

Status: **DONE** (2026-09-28 batch below fills every gap the app uses). The
history below is kept for provenance; the older status text follows.

## Still needed: ten newer badges (added 2026-09-28, after the batch below)

These badges show a bold Phosphor icon on a sticker ink until they are
painted (`BADGE_ICON` in `src/components/ui/sticker.tsx`; add the id to
`ART_IDS` there once `public/art/badges/<id>.webp` exists). Same coin style
as the others, no baked tick, no text or numbers (the brave-day counts are
in the title, never on the coin), circular mask, 320px WebP.

| Badge id | Title | Idea for the coin |
|---|---|---|
| `tiny-dare` | Tiny dare | A small lightning spark |
| `dare-collector` | Dare collector | A handful of sparks or stars |
| `ready-steady` | Ready, steady | A paper rocket on a launch pad |
| `not-yet` | Not yet counts | A seedling sprouting |
| `proud-moment` | Proud moment | A heart with a small flag |
| `game-explorer` | Game explorer | A game controller or dice |
| `brave-3` | Three brave days | Three small lanterns |
| `brave-7` | Seven brave days | A string of lanterns |
| `brave-30` | Thirty brave days | A lantern-lit path |
| `brave-100` | A hundred brave days | A sunrise over lanterns |

## 2026-09-28 batch (12ui free allowance, $0 charged)

Seven `12ui draft` runs, 15 candidates in total, all on the daily free allowance
(`12ui spend` shows $0.00). Every candidate was inspected at full size against the
hard checks (no text, numbers, UI or stones baked in; plain empty dirt path; no
firefly or creatures in scene art; calm lower third). Run dirs are temp
(`/var/folders/.../T/12ui-*`) and not kept.

| File | Run concept / reference | Pick | Why | Notes |
|---|---|---|---|---|
| `room-friends.webp` | Park island (oak, picnic table, gazebo), ref `home-class` | A | Longer, clearer path from island edge to gazebo | 1536x1024, 192 KB. Stones measured with a percent grid |
| `room-presenting.webp` | Open-air stage with benches, ref `home-class` | A | Path ends cleanly at the stage steps; bigger island | 1536x1024, 199 KB |
| `step-class.webp` | Outdoor classroom, animal classmates, blank chalkboard, ref `step.jpg` | A | Blank board, leftmost desk left empty, calm lower half | 1536x1024, 165 KB. Used by the step banner (`crop="step"`) |
| `header-kit.webp` | Wide banner, lantern on a mossy boulder, ref `kit.jpg` | A | Open night sky on the left for the title | Cropped to a 1536x600 strip with the lantern about 42% down |
| `header-badges.webp` | Wide banner, backpack and lantern on a cliff, ref `badges.jpg` | A | Same reason | 1536x600 strip |
| `firefly/{hiding,peeking,waving,speaking}.webp` | 2x2 character sheet on flat `#F4E6CF`, ref `kit/breathing` | B (of 3) | Clearest progression; speaking pose distinct | Cropped per quadrant to 384px squares. Kept on the flat cream ground (the pale wings are too close to it to key out cleanly); the Companion frame is round, like the kit tiles |
| `badges/{first-words,hand-up}.webp` | 4x2 coin sheet, ref `said-anyway` | A | More detail, matches the existing coins | Replace the old art that had a baked tick |
| `badges/{typed-first,rescue-ready,room-explorer,my-own-step,then-and-now,dawn}.webp` | Same sheet | A | | Circular mask, transparent corners, 320px |

Code: `SCENES.friends` / `presenting` now use the room art (the `provisional`
flag is gone), `SCENES.class.step` points at the classroom, Companion uses the
stills, every badge has art, Kit and Badges pass their headers to `ArtHeader`.

Still open (not used by any screen as a gap): `map.webp` single composite (the
map uses the layered `sky-map` + `island-*` set), and the map island cutouts
still have 6 blank ring stones baked in (map cards only, no numbers drawn on
them). Hedgehog and fox art wait for Plan 6.

## Earlier status (2026-09-27)

Status then: **DONE_WITH_CONCERNS**. 12ui hosted generation is still blocked on a prepaid
wallet balance (free allowance resets 2026-09-28T00:00Z; do not retry generation or
top up before then). Coverage was extended in the meantime by harvesting unused
layers already extracted from earlier 12ui page conversions in the scratchpad
(`/private/tmp/claude-501/-Users-chaimaenfif/91fc7fa4-b1a8-4da3-8f9b-7812873ebe47/scratchpad/assets/`).
Several assets from the original file list are still missing; see "Still needed
after reset" at the end.

## Generated

| File | 12ui run dir | Candidate chosen | Why | Size |
|---|---|---|---|---|
| `public/art/home-class.webp` | `/var/folders/3j/0l959hg92195wz97qd1k10rm0000gn/T/12ui-class-island-floating-papercraft-BCI8nV` (run `crt-16384fe4eba241a69a4decb2ad94be72bdd0ec17`) | B | Cleaner, more centred composition than A (school roughly centred over the island, path reads clearly from bottom edge to the door, waterfall and island silhouette match `design/comps/home.jpg` framing more closely). Both candidates passed the hard checks: no text, no numbers used as UI, no UI chrome, no stones, no creatures, empty dirt path ending at the school door, dusk (moon, left) to dawn (sun, right) sky, lower third left as calm cloud/paper space. The school building has a small clock face on its gable, matching the same detail present in the approved `home.jpg` comp itself, so it was treated as part of the comp's own style rather than a baked-in UI number. | 296 KB (under the 400 KB scene budget) |

Rejected candidate: **A** (same run) — kept as a viable backup but not chosen; composition pushes the school slightly right of centre and the path curve is less legible at small sizes than B. Not deleted from the run's temp candidates dir, but not copied into the repo.

Reference used: `--reference design/comps/home.jpg --retain style`, `--aspect landscape`, `--candidates 2`.

Conversion: `npx -y sharp-cli -i <candidate>.png -o public/art/home-class.webp --format webp --quality 78 resize 2400`.

## Harvested from earlier 12ui page-conversion layers (no new generation)

Source directory: `/private/tmp/claude-501/-Users-chaimaenfif/91fc7fa4-b1a8-4da3-8f9b-7812873ebe47/scratchpad/assets/` (PNG layers extracted from earlier 12ui `convert` runs of the comp pages; `thumbs/` holds downscaled previews). Every file below was inspected at full resolution (or up to 1400px) before acceptance; only layers with no text, no numbers, no UI chrome, and (for scene/sky art) no firefly or other creature were kept. Converted with `npx -y sharp-cli -i <src>.png -o <dest>.webp --format webp --quality 78 resize 2400` (scenes/sky/islands/panic) or `--quality 82 resize 320` (kit tiles, badges).

| File | Source | Notes |
|---|---|---|
| `public/art/panic.webp` | `p0-home-a-0.png` | Quiet dusk-to-dawn hill, moon left / sun right, rocks and flowers, empty calm lower third. No firefly, no UI, no text. Fulfils the original `panic.webp` slot directly. 315 KB. |
| `public/art/sky-home.webp` | `p2-practice-step-0.png` | Clean dusk-to-dawn sky/cloud backdrop with a small distant island cluster, no foreground island, no creatures/UI. New layered-background asset (not in the original Task 1 file list; added per coordinator instruction so a sky layer exists behind `home-class.webp`/`step-class.webp`). 169 KB. |
| `public/art/sky-map.webp` | `p1-courage-map-0.png` | Sea/sky backdrop with small distant islands and sailboats, no UI/text. New layered-background asset for the map screen. 219 KB. |
| `public/art/island-class.webp` | `p1-courage-map-1.png` | Class island cutout (school, flag, waterfall) with the path's 6 stepping stones **blank/unnumbered** — acceptable per instruction since the app draws numbered stones on top. No text, no firefly. New asset (island cutout, layered under UI stones). 204 KB. |
| `public/art/island-friends.webp` | `p1-courage-map-2.png` | Friends island cutout (house), same blank-stone path, no text/creatures. 243 KB. |
| `public/art/island-presenting.webp` | `p1-courage-map-3.png` | Presenting island cutout (small stage with steps), same blank-stone path, no text/creatures, sailboat visible on the water in the background (acceptable, not a UI element). 231 KB. |

Rejected from this harvest (checked, then excluded):
- `p0-home-0.png` — otherwise-matching Class island but has **numbered** stones (1,2,3,5,6) baked in and includes the firefly; fails the hard checks.
- `p2-practice-step-d-0.png` and `p2-practice-step-1.png` — island/classroom art but a firefly and/or a UI card (rough-day switch) is baked into the frame.
- `p1-courage-map-4/5`, `p2-practice-step-1`, `p2-practice-step-d-1..3`, `p3-body-kit-0/1/2/3/7/11`, `p4-badges-0` — UI chrome, icons, glitched renders, or full scene composites with baked UI; excluded.
- `p0-home-a-1..5` — UI icons (shield, lungs, eye, people) and a full-body firefly-on-rock render without a flat/canvas background; excluded (none map to a Task 1 filename).
- `p4-badges-1` — a firefly-with-backpack illustration; not a badge and not one of the four firefly-still poses in the brief (its background is a natural scene, not flat), so left out.

### Body-kit tiles (fills the original `kit/*.webp` slots)

| File | Source | Notes |
|---|---|---|
| `public/art/kit/breathing.webp` | `p3-body-kit-4.png` | Firefly exhaling a calming breath, round tile, transparent background. 21 KB. |
| `public/art/kit/grounding.webp` | `p3-body-kit-5.png` | Hand pressed on a mossy stone, round tile, transparent background. 22 KB. |
| `public/art/kit/blushing.webp` | `p3-body-kit-6.png` | Firefly with a flushed/blushing face, round tile, transparent background. 18 KB. |
| `public/art/kit/sweating.webp` | `p3-body-kit-8.png` | Water droplets, round tile, transparent background. 40 KB. |
| `public/art/kit/rescue.webp` | `p3-body-kit-9.png` | Blank amber speech-bubble shape (no phrase text), round tile — closest available match for "Rescue phrases"; abstract but passes the no-text/no-number check. 10 KB. |
| `public/art/kit/frames.webp` | `p3-body-kit-10.png` | Spiral notepad (blank ruled lines, no text) and pencil, round tile — matches "Sentence frames". 7 KB. |

### Badges (new: `public/art/badges/*.webp`, not in the original Task 1 file list, added per coordinator instruction)

| File | Source | Matched by |
|---|---|---|
| `public/art/badges/first-words.webp` | `p4-badges-2.png` | Two speech bubbles + checkmark, matches "First words" in `badges.jpg`. 17 KB. |
| `public/art/badges/hand-up.webp` | `p4-badges-3.png` | Raised hand + checkmark, matches "Hand up". 16 KB. |
| `public/art/badges/said-anyway.webp` | `p4-badges-4.png` | Megaphone, muted/unearned line-art style, matches "Said it anyway" (shown unearned in the comp too). 34 KB. |
| `public/art/badges/back-again.webp` | `p4-badges-5.png` | Winding path with mountains, muted style, matches "Back again". 17 KB. |
| `public/art/badges/out-in-the-wild.webp` | `p4-badges-6.png` | Cityscape with sailboats, matches "Out in the wild". 13 KB. |
| `public/art/badges/calm-captain.webp` | `p4-badges-7.png` | Ship's wheel, matches "Calm captain". 37 KB. |

All six are icon-on-coin art with no text or numbers baked in.

## Gap: generation blocked after asset 1 of 18

Immediately after the first `12ui draft` call settled, every subsequent `12ui draft`
call (including a 2-candidate dispatch for `map.webp` and a minimal 2-candidate smoke
test) failed at the "retrieving corpus references" stage with:

> stopped: draft in Ns — The free generation allowance is used up and the prepaid
> wallet needs more balance.

`12ui auth status` still shows healthy per-bucket rate-limit headroom (e.g.
`image_standard: 13/20 remaining`), so this is a **prepaid wallet / billing** block,
not a rate limit — retrying, waiting, or using fewer candidates does not clear it
(`--candidates` also has a hard minimum of 2, so there is no cheaper single-image
fallback). Topping up the wallet is a financial action outside what this task is
authorized to do; the account owner needs to add balance (or wait for whatever
free-allowance reset `12ui auth status` reports) before the rest of this task can
proceed.

### Still needed after reset

`panic.webp` and all six `kit/*.webp` files are now filled (harvested above), so
they are removed from this list. Remaining, still not produced by any method:

Scenes / banners (landscape, `--reference design/comps/<comp>.jpg --retain style`):
- `public/art/map.webp` — the original single-image three-island composite; draft was dispatched once, then failed before any candidate was produced (no cost incurred, no usable output). `island-class.webp` / `island-friends.webp` / `island-presenting.webp` plus `sky-map.webp` are a harvested layered stand-in but are new filenames, not this one — `src/lib/scenes.ts` (Task 4) needs to decide whether it wants the composite or the layered set.
- `public/art/room-friends.webp`
- `public/art/room-presenting.webp`
- `public/art/step-class.webp`
- `public/art/header-kit.webp`
- `public/art/header-badges.webp`

Firefly stills (square, flat background, no background-removal tool available in
this environment — per the brief's fallback these would need to be generated on a
flat background colour-matched to `--canvas` (`#F4E6CF` light / `#0E2231` dark) and
flagged as a transparency gap for Plan 6 even once generation is unblocked):
- `public/art/firefly/hiding.webp`
- `public/art/firefly/peeking.webp`
- `public/art/firefly/waving.webp`
- `public/art/firefly/speaking.webp`

(Body-kit tiles are no longer in this list — all six are filled by the harvest above.)

## Next steps once the wallet is funded

Re-run the remaining `12ui draft --reference design/comps/<comp>.jpg --retain style
--candidates 2` calls per the brief's per-asset concepts, `12ui next <run-dir> --wait`
to download, inspect every candidate against the hard checks (no text, no numbers,
no UI, no numbered stones, no firefly in scene art except the classroom's animal
classmates/teacher from `step.jpg`, plain empty path to the destination, calm lower
third), convert the chosen candidates with `sharp-cli` (scenes: max 2400px wide,
quality 78, under 400 KB; tiles: 320px), and extend this manifest with each new
entry before amending the commit or adding a follow-up commit.
