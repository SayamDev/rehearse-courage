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
/**
 * Splits a "<n> ...suffix" label (as returned by braveDaysLabel/pointsLabel)
 * into the number and the rest, so the number alone can get tabular
 * styling without re-deriving the pluralised copy in the component.
 */
function splitCount(label: string, n: number): { count: string; suffix: string } {
  const count = String(n);
  return { count, suffix: label.slice(count.length) };
}

export function StatsPill({ braveDays, points }: { braveDays: number; points: number }) {
  const braveDaysText = splitCount(braveDaysLabel(braveDays), braveDays);
  const pointsText = splitCount(pointsLabel(points), points);

  return (
    <div className="inline-flex items-stretch divide-x divide-on-chrome/15 overflow-hidden rounded-full bg-chrome text-on-chrome">
      <span className="flex items-center gap-2 px-4 py-2.5">
        <CalendarCheck size={22} weight="regular" aria-hidden className="text-amber" />
        <span className="text-sm leading-tight">
          <span className="tabular font-semibold">{braveDaysText.count}</span>
          <span className="text-on-chrome/85">{braveDaysText.suffix}</span>
        </span>
      </span>
      <span className="flex items-center gap-2 px-4 py-2.5">
        <Star size={22} weight="regular" aria-hidden className="text-amber" />
        <span className="text-sm leading-tight">
          <span className="tabular font-semibold">{pointsText.count}</span>
          <span className="text-on-chrome/85">{pointsText.suffix}</span>
        </span>
      </span>
    </div>
  );
}
