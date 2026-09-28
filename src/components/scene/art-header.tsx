import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Lottie } from "@/components/ui/lottie";

/**
 * A page header: optional back link, the title and a short line. Kit and
 * Badges pass a small Lottie animation (public/lottie) shown beside the
 * title; other pages are text only.
 */
export function ArtHeader({
  title,
  line,
  lottie,
  back,
  reading = false,
}: {
  title: string;
  line?: string;
  /** A Lottie animation beside the title, e.g. "/lottie/kit.json". */
  lottie?: string;
  /** A back link above the title (e.g. About goes back to Me). */
  back?: { href: string; label: string };
  /** Line the title up with a 720px reading column instead of the 1100px page. */
  reading?: boolean;
}) {
  return (
    <header
      className={`mx-auto flex items-center justify-between gap-4 px-4 pt-6 md:px-8 md:pt-10 ${reading ? "max-w-[720px]" : "max-w-[1100px]"}`}
    >
      <div>
        {back ? (
          <Link href={back.href} className="-ml-2 mb-1 inline-flex min-h-11 items-center gap-2 rounded-full px-2 font-semibold text-muted hover:text-ink">
            <ArrowLeft size={20} weight="bold" aria-hidden />
            {back.label}
          </Link>
        ) : null}
        <h1 className="text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] text-ink">{title}</h1>
        {line ? <p className="mt-1 max-w-[40ch] text-muted">{line}</p> : null}
      </div>
      {lottie ? <Lottie src={lottie} loop className="size-24 shrink-0 sm:size-32 md:size-40" /> : null}
    </header>
  );
}
