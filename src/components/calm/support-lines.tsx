import { Phone, ChatText, Globe } from "@phosphor-icons/react/dist/ssr";
import { contactHref } from "@/lib/help";
import type { SupportLine } from "@/lib/safety/crisis";

function iconFor(contact: string) {
  if (/^text\b/i.test(contact)) return ChatText;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(contact)) return Globe;
  return Phone;
}

/** The support lines for a country as a list of paper rows, each contact tappable when it can be. */
export function SupportLines({ lines }: { lines: SupportLine[] }) {
  return (
    <ul role="list" className="grid list-none gap-3 p-0">
      {lines.map((line) => {
        const href = contactHref(line.contact);
        const Icon = iconFor(line.contact);
        return (
          <li key={line.name} className="flex items-start gap-4 rounded-card bg-surface p-4 shadow-card">
            <span aria-hidden className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-chrome text-on-chrome">
              <Icon size={22} weight="regular" />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-ink">{line.name}</span>
              {href ? (
                <a
                  href={href}
                  className="tabular inline-flex min-h-11 items-center text-lg font-semibold text-ink underline"
                  {...(href.startsWith("https") ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  {line.contact}
                </a>
              ) : (
                <span className="tabular block py-2 text-lg font-semibold text-ink">{line.contact}</span>
              )}
              <span className="block text-muted">{line.note}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
