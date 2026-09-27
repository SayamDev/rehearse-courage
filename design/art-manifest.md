# Art manifest — Plan 3, Task 1 (Paper Lantern Map scene art)

Status: **BLOCKED** partway through. Only one asset could be generated before the 12ui
hosted image wallet ran out (see Gaps below). The remaining 17 files listed in the
task brief were not produced and are not committed.

## Generated

| File | 12ui run dir | Candidate chosen | Why | Size |
|---|---|---|---|---|
| `public/art/home-class.webp` | `/var/folders/3j/0l959hg92195wz97qd1k10rm0000gn/T/12ui-class-island-floating-papercraft-BCI8nV` (run `crt-16384fe4eba241a69a4decb2ad94be72bdd0ec17`) | B | Cleaner, more centred composition than A (school roughly centred over the island, path reads clearly from bottom edge to the door, waterfall and island silhouette match `design/comps/home.jpg` framing more closely). Both candidates passed the hard checks: no text, no numbers used as UI, no UI chrome, no stones, no creatures, empty dirt path ending at the school door, dusk (moon, left) to dawn (sun, right) sky, lower third left as calm cloud/paper space. The school building has a small clock face on its gable, matching the same detail present in the approved `home.jpg` comp itself, so it was treated as part of the comp's own style rather than a baked-in UI number. | 296 KB (under the 400 KB scene budget) |

Rejected candidate: **A** (same run) — kept as a viable backup but not chosen; composition pushes the school slightly right of centre and the path curve is less legible at small sizes than B. Not deleted from the run's temp candidates dir, but not copied into the repo.

Reference used: `--reference design/comps/home.jpg --retain style`, `--aspect landscape`, `--candidates 2`.

Conversion: `npx -y sharp-cli -i <candidate>.png -o public/art/home-class.webp --format webp --quality 78 resize 2400`.

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

### Not yet generated (blocked by the above)

Scenes / banners (landscape, `--reference design/comps/<comp>.jpg --retain style`):
- `public/art/map.webp` — draft dispatched, then failed before any candidate was produced (no cost incurred, no usable output)
- `public/art/room-friends.webp`
- `public/art/room-presenting.webp`
- `public/art/step-class.webp`
- `public/art/panic.webp`
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

Body-kit tiles (square, 320px, `--reference design/comps/kit.jpg --retain style`):
- `public/art/kit/breathing.webp`
- `public/art/kit/grounding.webp`
- `public/art/kit/blushing.webp`
- `public/art/kit/sweating.webp`
- `public/art/kit/rescue.webp`
- `public/art/kit/frames.webp`

## Next steps once the wallet is funded

Re-run the remaining `12ui draft --reference design/comps/<comp>.jpg --retain style
--candidates 2` calls per the brief's per-asset concepts, `12ui next <run-dir> --wait`
to download, inspect every candidate against the hard checks (no text, no numbers,
no UI, no numbered stones, no firefly in scene art except the classroom's animal
classmates/teacher from `step.jpg`, plain empty path to the destination, calm lower
third), convert the chosen candidates with `sharp-cli` (scenes: max 2400px wide,
quality 78, under 400 KB; tiles: 320px), and extend this manifest with each new
entry before amending the commit or adding a follow-up commit.
