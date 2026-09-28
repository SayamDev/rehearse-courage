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
 * Two small white tiles: brave days this week and courage points, each with
 * a sticker icon. Numbers are tabular so they do not jiggle as they change.
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
  const braveMain = braveDaysText.suffix.replace(/ this week$/, "");

  const tile = "flex items-center gap-3 rounded-card border-[1.5px] border-line bg-surface px-4 py-3 shadow-card";
  const disc = "flex size-11 shrink-0 items-center justify-center rounded-full border-[3px] border-die text-[#13262b] shadow-sticker";
  return (
    <div className="grid grid-cols-2 gap-3 sm:max-w-[520px]">
      <div className={tile}>
        <span aria-hidden className={`${disc} -rotate-6 bg-sun`}>
          <CalendarCheck size={22} weight="bold" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="font-display text-lg font-bold text-ink">
            <span className="tabular">{braveDaysText.count}</span>
            {braveMain}
          </span>
          <span className="text-sm text-muted">this week</span>
        </span>
      </div>
      <div className={tile}>
        <span aria-hidden className={`${disc} rotate-6 bg-accent`}>
          <Star size={22} weight="bold" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="tabular font-display text-lg font-bold text-ink">{pointsText.count}</span>
          <span className="text-sm text-muted">{pointsText.suffix.trim()}</span>
        </span>
      </div>
    </div>
  );
}
