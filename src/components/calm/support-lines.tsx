import { Phone, ChatText, Globe } from "@phosphor-icons/react/dist/ssr";
import { contactHref } from "@/lib/help";
import type { SupportLine } from "@/lib/safety/crisis";

function iconFor(contact: string) {
  if (/^text\b/i.test(contact)) return ChatText;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(contact)) return Globe;
  return Phone;
}

function ContactLink({ contact }: { contact: string }) {
  const href = contactHref(contact);
  if (!href) return <span className="tabular block py-2 text-lg font-semibold text-ink">{contact}</span>;
  const web = href.startsWith("https");
  return (
    <a
      href={href}
      className="tabular inline-flex min-h-11 items-center text-lg font-semibold text-ink underline"
      {...(web ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {contact}
      {web ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </a>
  );
}

/**
 * The support lines for a country as a list of paper rows, each contact
 * tappable when it can be. A service that also takes texts shows that as a
 * second link, for people who would rather not speak.
 */
export function SupportLines({ lines }: { lines: SupportLine[] }) {
  return (
    <ul role="list" className="grid list-none gap-3 p-0">
      {lines.map((line) => {
        const Icon = iconFor(line.contact);
        return (
          <li key={line.name} className="flex items-start gap-4 rounded-card bg-surface p-4 shadow-card">
            <span aria-hidden className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-chrome text-on-chrome">
              <Icon size={22} weight="regular" />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-ink">{line.name}</span>
              <span className="flex flex-wrap gap-x-5">
                <ContactLink contact={line.contact} />
                {line.text ? <ContactLink contact={line.text} /> : null}
              </span>
              <span className="block text-muted">{line.note}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
