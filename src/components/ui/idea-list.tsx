"use client";

import { useId } from "react";

/**
 * A radio group of "things you could say" options, styled as pill rows
 * with a leading circle, matching the practice-step comp. Native radio
 * inputs keep keyboard and screen reader behaviour correct for free.
 */
export function IdeaList({
  ideas,
  value,
  onChange,
  label = "Here are a few things you could say",
}: {
  ideas: string[];
  value: string | null;
  onChange: (idea: string) => void;
  label?: string;
}) {
  const name = useId();

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm text-muted">{label}</legend>
      {ideas.map((idea) => {
        const checked = idea === value;
        return (
          <label
            key={idea}
            className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-full border px-4 py-2.5 transition-colors duration-[var(--dur-ui)] ease-[var(--ease-out)] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-[var(--focus)] has-[:focus-visible]:outline-offset-3 ${
              checked ? "border-transparent bg-surface-2 text-ink" : "border-line bg-surface text-ink hover:bg-surface-2/60"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={idea}
              checked={checked}
              onChange={() => onChange(idea)}
              className="sr-only"
            />
            <span
              aria-hidden
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                checked ? "border-chrome bg-chrome text-on-chrome" : "border-line bg-transparent"
              }`}
            >
              {checked ? (
                <svg viewBox="0 0 16 16" width={11} height={11} fill="none" aria-hidden>
                  <path d="M3 8.5 6.2 11.5 13 4.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </span>
            <span>{idea}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
