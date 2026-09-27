# Deferred from Plan 1

Findings from the Plan 1 reviews that belong in later plans. Pick these up when writing Plan 3 (screens).

## Plan 3 (screens and store wiring)

- **Custom steps and rooms:** records against `custom-…` ids have no room, so they never count for "Hand up" or "Room explorer", and are ignored by `suggestNext`/`mapLight`. Give `BadgeInput` a room lookup built from situations plus `customSteps`.
- **Two tabs:** `store.ts` has no `storage` event listener; a stale tab can overwrite newer progress and drop badges. Listen for `storage`, reload, and union `earned` on save.
- **One-time welcome back:** `cameBack` stays true forever. Have `visit` also return whether this visit is a return (gap of 7+ days) so the UI shows "welcome back" once.
- **`ActionResult` type:** export the action result type from `state.ts` and use it in `store.ts` instead of restating it.
- **Crisis screen:** must be gentle, with "not what you meant? carry on". Run `checkCrisis` on all typed or transcribed text (including under 13), not only before AI. Accepted over-flags include "I hate myself when I stutter", "I want to disappear", "cut myself a slice of cake".
- **Tests:** store hydration and `act` (jsdom or Playwright), badge boundary counts (9/10 kit, 4/5 rescue), a DST-boundary date test, backup import of JSON `null` and wrong `app`.
- **Quests:** at most one quest per kind per day if the UI shows three.

## Plan 2 (design and copy pass)

- Rough-day bonus applies to any step (typed or level 1), while "Said it anyway" needs speaking. Copy must not promise the bonus is "for speaking".
- Optional: set `turbopack.root` in `next.config.ts` to silence the stray lockfile warning.

## Maker

- Deploy: `npx wrangler login`, then `npm run cf:deploy`.
- Commits 1167364 and a245486 carry `Co-Authored-By: Claude Haiku 4.5` instead of Opus 5.5 (history rewrite needs your OK).
- Before launch: re-check every support line number in `src/lib/safety/crisis.ts` against the official sites.
