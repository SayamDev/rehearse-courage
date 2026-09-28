/**
 * The Need a pause mark: a small breathing circle (a dot inside two soft
 * rings), the same shape as the breathing circle the button opens. Drawn
 * with circles only; decorative.
 */
export function PauseMark({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.75" opacity="0.65" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" />
    </svg>
  );
}
