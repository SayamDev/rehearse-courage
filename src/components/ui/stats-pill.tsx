import { CalendarCheck, Star } from "@phosphor-icons/react";

/** "1 brave day this week" / "3 brave days this week". */
export function braveDaysLabel(n: number): string {
  return `${n} brave day${n === 1 ? "" : "s"} this week`;
}

/** "1 courage point" / "145 courage points". */
export function pointsLabel(n: number): string {
  return `${n} courage point${n === 1 ? "" : "s"}`;
}

/**
 * Chrome pill showing brave days this week and courage points, matching
 * the stats row on the home comp. Numbers are tabular so the pill does not
 * jiggle as they change.
 */
export function StatsPill({ braveDays, points }: { braveDays: number; points: number }) {
  return (
    <div className="inline-flex items-stretch divide-x divide-on-chrome/15 overflow-hidden rounded-full bg-chrome text-on-chrome">
      <span className="flex items-center gap-2 px-4 py-2.5">
        <CalendarCheck size={22} weight="regular" aria-hidden className="text-amber" />
        <span className="text-sm leading-tight">
          <span className="tabular font-semibold">{braveDays}</span>{" "}
          <span className="text-on-chrome/85">{braveDays === 1 ? "brave day" : "brave days"} this week</span>
        </span>
      </span>
      <span className="flex items-center gap-2 px-4 py-2.5">
        <Star size={22} weight="regular" aria-hidden className="text-amber" />
        <span className="text-sm leading-tight">
          <span className="tabular font-semibold">{points}</span>{" "}
          <span className="text-on-chrome/85">{points === 1 ? "courage point" : "courage points"}</span>
        </span>
      </span>
    </div>
  );
}
